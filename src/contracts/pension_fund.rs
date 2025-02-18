use soroban_sdk::{contract, contractimpl, Address, Env, String};

#[contract]
pub struct PensionFund;

#[contractimpl]
impl PensionFund {
    pub fn init(env: Env, admin: Address) {
        env.storage().set(&String::from_str("admin"), &admin);
    }

    pub fn deposit(env: Env, user: Address, amount: i128) {
        // Verify transaction
        let balance = Self::get_balance(&env, &user);
        env.storage().set(&user, &(balance + amount));
    }

    pub fn withdraw(env: Env, user: Address, amount: i128) {
        // Verify user and balance
        let balance = Self::get_balance(&env, &user);
        if balance >= amount {
            env.storage().set(&user, &(balance - amount));
        }
    }

    pub fn get_balance(env: &Env, user: &Address) -> i128 {
        env.storage().get(user).unwrap_or(0)
    }
} 