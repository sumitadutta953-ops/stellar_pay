#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

const COUNTER: Symbol = symbol_short!("COUNTER");

#[contract]
pub struct CounterContract;

#[contractimpl]
impl CounterContract {
    /// Get the current value of the counter.
    pub fn get_value(env: Env) -> u32 {
        env.storage().instance().get(&COUNTER).unwrap_or(0)
    }

    /// Increment the counter by 1 and return the new value.
    pub fn increment(env: Env) -> u32 {
        let mut count: u32 = Self::get_value(env.clone());
        count += 1;
        env.storage().instance().set(&COUNTER, &count);
        env.storage().instance().extend_ttl(100, 5000); // Optional: keep state alive
        count
    }

    /// Decrement the counter by 1 and return the new value (minimum 0).
    pub fn decrement(env: Env) -> u32 {
        let mut count: u32 = Self::get_value(env.clone());
        if count > 0 {
            count -= 1;
        }
        env.storage().instance().set(&COUNTER, &count);
        env.storage().instance().extend_ttl(100, 5000); // Optional: keep state alive
        count
    }
}
