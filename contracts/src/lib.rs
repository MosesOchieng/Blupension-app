#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod pension_fund {
    use ink_storage::{
        collections::HashMap,
        traits::{PackedLayout, SpreadLayout},
    };

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode, SpreadLayout, PackedLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct Investment {
        amount: Balance,
        timestamp: Timestamp,
        stablecoin_percentage: u8,
        growing_assets_percentage: u8,
    }

    #[ink(storage)]
    pub struct PensionFund {
        investments: HashMap<AccountId, Investment>,
        total_funds: Balance,
        stablecoin_pool: Balance,
        growing_assets_pool: Balance,
        owner: AccountId,
        minimum_investment: Balance,
    }

    impl PensionFund {
        #[ink(constructor)]
        pub fn new(minimum_investment: Balance) -> Self {
            Self {
                investments: HashMap::new(),
                total_funds: 0,
                stablecoin_pool: 0,
                growing_assets_pool: 0,
                owner: Self::env().caller(),
                minimum_investment,
            }
        }

        #[ink(message)]
        pub fn invest(&mut self, stablecoin_percentage: u8) -> Result<(), Error> {
            let caller = self.env().caller();
            let value = self.env().transferred_value();
            
            ensure!(value >= self.minimum_investment, Error::InvestmentTooLow);
            ensure!(stablecoin_percentage <= 100, Error::InvalidPercentage);

            let growing_assets_percentage = 100 - stablecoin_percentage;
            let stablecoin_amount = (value * stablecoin_percentage as u128) / 100;
            let growing_amount = value - stablecoin_amount;

            self.stablecoin_pool += stablecoin_amount;
            self.growing_assets_pool += growing_amount;
            self.total_funds += value;

            self.investments.insert(caller, Investment {
                amount: value,
                timestamp: self.env().block_timestamp(),
                stablecoin_percentage,
                growing_assets_percentage,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn withdraw(&mut self, amount: Balance) -> Result<(), Error> {
            let caller = self.env().caller();
            let investment = self.investments.get(&caller)
                .ok_or(Error::NoInvestment)?;

            ensure!(amount <= investment.amount, Error::InsufficientFunds);

            let stablecoin_amount = (amount * investment.stablecoin_percentage as u128) / 100;
            let growing_amount = amount - stablecoin_amount;

            ensure!(stablecoin_amount <= self.stablecoin_pool, Error::InsufficientLiquidity);
            ensure!(growing_amount <= self.growing_assets_pool, Error::InsufficientLiquidity);

            self.stablecoin_pool -= stablecoin_amount;
            self.growing_assets_pool -= growing_amount;
            self.total_funds -= amount;

            if amount == investment.amount {
                self.investments.remove(&caller);
            } else {
                self.investments.insert(caller, Investment {
                    amount: investment.amount - amount,
                    ..*investment
                });
            }

            self.env().transfer(caller, amount).map_err(|_| Error::TransferFailed)?;
            Ok(())
        }
    }
} 