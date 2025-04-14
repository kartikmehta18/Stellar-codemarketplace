#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_init_and_transfer() {
    let env = Env::default();

    let user1 = Address::random(&env);
    let user2 = Address::random(&env);

    user1.require_auth();
    user2.require_auth();

    // Init balance for user1
    MyTokenContract::init_account(env.clone(), user1.clone(), 1000);
    assert_eq!(MyTokenContract::balance_of(env.clone(), user1.clone()), 1000);
    assert_eq!(MyTokenContract::balance_of(env.clone(), user2.clone()), 0);

    // Transfer from user1 to user2
    MyTokenContract::transfer(env.clone(), user1.clone(), user2.clone(), 200);
    assert_eq!(MyTokenContract::balance_of(env.clone(), user1.clone()), 800);
    assert_eq!(MyTokenContract::balance_of(env.clone(), user2.clone()), 200);
}
