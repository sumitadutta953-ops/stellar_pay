#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, symbol_short,
    Address, Env, IntoVal, String, Symbol, log,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, Ord, PartialOrd)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    NotAuthorized = 3,
    NotFound = 4,
    AlreadyResolved = 5,
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Ruling {
    Pending = 0,
    Release = 1, // Vendor wins
    Refund = 2,  // Client wins
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Case {
    pub id: u32,
    pub escrow_contract: Address,
    pub escrow_id: u32,
    pub milestone_id: u32,
    pub reason: String,
    pub resolved: bool,
    pub ruling: Ruling,
}

#[contract]
pub struct ArbitrationContract;

const ARBITRATOR_KEY: Symbol = symbol_short!("ARBITRTR");
const CASE_COUNTER_KEY: Symbol = symbol_short!("CASECNT");

#[contractimpl]
impl ArbitrationContract {
    pub fn initialize(env: Env, arbitrator: Address) -> Result<(), Error> {
        if env.storage().instance().has(&ARBITRATOR_KEY) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&ARBITRATOR_KEY, &arbitrator);
        env.storage().instance().set(&CASE_COUNTER_KEY, &0u32);
        env.storage().instance().extend_ttl(100, 10_000);
        Ok(())
    }

    pub fn open_case(
        env: Env,
        escrow_contract: Address,
        escrow_id: u32,
        milestone_id: u32,
        reason: String,
    ) -> Result<u32, Error> {
        if !env.storage().instance().has(&ARBITRATOR_KEY) {
            return Err(Error::NotInitialized);
        }

        escrow_contract.require_auth();
        
        let mut case_counter: u32 = env.storage().instance().get(&CASE_COUNTER_KEY).unwrap();
        case_counter += 1;
        env.storage().instance().set(&CASE_COUNTER_KEY, &case_counter);

        let case = Case {
            id: case_counter,
            escrow_contract: escrow_contract.clone(),
            escrow_id,
            milestone_id,
            reason,
            resolved: false,
            ruling: Ruling::Pending,
        };

        // Store case by case_id
        env.storage().instance().set(&case_counter, &case);
        env.storage().instance().extend_ttl(100, 10_000);

        // Emit event CaseOpened
        env.events().publish(
            (symbol_short!("CaseOpen"), case_counter),
            (escrow_contract, escrow_id, milestone_id),
        );

        Ok(case_counter)
    }

    pub fn resolve_case(env: Env, case_id: u32, ruling: Ruling) -> Result<(), Error> {
        let arbitrator: Address = env
            .storage()
            .instance()
            .get(&ARBITRATOR_KEY)
            .ok_or(Error::NotInitialized)?;

        arbitrator.require_auth();

        let mut case: Case = env
            .storage()
            .instance()
            .get(&case_id)
            .ok_or(Error::NotFound)?;

        if case.resolved {
            return Err(Error::AlreadyResolved);
        }

        // Notify EscrowContract back using dynamic contract call (avoids circular dependency)
        env.invoke_contract::<()>(
            &case.escrow_contract,
            &Symbol::new(&env, "resolve_dispute"),
            (case.escrow_id, case.milestone_id, ruling).into_val(&env),
        );

        case.resolved = true;
        case.ruling = ruling;
        env.storage().instance().set(&case_id, &case);

        // Emit CaseResolved event
        env.events().publish(
            (symbol_short!("CaseRes"), case_id),
            (ruling,),
        );

        Ok(())
    }

    pub fn get_case(env: Env, case_id: u32) -> Result<Case, Error> {
        env.storage()
            .instance()
            .get(&case_id)
            .ok_or(Error::NotFound)
    }

    pub fn get_arbitrator(env: Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&ARBITRATOR_KEY)
            .ok_or(Error::NotInitialized)
    }
}
