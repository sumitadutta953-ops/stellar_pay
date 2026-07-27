#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, IntoVal, String, Symbol, Vec, log,
};

// ── Storage keys ────────────────────────────────────────────────────────────
const PAYMENTS_KEY: Symbol = symbol_short!("PAYMENTS");
const TOTAL_SENT: Symbol = symbol_short!("TOTALSENT");
const PAY_COUNT: Symbol = symbol_short!("PAYCOUNT");
const VALIDATOR_KEY: Symbol = symbol_short!("VALADDR");

// ── Data structures ──────────────────────────────────────────────────────────
#[contracttype]
#[derive(Clone, Debug)]
pub struct PaymentRecord {
    pub sender: Address,
    pub recipient: Address,
    pub amount: i128,
    pub timestamp: u64,
    pub memo: String,
}

// ── Contract ─────────────────────────────────────────────────────────────────
#[contract]
pub struct PaymentHub;

#[contractimpl]
impl PaymentHub {
    /// Send a payment from caller to recipient.
    /// Validates via embedded logic (mirrors PaymentValidator rules).
    /// Set the validator contract address.
    pub fn set_validator(env: Env, validator: Address) {
        env.storage().instance().set(&VALIDATOR_KEY, &validator);
    }

    /// Get the current validator contract address.
    pub fn get_validator(env: Env) -> Option<Address> {
        env.storage().instance().get(&VALIDATOR_KEY)
    }

    pub fn send_payment(
        env: Env,
        sender: Address,
        recipient: Address,
        amount: i128,
        memo: String,
    ) {
        sender.require_auth();

        // ── Validator Inter-contract Call ─────────────────────────────────
        if let Some(validator) = Self::get_validator(env.clone()) {
            let is_valid: bool = env.invoke_contract(
                &validator,
                &Symbol::new(&env, "validate_payment"),
                (amount, recipient.clone(), memo.clone()).into_val(&env),
            );
            if !is_valid {
                log!(&env, "Payment failed: validator rejected amount {}", amount);
                env.events().publish(
                    (symbol_short!("PayFailed"), sender.clone()),
                    (recipient.clone(), String::from_str(&env, "validator_rejected")),
                );
                
                // Let's check if it exceeded limit to fire LimitOver event
                let limit: i128 = env.invoke_contract(
                    &validator,
                    &Symbol::new(&env, "get_payment_limit"),
                    ().into_val(&env),
                );
                if amount > limit {
                    env.events().publish(
                        (symbol_short!("LimitOver"), sender.clone()),
                        (amount, limit),
                    );
                }
                panic!("Payment validation failed by PaymentValidator");
            }
        }

        // ── Validation (mirrors PaymentValidator) ──────────────────────────
        if amount <= 0 {
            log!(&env, "Payment failed: non-positive amount {}", amount);
            env.events().publish(
                (symbol_short!("PayFailed"), sender.clone()),
                (recipient.clone(), String::from_str(&env, "invalid_amount")),
            );
            panic!("Amount must be positive");
        }

        const MAX_LIMIT: i128 = 1_000_000_0000000; // 1,000,000 XLM in stroops
        if amount > MAX_LIMIT {
            log!(&env, "Payment failed: amount {} exceeds limit {}", amount, MAX_LIMIT);
            env.events().publish(
                (symbol_short!("LimitOver"), sender.clone()),
                (amount, MAX_LIMIT),
            );
            panic!("Amount exceeds payment limit");
        }

        let memo_len = memo.len();
        if memo_len > 28 {
            panic!("Memo too long (max 28 chars)");
        }

        // ── Record payment ─────────────────────────────────────────────────
        let timestamp = env.ledger().timestamp();

        let record = PaymentRecord {
            sender: sender.clone(),
            recipient: recipient.clone(),
            amount,
            timestamp,
            memo: memo.clone(),
        };

        // Load existing history
        let mut history: Vec<PaymentRecord> = env
            .storage()
            .instance()
            .get(&PAYMENTS_KEY)
            .unwrap_or_else(|| Vec::new(&env));

        // Keep last 50 payments
        if history.len() >= 50 {
            let mut trimmed = Vec::new(&env);
            for i in 1..history.len() {
                trimmed.push_back(history.get(i).unwrap());
            }
            history = trimmed;
        }

        history.push_back(record);
        env.storage().instance().set(&PAYMENTS_KEY, &history);
        env.storage().instance().extend_ttl(100, 10_000);

        // ── Update totals ──────────────────────────────────────────────────
        let sender_key = (TOTAL_SENT, sender.clone());
        let prev_total: i128 = env
            .storage()
            .instance()
            .get(&sender_key)
            .unwrap_or(0i128);
        env.storage().instance().set(&sender_key, &(prev_total + amount));

        let count_key = (PAY_COUNT, sender.clone());
        let prev_count: u32 = env
            .storage()
            .instance()
            .get(&count_key)
            .unwrap_or(0u32);
        env.storage().instance().set(&count_key, &(prev_count + 1));

        // ── Emit PaymentReceived event ─────────────────────────────────────
        env.events().publish(
            (symbol_short!("PayRecvd"), sender.clone()),
            (recipient.clone(), amount, timestamp),
        );

        log!(&env, "Payment recorded: {} -> {}, amount={}", sender, recipient, amount);
    }

