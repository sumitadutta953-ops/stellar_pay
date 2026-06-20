#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String, Symbol,
};

// ── Storage keys ─────────────────────────────────────────────────────────────
const LIMIT_KEY: Symbol = symbol_short!("LIMIT");

// ── Default max payment: 10,000 XLM in stroops ───────────────────────────────
const DEFAULT_LIMIT: i128 = 10_000_0000000i128;

// ── Contract ──────────────────────────────────────────────────────────────────
#[contract]
pub struct PaymentValidator;

#[contractimpl]
impl PaymentValidator {
    /// Validate a proposed payment. Returns true if valid, panics if invalid.
    pub fn validate_payment(
        env: Env,
        amount: i128,
        _recipient: Address,
        memo: String,
    ) -> bool {
        let limit = Self::get_payment_limit(env.clone());

        // Rule 1: amount must be positive
        if amount <= 0 {
            env.events().publish(
                (symbol_short!("Validated"),),
                (false, String::from_str(&env, "non_positive_amount")),
            );
            return false;
        }

        // Rule 2: amount must not exceed limit
        if amount > limit {
            env.events().publish(
                (symbol_short!("LimitOver"),),
                (amount, limit),
            );
            return false;
        }

        // Rule 3: memo must be ≤ 28 chars
        if memo.len() > 28 {
            env.events().publish(
                (symbol_short!("Validated"),),
                (false, String::from_str(&env, "memo_too_long")),
            );
            return false;
        }

        // All checks passed
        env.events().publish(
            (symbol_short!("Validated"),),
            (true, String::from_str(&env, "ok")),
        );

        true
    }

    /// Set the maximum allowed payment (admin function).
    pub fn set_max_payment_limit(env: Env, caller: Address, limit: i128) {
        caller.require_auth();
        if limit <= 0 {
            panic!("Limit must be positive");
        }
        env.storage().instance().set(&LIMIT_KEY, &limit);
        env.storage().instance().extend_ttl(100, 10_000);
    }

    /// Get the current payment limit.
    pub fn get_payment_limit(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&LIMIT_KEY)
            .unwrap_or(DEFAULT_LIMIT)
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────
#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, String};

    fn make_env() -> Env {
        Env::default()
    }

    fn make_string(env: &Env, s: &str) -> String {
        String::from_str(env, s)
    }

    #[test]
    fn test_valid_payment_passes() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentValidator);
        let client = PaymentValidatorClient::new(&env, &contract_id);

        let recipient = Address::generate(&env);
        let result = client.validate_payment(
            &1_000_0000000i128,
            &recipient,
            &make_string(&env, "valid memo"),
        );
        assert!(result);
    }

    #[test]
    fn test_negative_amount_fails() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentValidator);
        let client = PaymentValidatorClient::new(&env, &contract_id);

        let recipient = Address::generate(&env);
        let result = client.validate_payment(&-1i128, &recipient, &make_string(&env, "bad"));
        assert!(!result);
    }

    #[test]
    fn test_zero_amount_fails() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentValidator);
        let client = PaymentValidatorClient::new(&env, &contract_id);

        let recipient = Address::generate(&env);
        let result = client.validate_payment(&0i128, &recipient, &make_string(&env, "zero"));
        assert!(!result);
    }

    #[test]
    fn test_exceeds_limit_fails() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentValidator);
        let client = PaymentValidatorClient::new(&env, &contract_id);

        let recipient = Address::generate(&env);
        // Default limit is 10,000 XLM; send 10,001 XLM
        let result = client.validate_payment(
            &10_001_0000000i128,
            &recipient,
            &make_string(&env, "big"),
        );
        assert!(!result);
    }

    #[test]
    fn test_memo_too_long_fails() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentValidator);
        let client = PaymentValidatorClient::new(&env, &contract_id);

        let recipient = Address::generate(&env);
        let result = client.validate_payment(
            &100_0000000i128,
            &recipient,
            &make_string(&env, "this memo is definitely way too long for the 28 char limit"),
        );
        assert!(!result);
    }

    #[test]
    fn test_default_limit_is_correct() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentValidator);
        let client = PaymentValidatorClient::new(&env, &contract_id);

        let limit = client.get_payment_limit();
        assert_eq!(limit, 10_000_0000000i128);
    }

    #[test]
    fn test_set_limit_changes_validation() {
        let env = make_env();
        let contract_id = env.register_contract(None, PaymentValidator);
        let client = PaymentValidatorClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        env.mock_all_auths();

        // Lower limit to 100 XLM
        client.set_max_payment_limit(&admin, &100_0000000i128);

        let recipient = Address::generate(&env);
        // 200 XLM should now fail
        let result = client.validate_payment(
            &200_0000000i128,
            &recipient,
            &make_string(&env, "now too big"),
        );
        assert!(!result);

        // 50 XLM should pass
        let result2 = client.validate_payment(
            &50_0000000i128,
            &recipient,
            &make_string(&env, "ok"),
        );
        assert!(result2);
    }
}
