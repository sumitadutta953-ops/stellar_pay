#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, String};

    #[contract]
    pub struct MockEscrowContract;

    #[contractimpl]
    impl MockEscrowContract {
        pub fn call_open_case(
            env: Env,
            arbitration: Address,
            escrow_id: u32,
            milestone_id: u32,
            reason: String,
        ) -> u32 {
            let client = ArbitrationContractClient::new(&env, &arbitration);
            // This will return Result<u32, Error>, so we unwrap it
            client.open_case(&escrow_id, &milestone_id, &reason)
        }

        pub fn resolve_dispute(
            _env: Env,
            _escrow_id: u32,
            _milestone_id: u32,
            _ruling: Ruling,
        ) {
            // Mock resolve_dispute implementation
        }
    }

    fn make_env() -> Env {
        Env::default()
    }

    #[test]
    fn test_initialize_and_get_arbitrator() {
        let env = make_env();
        let arbitration_id = env.register_contract(None, ArbitrationContract);
        let client = ArbitrationContractClient::new(&env, &arbitration_id);

        let arbitrator = Address::generate(&env);
        client.initialize(&arbitrator);

        assert_eq!(client.get_arbitrator(), arbitrator);

        // Initializing again should fail
        let another_arbitrator = Address::generate(&env);
        let res = client.try_initialize(&another_arbitrator);
        assert!(res.is_err());
    }

    #[test]
    fn test_open_case_and_resolve() {
        let env = make_env();
        let arbitration_id = env.register_contract(None, ArbitrationContract);
        let client = ArbitrationContractClient::new(&env, &arbitration_id);

        let arbitrator = Address::generate(&env);
        client.initialize(&arbitrator);

        let mock_escrow_id = env.register_contract(None, MockEscrowContract);
        let mock_escrow_client = MockEscrowContractClient::new(&env, &mock_escrow_id);

        let reason = String::from_str(&env, "Vendor did not deliver the code on time.");
        
        env.mock_all_auths();

        // Open case via mock escrow contract
        let case_id = mock_escrow_client.call_open_case(&arbitration_id, &1u32, &0u32, &reason);
        assert_eq!(case_id, 1);

        // Retrieve and check case details
        let case = client.get_case(&case_id);
        assert_eq!(case.id, 1);
        assert_eq!(case.escrow_contract, mock_escrow_id);
        assert_eq!(case.escrow_id, 1);
        assert_eq!(case.milestone_id, 0);
        assert_eq!(case.resolved, false);
        assert!(case.ruling.is_none());

        // Resolve case by arbitrator
        client.resolve_case(&case_id, &Ruling::Release);

        // Verify state after resolution
        let resolved_case = client.get_case(&case_id);
        assert_eq!(resolved_case.resolved, true);
        assert_eq!(resolved_case.ruling, Some(Ruling::Release));
    }

    #[test]
    #[should_panic]
    fn test_unauthorized_resolve_case() {
        let env = make_env();
        let arbitration_id = env.register_contract(None, ArbitrationContract);
        let client = ArbitrationContractClient::new(&env, &arbitration_id);

        let arbitrator = Address::generate(&env);
        client.initialize(&arbitrator);

        let mock_escrow_id = env.register_contract(None, MockEscrowContract);
        let mock_escrow_client = MockEscrowContractClient::new(&env, &mock_escrow_id);

        let reason = String::from_str(&env, "Dispute");
        let case_id = mock_escrow_client.call_open_case(&arbitration_id, &1u32, &0u32, &reason);

        // Calling resolve_case without mocking arbitrator auth should fail and panic.
        client.resolve_case(&case_id, &Ruling::Release);
    }
}
