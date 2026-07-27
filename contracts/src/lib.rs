#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, IntoVal, String, Symbol, Vec, log,
};

// ── Data structures ──────────────────────────────────────────────────────────
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct PaymentRecord {
    pub sender: Address,
    pub recipient: Address,
    pub amount: i128,
    pub timestamp: u64,
    pub memo: String,
}

// ── PaymentValidator Contract ────────────────────────────────────────────────
#[contract]
pub struct PaymentValidator;

const LIMIT_KEY: Symbol = symbol_short!("LIMIT");
const DEFAULT_LIMIT: i128 = 10_000_0000000i128; // 10,000 XLM in stroops

#[contractimpl]
impl PaymentValidator {
    pub fn validate_payment(
        env: Env,
        amount: i128,
        _recipient: Address,
        memo: String,
    ) -> bool {
        let limit = Self::get_payment_limit(env.clone());

        if amount <= 0 {
            env.events().publish(
                (symbol_short!("Validated"),),
                (false, String::from_str(&env, "non_positive_amount")),
            );
            return false;
        }

        if amount > limit {
            env.events().publish(
                (symbol_short!("LimitOver"),),
                (amount, limit),
            );
            return false;
        }

        if memo.len() > 28 {
            env.events().publish(
                (symbol_short!("Validated"),),
                (false, String::from_str(&env, "memo_too_long")),
            );
            return false;
        }

        env.events().publish(
            (symbol_short!("Validated"),),
            (true, String::from_str(&env, "ok")),
        );

        true
    }

    pub fn set_max_payment_limit(env: Env, caller: Address, limit: i128) {
        caller.require_auth();
        if limit <= 0 {
            panic!("Limit must be positive");
        }
        env.storage().instance().set(&LIMIT_KEY, &limit);
    }

    pub fn get_payment_limit(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&LIMIT_KEY)
            .unwrap_or(DEFAULT_LIMIT)
    }
}

// ── PaymentHub Contract ──────────────────────────────────────────────────────
#[contract]
pub struct PaymentHub;

const PAYMENTS_KEY: Symbol = symbol_short!("PAYMENTS");
const TOTAL_SENT: Symbol = symbol_short!("TOTALSENT");
const PAY_COUNT: Symbol = symbol_short!("PAYCOUNT");
const VALIDATOR_KEY: Symbol = symbol_short!("VALADDR");

#[contractimpl]
impl PaymentHub {
    pub fn set_validator(env: Env, validator: Address) {
        env.storage().instance().set(&VALIDATOR_KEY, &validator);
    }

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

        // Inter-contract validation
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

        // Standard validation checks
        if amount <= 0 {
            log!(&env, "Payment failed: non-positive amount {}", amount);
            env.events().publish(
                (symbol_short!("PayFailed"), sender.clone()),
                (recipient.clone(), String::from_str(&env, "invalid_amount")),
            );
            panic!("Amount must be positive");
        }

        const MAX_LIMIT: i128 = 1_000_000_0000000;
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

        let timestamp = env.ledger().timestamp();
        let record = PaymentRecord {
            sender: sender.clone(),
            recipient: recipient.clone(),
            amount,
            timestamp,
            memo: memo.clone(),
        };

        let mut history: Vec<PaymentRecord> = env
            .storage()
            .instance()
            .get(&PAYMENTS_KEY)
            .unwrap_or_else(|| Vec::new(&env));

        if history.len() >= 50 {
            let mut trimmed = Vec::new(&env);
            for i in 1..history.len() {
                trimmed.push_back(history.get(i).unwrap());
            }
            history = trimmed;
        }

        history.push_back(record);
        env.storage().instance().set(&PAYMENTS_KEY, &history);

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

        env.events().publish(
            (symbol_short!("PayRecvd"), sender.clone()),
            (recipient.clone(), amount, timestamp),
        );
    }

    pub fn get_payment_history(env: Env) -> Vec<PaymentRecord> {
        env.storage()
            .instance()
            .get(&PAYMENTS_KEY)
            .unwrap_or_else(|| Vec::new(&env))
    }

    pub fn get_total_sent(env: Env, user: Address) -> i128 {
        let key = (TOTAL_SENT, user);
        env.storage().instance().get(&key).unwrap_or(0i128)
    }

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

    // 1. Valid payment succeeds
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
            &1000i128,
            &make_string(&env, "Test payment"),
        );

        let history = client.get_payment_history();
        assert_eq!(history.len(), 1);
        assert_eq!(history.get(0).unwrap().amount, 1000i128);
    }

    // 2. Invalid amount rejected (e.g. 0 amount)
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

    // 3. Negative amount rejected
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

    // 4. Payment history recorded
    #[test]
    fn test_payment_history_recorded() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentHub);
        let client = PaymentHubClient::new(&env, &contract_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        env.mock_all_auths();

        client.send_payment(&sender, &recipient, &100i128, &make_string(&env, "first"));
        client.send_payment(&sender, &recipient, &200i128, &make_string(&env, "second"));

        let history = client.get_payment_history();
        assert_eq!(history.len(), 2);
    }

    // 5. Inter-contract call works
    #[test]
    fn test_inter_contract_call_works() {
        let env = make_env();
        let hub_id = env.register_contract(None, PaymentHub);
        let hub_client = PaymentHubClient::new(&env, &hub_id);

        let validator_id = env.register_contract(None, PaymentValidator);
        hub_client.set_validator(&validator_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        env.mock_all_auths();

        // Default limit is 10,000 XLM (100,000,000,000 stroops).
        // 50 XLM (500,000,000 stroops) is valid.
        hub_client.send_payment(&sender, &recipient, &500_000_000i128, &make_string(&env, "ok"));
        let history = hub_client.get_payment_history();
        assert_eq!(history.len(), 1);
    }

    // 6. Event emitted correctly
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

    // 7. Limit exceeded event fired
    #[test]
    fn test_limit_exceeded_event_fired() {
        let env = make_env();
        let hub_id = env.register_contract(None, PaymentHub);
        let hub_client = PaymentHubClient::new(&env, &hub_id);

        let validator_id = env.register_contract(None, PaymentValidator);
        hub_client.set_validator(&validator_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        env.mock_all_auths();

        // Limit is 10,000 XLM (100,000,000,000 stroops).
        // Let's send 10,001 XLM (100,010,000,000 stroops).
        // Use try_invoke_contract to run without crashing the test thread on panic, allowing us to inspect events!
        let result = env.try_invoke_contract::<(), soroban_sdk::Error>(
            &hub_id,
            &Symbol::new(&env, "send_payment"),
            (sender.clone(), recipient.clone(), 100_010_000_000i128, make_string(&env, "too big")).into_val(&env),
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