    /// Returns the full payment history (up to 50 records).
    pub fn get_payment_history(env: Env) -> Vec<PaymentRecord> {
        env.storage()
            .instance()
            .get(&PAYMENTS_KEY)
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Returns total XLM (in stroops) sent by a user.
    pub fn get_total_sent(env: Env, user: Address) -> i128 {
        let key = (TOTAL_SENT, user);
        env.storage().instance().get(&key).unwrap_or(0i128)
    }

    /// Returns number of payments made by a user.
    pub fn get_payment_count(env: Env, user: Address) -> u32 {
        let key = (PAY_COUNT, user);
        env.storage().instance().get(&key).unwrap_or(0u32)
    }
}

// ── Tests ────────────────────────────────────────────────────────────────────
#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::{Address as _, Events}, Env, String, FromVal};

    fn make_env() -> Env {
        Env::default()
    }

    fn make_string(env: &Env, s: &str) -> String {
        String::from_str(env, s)
    }

    #[test]
    fn test_valid_payment_succeeds() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentHub);
        let client = PaymentHubClient::new(&env, &contract_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        env.mock_all_auths();

        client.send_payment(
            &sender,
            &recipient,
            &1_000_0000000i128,
            &make_string(&env, "Test payment"),
        );

        let history = client.get_payment_history();
        assert_eq!(history.len(), 1);
        assert_eq!(history.get(0).unwrap().amount, 1_000_0000000i128);
    }

    #[test]
    #[should_panic(expected = "Amount must be positive")]
    fn test_negative_amount_rejected() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentHub);
        let client = PaymentHubClient::new(&env, &contract_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        env.mock_all_auths();

        client.send_payment(&sender, &recipient, &-100i128, &make_string(&env, "bad"));
    }

    #[test]
    #[should_panic(expected = "Amount must be positive")]
    fn test_zero_amount_rejected() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentHub);
        let client = PaymentHubClient::new(&env, &contract_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        env.mock_all_auths();

        client.send_payment(&sender, &recipient, &0i128, &make_string(&env, "zero"));
    }

    #[test]
    fn test_payment_history_recorded() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentHub);
        let client = PaymentHubClient::new(&env, &contract_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        env.mock_all_auths();

        client.send_payment(&sender, &recipient, &500_0000000i128, &make_string(&env, "first"));
        client.send_payment(&sender, &recipient, &250_0000000i128, &make_string(&env, "second"));

        let history = client.get_payment_history();
        assert_eq!(history.len(), 2);
    }

    #[test]
    fn test_total_sent_accumulates() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentHub);
        let client = PaymentHubClient::new(&env, &contract_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        env.mock_all_auths();

        client.send_payment(&sender, &recipient, &100_0000000i128, &make_string(&env, "a"));
        client.send_payment(&sender, &recipient, &200_0000000i128, &make_string(&env, "b"));

        let total = client.get_total_sent(&sender);
        assert_eq!(total, 300_0000000i128);
    }

    #[test]
    fn test_payment_count_increments() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentHub);
        let client = PaymentHubClient::new(&env, &contract_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        env.mock_all_auths();

        client.send_payment(&sender, &recipient, &10_0000000i128, &make_string(&env, "1"));
        client.send_payment(&sender, &recipient, &10_0000000i128, &make_string(&env, "2"));
        client.send_payment(&sender, &recipient, &10_0000000i128, &make_string(&env, "3"));

        let count = client.get_payment_count(&sender);
        assert_eq!(count, 3u32);
    }

    #[test]
    #[should_panic(expected = "Amount exceeds payment limit")]
    fn test_limit_exceeded_rejected() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentHub);
        let client = PaymentHubClient::new(&env, &contract_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        env.mock_all_auths();

        // Exceeds 1,000,000 XLM limit
        client.send_payment(
            &sender,
            &recipient,
            &999_999_999_0000000i128,
            &make_string(&env, "too big"),
        );
    }

    #[test]
    #[should_panic(expected = "Memo too long")]
    fn test_memo_too_long_rejected() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentHub);
        let client = PaymentHubClient::new(&env, &contract_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        env.mock_all_auths();

        client.send_payment(
            &sender,
            &recipient,
            &10_0000000i128,
            &make_string(&env, "this memo is way too long to fit in the 28 char limit!!"),
        );
    }

    #[test]
    fn test_initial_state_empty() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentHub);
        let client = PaymentHubClient::new(&env, &contract_id);

        let user = Address::generate(&env);

        let history = client.get_payment_history();
        assert_eq!(history.len(), 0);

        let total = client.get_total_sent(&user);
        assert_eq!(total, 0i128);

        let count = client.get_payment_count(&user);
        assert_eq!(count, 0u32);
    }

    #[contract]
    struct MockValidator;

    #[contractimpl]
    impl MockValidator {
        pub fn validate_payment(
            _env: Env,
            amount: i128,
            _recipient: Address,
            _memo: String,
        ) -> bool {
            amount <= 1000
        }

        pub fn get_payment_limit(_env: Env) -> i128 {
            1000
        }
    }

    #[test]
    fn test_inter_contract_call_works() {
        let env = make_env();
        let hub_id = env.register_contract(None, PaymentHub);
        let hub_client = PaymentHubClient::new(&env, &hub_id);

        let validator_id = env.register_contract(None, MockValidator);
        hub_client.set_validator(&validator_id);
        assert_eq!(hub_client.get_validator(), Some(validator_id.clone()));

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        env.mock_all_auths();

        // 1. Valid payment (amount <= 1000) succeeds
        hub_client.send_payment(&sender, &recipient, &500i128, &make_string(&env, "ok"));
        let history = hub_client.get_payment_history();
        assert_eq!(history.len(), 1);
        assert_eq!(history.get(0).unwrap().amount, 500i128);
    }

    #[test]
    #[should_panic(expected = "Payment validation failed by PaymentValidator")]
    fn test_inter_contract_validation_rejects() {
        let env = make_env();
        let hub_id = env.register_contract(None, PaymentHub);
        let hub_client = PaymentHubClient::new(&env, &hub_id);

        let validator_id = env.register_contract(None, MockValidator);
        hub_client.set_validator(&validator_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        env.mock_all_auths();

        // 2. Invalid payment (amount > 1000) fails and panics
        hub_client.send_payment(&sender, &recipient, &1500i128, &make_string(&env, "too big"));
    }

    #[test]
    fn test_event_emitted_correctly() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentHub);
        let client = PaymentHubClient::new(&env, &contract_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        env.mock_all_auths();

        client.send_payment(
            &sender,
            &recipient,
            &1000i128,
            &make_string(&env, "event test"),
        );

        let events = env.events().all();
        assert!(events.len() > 0);
        let last_event = events.get(events.len() - 1).unwrap();
        let topics = last_event.1;
        assert_eq!(
            soroban_sdk::Symbol::from_val(&env, &topics.get(0).unwrap()),
            symbol_short!("PayRecvd")
        );
    }

    #[test]
    fn test_limit_exceeded_event_fired() {
        let env = make_env();
        let hub_id = env.register_contract(None, PaymentHub);
        let hub_client = PaymentHubClient::new(&env, &hub_id);

        let validator_id = env.register_contract(None, MockValidator);
        hub_client.set_validator(&validator_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        env.mock_all_auths();

        // Use try_invoke_contract to run without crashing the test thread on panic, allowing us to inspect events!
        let result = env.try_invoke_contract::<(), soroban_sdk::Error>(
            &hub_id,
            &Symbol::new(&env, "send_payment"),
            (sender.clone(), recipient.clone(), 1500i128, make_string(&env, "too big")).into_val(&env),
        );
        assert!(result.is_err());

        // Assert that the LimitOver event was fired!
        let events = env.events().all();
        let mut found_limit_over = false;
        for event in events.iter() {
            let topics = event.1;
            if topics.len() > 0
                && soroban_sdk::Symbol::from_val(&env, &topics.get(0).unwrap())
                    == symbol_short!("LimitOver")
            {
                found_limit_over = true;
            }
        }
        assert!(found_limit_over);
    }
}
