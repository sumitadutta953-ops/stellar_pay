#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, Ledger},
        token::StellarAssetContractClient,
        Env, String, Vec,
    };
    use crate::Ruling; // Make sure Ruling is accessible

    // We need to define the ArbitrationContract stub or client in the test if it's in another crate.
    // Since we're compiling in the same workspace, we can just use the ArbitrationContract directly!
    // To do that, we can use the arbitration crate, but we can also just register ArbitrationContract here
    // by importing it or since we are in a cargo workspace, let's declare its struct locally or import it.
    // Wait, the cleanest way is to write a mock ArbitrationContract or import the real one.
    // Let's import the real one! Can we import `arbitration::ArbitrationContract`?
    // Wait, in Cargo.toml of `escrow`, we don't have `arbitration` as a dependency.
    // To keep it simple and compile-time decoupled, we can implement a mock ArbitrationContract in this test!
    // This is a standard unit testing pattern: we mock the ArbitrationContract so that we test EscrowContract in isolation.
    // Let's implement the MockArbitrationContract:

    #[contract]
    pub struct MockArbitrationContract;

    #[contractimpl]
    impl MockArbitrationContract {
        pub fn initialize(_env: Env, _arbitrator: Address) {}

        pub fn open_case(
            env: Env,
            escrow_id: u32,
            milestone_id: u32,
            _reason: String,
        ) -> u32 {
            // Retrieve case counter or simulate it
            let caller = env.caller();
            // Publish event similar to the real one
            env.events().publish(
                (symbol_short!("CaseOpen"), 123u32),
                (caller, escrow_id, milestone_id),
            );
            123u32 // Mock case ID
        }

        pub fn resolve_case(
            env: Env,
            escrow_contract: Address,
            escrow_id: u32,
            milestone_id: u32,
            ruling: Ruling,
        ) {
            // Call resolve_dispute on escrow contract
            env.invoke_contract::<()>(
                &escrow_contract,
                &Symbol::new(&env, "resolve_dispute"),
                (escrow_id, milestone_id, ruling).into_val(&env),
            );
        }
    }

    fn make_env() -> Env {
        Env::default()
    }

    fn create_milestone(env: &Env, id: u32, desc: &str, amount: i128) -> Milestone {
        Milestone {
            id,
            description: String::from_str(env, desc),
            amount,
            status: MilestoneStatus::Pending,
        }
    }

    #[test]
    fn test_happy_path_escrow() {
        let env = make_env();
        env.mock_all_auths();

        let client_addr = Address::generate(&env);
        let vendor_addr = Address::generate(&env);
        let arb_addr = Address::generate(&env);

        let token_admin = Address::generate(&env);
        let token_address = env.register_stellar_asset_contract(token_admin.clone());
        let sac_client = StellarAssetContractClient::new(&env, &token_address);
        let token_client = soroban_sdk::token::Client::new(&env, &token_address);

        // Mint tokens to client
        sac_client.mint(&client_addr, &1000i128);
        assert_eq!(token_client.balance(&client_addr), 1000i128);

        let escrow_id = env.register_contract(None, EscrowContract);
        let escrow_client = EscrowContractClient::new(&env, &escrow_id);

        let arbitration_id = env.register_contract(None, MockArbitrationContract);

        let mut milestones = Vec::new(&env);
        milestones.push_back(create_milestone(&env, 1, "Milestone 1", 400));
        milestones.push_back(create_milestone(&env, 2, "Milestone 2", 600));

        // Create escrow (Total = 1000)
        let id = escrow_client.create_escrow(&client_addr, &vendor_addr, &arbitration_id, &milestones, &token_address);
        assert_eq!(id, 1);

        let esc = escrow_client.get_escrow(&id);
        assert_eq!(esc.funded, false);
        assert_eq!(esc.completed, false);

        // Fund escrow
        escrow_client.fund(&id);
        assert_eq!(token_client.balance(&client_addr), 0i128);
        assert_eq!(token_client.balance(&escrow_id), 1000i128);
        
        let esc = escrow_client.get_escrow(&id);
        assert_eq!(esc.funded, true);

        // Approve milestone 1
        escrow_client.approve_milestone(&id, &1);
        assert_eq!(token_client.balance(&vendor_addr), 400i128);
        assert_eq!(token_client.balance(&escrow_id), 600i128);

        let esc = escrow_client.get_escrow(&id);
        assert_eq!(esc.milestones.get(0).unwrap().status, MilestoneStatus::Approved);

        // Approve milestone 2
        escrow_client.approve_milestone(&id, &2);
        assert_eq!(token_client.balance(&vendor_addr), 1000i128);
        assert_eq!(token_client.balance(&escrow_id), 0i128);

        let esc = escrow_client.get_escrow(&id);
        assert_eq!(esc.completed, true);
    }

    #[test]
    fn test_dispute_resolution_vendor_wins() {
        let env = make_env();
        env.mock_all_auths();

        let client_addr = Address::generate(&env);
        let vendor_addr = Address::generate(&env);

        let token_admin = Address::generate(&env);
        let token_address = env.register_stellar_asset_contract(token_admin.clone());
        let sac_client = StellarAssetContractClient::new(&env, &token_address);
        let token_client = soroban_sdk::token::Client::new(&env, &token_address);

        sac_client.mint(&client_addr, &500i128);

        let escrow_id = env.register_contract(None, EscrowContract);
        let escrow_client = EscrowContractClient::new(&env, &escrow_id);

        let arbitration_id = env.register_contract(None, MockArbitrationContract);
        let arbitration_client = MockArbitrationContractClient::new(&env, &arbitration_id);

        let mut milestones = Vec::new(&env);
        milestones.push_back(create_milestone(&env, 1, "Milestone 1", 500));

        let id = escrow_client.create_escrow(&client_addr, &vendor_addr, &arbitration_id, &milestones, &token_address);
        escrow_client.fund(&id);

        // Raise dispute by vendor
        escrow_client.raise_dispute(&vendor_addr, &id, &1, &String::from_str(&env, "Vendor claims completion"));

        let esc = escrow_client.get_escrow(&id);
        assert_eq!(esc.milestones.get(0).unwrap().status, MilestoneStatus::Disputed);

        // Resolve case: Release to vendor
        arbitration_client.resolve_case(&escrow_id, &id, &1, &Ruling::Release);

        let esc = escrow_client.get_escrow(&id);
        assert_eq!(esc.milestones.get(0).unwrap().status, MilestoneStatus::Released);
        assert_eq!(esc.completed, true);
        assert_eq!(token_client.balance(&vendor_addr), 500i128);
        assert_eq!(token_client.balance(&escrow_id), 0i128);
    }

    #[test]
    fn test_dispute_resolution_client_wins() {
        let env = make_env();
        env.mock_all_auths();

        let client_addr = Address::generate(&env);
        let vendor_addr = Address::generate(&env);

        let token_admin = Address::generate(&env);
        let token_address = env.register_stellar_asset_contract(token_admin.clone());
        let sac_client = StellarAssetContractClient::new(&env, &token_address);
        let token_client = soroban_sdk::token::Client::new(&env, &token_address);

        sac_client.mint(&client_addr, &500i128);

        let escrow_id = env.register_contract(None, EscrowContract);
        let escrow_client = EscrowContractClient::new(&env, &escrow_id);

        let arbitration_id = env.register_contract(None, MockArbitrationContract);
        let arbitration_client = MockArbitrationContractClient::new(&env, &arbitration_id);

        let mut milestones = Vec::new(&env);
        milestones.push_back(create_milestone(&env, 1, "Milestone 1", 500));

        let id = escrow_client.create_escrow(&client_addr, &vendor_addr, &arbitration_id, &milestones, &token_address);
        escrow_client.fund(&id);

        // Raise dispute by client
        escrow_client.raise_dispute(&client_addr, &id, &1, &String::from_str(&env, "Poor quality"));

        // Resolve case: Refund to client
        arbitration_client.resolve_case(&escrow_id, &id, &1, &Ruling::Refund);

        let esc = escrow_client.get_escrow(&id);
        assert_eq!(esc.milestones.get(0).unwrap().status, MilestoneStatus::Refunded);
        assert_eq!(esc.completed, true);
        assert_eq!(token_client.balance(&client_addr), 500i128);
        assert_eq!(token_client.balance(&escrow_id), 0i128);
    }

    #[test]
    #[should_panic(expected = "HostError: Error(Contract, #4)")]
    fn test_unauthorized_dispute_resolution() {
        let env = make_env();
        env.mock_all_auths();

        let client_addr = Address::generate(&env);
        let vendor_addr = Address::generate(&env);

        let token_admin = Address::generate(&env);
        let token_address = env.register_stellar_asset_contract(token_admin.clone());

        let escrow_id = env.register_contract(None, EscrowContract);
        let escrow_client = EscrowContractClient::new(&env, &escrow_id);

        let arbitration_id = env.register_contract(None, MockArbitrationContract);

        let mut milestones = Vec::new(&env);
        milestones.push_back(create_milestone(&env, 1, "Milestone 1", 500));

        let id = escrow_client.create_escrow(&client_addr, &vendor_addr, &arbitration_id, &milestones, &token_address);
        
        // Directly call resolve_dispute on escrow_client without matching caller (arbitration contract)
        // This should fail with NotAuthorized error (Error(Contract, #4) in custom enum)
        escrow_client.resolve_dispute(&id, &1, &Ruling::Release);
    }

    #[test]
    fn test_mutual_cancellation() {
        let env = make_env();
        env.mock_all_auths();

        let client_addr = Address::generate(&env);
        let vendor_addr = Address::generate(&env);

        let token_admin = Address::generate(&env);
        let token_address = env.register_stellar_asset_contract(token_admin.clone());
        let sac_client = StellarAssetContractClient::new(&env, &token_address);
        let token_client = soroban_sdk::token::Client::new(&env, &token_address);

        sac_client.mint(&client_addr, &1000i128);

        let escrow_id = env.register_contract(None, EscrowContract);
        let escrow_client = EscrowContractClient::new(&env, &escrow_id);

        let arbitration_id = env.register_contract(None, MockArbitrationContract);

        let mut milestones = Vec::new(&env);
        milestones.push_back(create_milestone(&env, 1, "Milestone 1", 400));
        milestones.push_back(create_milestone(&env, 2, "Milestone 2", 600));

        let id = escrow_client.create_escrow(&client_addr, &vendor_addr, &arbitration_id, &milestones, &token_address);
        escrow_client.fund(&id);

        // Approve milestone 1
        escrow_client.approve_milestone(&id, &1);

        // Cancel escrow mutually. Remaining pending is Milestone 2 (600)
        escrow_client.cancel_escrow(&id);

        let esc = escrow_client.get_escrow(&id);
        assert_eq!(esc.completed, true);
        assert_eq!(esc.milestones.get(1).unwrap().status, MilestoneStatus::Refunded);

        // Client gets back 600
        assert_eq!(token_client.balance(&client_addr), 600i128);
        assert_eq!(token_client.balance(&vendor_addr), 400i128);
        assert_eq!(token_client.balance(&escrow_id), 0i128);
    }
}
