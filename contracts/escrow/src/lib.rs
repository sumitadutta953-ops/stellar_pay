#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, symbol_short,
    Address, Env, IntoVal, String, Symbol, Vec, log,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, Ord, PartialOrd)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    NotFound = 3,
    NotAuthorized = 4,
    InvalidStatus = 5,
    AlreadyFunded = 6,
    NotFunded = 7,
    InvalidAmount = 8,
    Overflow = 9,
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum MilestoneStatus {
    Pending = 0,
    Approved = 1,
    Disputed = 2,
    Refunded = 3,
    Released = 4,
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
pub struct Milestone {
    pub id: u32,
    pub description: String,
    pub amount: i128,
    pub status: MilestoneStatus,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Escrow {
    pub id: u32,
    pub client: Address,
    pub vendor: Address,
    pub arbitration_contract: Address,
    pub milestones: Vec<Milestone>,
    pub token: Address,
    pub funded: bool,
    pub completed: bool,
}

#[contract]
pub struct EscrowContract;

const ESCROW_COUNTER_KEY: Symbol = symbol_short!("ESCRWCNT");

#[contractimpl]
impl EscrowContract {
    pub fn create_escrow(
        env: Env,
        client: Address,
        vendor: Address,
        arbitration_contract: Address,
        milestones: Vec<Milestone>,
        token: Address,
    ) -> Result<u32, Error> {
        client.require_auth();

        if milestones.is_empty() {
            return Err(Error::InvalidAmount);
        }

        let mut total_amount: i128 = 0;
        for i in 0..milestones.len() {
            let milestone = milestones.get(i).ok_or(Error::NotFound)?;
            if milestone.amount <= 0 {
                return Err(Error::InvalidAmount);
            }
            total_amount = total_amount.checked_add(milestone.amount).ok_or(Error::Overflow)?;
        }

        let mut counter: u32 = env.storage().instance().get(&ESCROW_COUNTER_KEY).unwrap_or(0u32);
        counter += 1;
        env.storage().instance().set(&ESCROW_COUNTER_KEY, &counter);

        let escrow = Escrow {
            id: counter,
            client: client.clone(),
            vendor: vendor.clone(),
            arbitration_contract: arbitration_contract.clone(),
            milestones,
            token,
            funded: false,
            completed: false,
        };

        env.storage().instance().set(&counter, &escrow);
        env.storage().instance().extend_ttl(100, 10_000);

        // Emit EscrowCreated event
        env.events().publish(
            (symbol_short!("EscrowCr"), counter),
            (client, vendor, total_amount),
        );

        Ok(counter)
    }

    pub fn fund(env: Env, escrow_id: u32) -> Result<(), Error> {
        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&escrow_id)
            .ok_or(Error::NotFound)?;

        if escrow.funded {
            return Err(Error::AlreadyFunded);
        }

        escrow.client.require_auth();

        let mut total_amount: i128 = 0;
        for i in 0..escrow.milestones.len() {
            let milestone = escrow.milestones.get(i).ok_or(Error::NotFound)?;
            total_amount = total_amount.checked_add(milestone.amount).ok_or(Error::Overflow)?;
        }

        // Call token contract to transfer total_amount from client to contract
        let token_client = soroban_sdk::token::Client::new(&env, &escrow.token);
        token_client.transfer(&escrow.client, &env.current_contract_address(), &total_amount);

        escrow.funded = true;
        env.storage().instance().set(&escrow_id, &escrow);

        // Emit Funded event
        env.events().publish(
            (symbol_short!("Funded"), escrow_id),
            (total_amount,),
        );

        Ok(())
    }

    pub fn approve_milestone(env: Env, escrow_id: u32, milestone_id: u32) -> Result<(), Error> {
        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&escrow_id)
            .ok_or(Error::NotFound)?;

        if !escrow.funded {
            return Err(Error::NotFunded);
        }
        if escrow.completed {
            return Err(Error::InvalidStatus);
        }

        escrow.client.require_auth();

        let mut milestone_index: Option<u32> = None;
        for i in 0..escrow.milestones.len() {
            let milestone = escrow.milestones.get(i).ok_or(Error::NotFound)?;
            if milestone.id == milestone_id {
                milestone_index = Some(i);
                break;
            }
        }

        let idx = milestone_index.ok_or(Error::NotFound)?;
        let mut milestone = escrow.milestones.get(idx).ok_or(Error::NotFound)?;

        if milestone.status != MilestoneStatus::Pending {
            return Err(Error::InvalidStatus);
        }

        // Transfer funds to vendor
        let token_client = soroban_sdk::token::Client::new(&env, &escrow.token);
        token_client.transfer(&env.current_contract_address(), &escrow.vendor, &milestone.amount);

        milestone.status = MilestoneStatus::Approved;
        escrow.milestones.set(idx, milestone);

        // Check if all milestones are completed
        let mut all_completed = true;
        for i in 0..escrow.milestones.len() {
            let m = escrow.milestones.get(i).ok_or(Error::NotFound)?;
            if m.status == MilestoneStatus::Pending || m.status == MilestoneStatus::Disputed {
                all_completed = false;
                break;
            }
        }
        if all_completed {
            escrow.completed = true;
        }

        env.storage().instance().set(&escrow_id, &escrow);

        // Emit MilestoneApproved event
        env.events().publish(
            (symbol_short!("MstoneAp"), escrow_id),
            (milestone_id,),
        );

        Ok(())
    }

    pub fn raise_dispute(
        env: Env,
        sender: Address,
        escrow_id: u32,
        milestone_id: u32,
        reason: String,
    ) -> Result<(), Error> {
        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&escrow_id)
            .ok_or(Error::NotFound)?;

        if !escrow.funded {
            return Err(Error::NotFunded);
        }
        if escrow.completed {
            return Err(Error::InvalidStatus);
        }

        sender.require_auth();
        if sender != escrow.client && sender != escrow.vendor {
            return Err(Error::NotAuthorized);
        }

        let mut milestone_index: Option<u32> = None;
        for i in 0..escrow.milestones.len() {
            let milestone = escrow.milestones.get(i).ok_or(Error::NotFound)?;
            if milestone.id == milestone_id {
                milestone_index = Some(i);
                break;
            }
        }

        let idx = milestone_index.ok_or(Error::NotFound)?;
        let mut milestone = escrow.milestones.get(idx).ok_or(Error::NotFound)?;

        if milestone.status != MilestoneStatus::Pending {
            return Err(Error::InvalidStatus);
        }

        // Call ArbitrationContract to open case
        let case_id: u32 = env.invoke_contract(
            &escrow.arbitration_contract,
            &Symbol::new(&env, "open_case"),
            (env.current_contract_address(), escrow_id, milestone_id, reason).into_val(&env),
        );

        milestone.status = MilestoneStatus::Disputed;
        escrow.milestones.set(idx, milestone);
        env.storage().instance().set(&escrow_id, &escrow);

        // Emit DisputeRaised event
        env.events().publish(
            (symbol_short!("DisputRd"), escrow_id),
            (milestone_id, case_id),
        );

        Ok(())
    }

    pub fn resolve_dispute(
        env: Env,
        escrow_id: u32,
        milestone_id: u32,
        ruling: Ruling,
    ) -> Result<(), Error> {
        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&escrow_id)
            .ok_or(Error::NotFound)?;

        // Ensure caller is the arbitration contract associated with this escrow
        escrow.arbitration_contract.require_auth();

        let mut milestone_index: Option<u32> = None;
        for i in 0..escrow.milestones.len() {
            let milestone = escrow.milestones.get(i).ok_or(Error::NotFound)?;
            if milestone.id == milestone_id {
                milestone_index = Some(i);
                break;
            }
        }

        let idx = milestone_index.ok_or(Error::NotFound)?;
        let mut milestone = escrow.milestones.get(idx).ok_or(Error::NotFound)?;

        if milestone.status != MilestoneStatus::Disputed {
            return Err(Error::InvalidStatus);
        }

        let token_client = soroban_sdk::token::Client::new(&env, &escrow.token);

        match ruling {
            Ruling::Pending => return Err(Error::InvalidStatus),
            Ruling::Release => {
                // Transfer funds to vendor
                token_client.transfer(&env.current_contract_address(), &escrow.vendor, &milestone.amount);
                milestone.status = MilestoneStatus::Released;
            }
            Ruling::Refund => {
                // Transfer funds back to client
                token_client.transfer(&env.current_contract_address(), &escrow.client, &milestone.amount);
                milestone.status = MilestoneStatus::Refunded;
            }
        }

        escrow.milestones.set(idx, milestone);

        // Check if all milestones are completed
        let mut all_completed = true;
        for i in 0..escrow.milestones.len() {
            let m = escrow.milestones.get(i).ok_or(Error::NotFound)?;
            if m.status == MilestoneStatus::Pending || m.status == MilestoneStatus::Disputed {
                all_completed = false;
                break;
            }
        }
        if all_completed {
            escrow.completed = true;
        }

        env.storage().instance().set(&escrow_id, &escrow);

        // Emit DisputeResolved event
        env.events().publish(
            (symbol_short!("DisputRs"), escrow_id),
            (milestone_id, ruling),
        );

        Ok(())
    }

    pub fn cancel_escrow(env: Env, escrow_id: u32) -> Result<(), Error> {
        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&escrow_id)
            .ok_or(Error::NotFound)?;

        if escrow.completed {
            return Err(Error::InvalidStatus);
        }

        if !escrow.funded {
            // Unilateral cancellation by client
            escrow.client.require_auth();
            escrow.completed = true;
            env.storage().instance().set(&escrow_id, &escrow);

            env.events().publish(
                (symbol_short!("Refunded"), escrow_id),
                (0i128,),
            );
        } else {
            // Mutual cancellation by both client and vendor
            escrow.client.require_auth();
            escrow.vendor.require_auth();

            let mut refund_amount: i128 = 0;
            let token_client = soroban_sdk::token::Client::new(&env, &escrow.token);

            for i in 0..escrow.milestones.len() {
                let mut milestone = escrow.milestones.get(i).ok_or(Error::NotFound)?;
                if milestone.status == MilestoneStatus::Pending {
                    refund_amount = refund_amount.checked_add(milestone.amount).ok_or(Error::Overflow)?;
                    milestone.status = MilestoneStatus::Refunded;
                    escrow.milestones.set(i, milestone);
                }
            }

            if refund_amount > 0 {
                token_client.transfer(&env.current_contract_address(), &escrow.client, &refund_amount);
            }

            escrow.completed = true;
            env.storage().instance().set(&escrow_id, &escrow);

            env.events().publish(
                (symbol_short!("Refunded"), escrow_id),
                (refund_amount,),
            );
        }

        Ok(())
    }

    pub fn get_escrow(env: Env, escrow_id: u32) -> Result<Escrow, Error> {
        env.storage()
            .instance()
            .get(&escrow_id)
            .ok_or(Error::NotFound)
    }
}
