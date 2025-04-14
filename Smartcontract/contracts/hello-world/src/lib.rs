

// #![allow(non_snake_case)]
// #![no_std]

// use soroban_sdk::{
//     contract, contracttype, contractimpl, log, 
//     Env, Symbol, String, Address, symbol_short, Vec
// };

// // Asset structure to store code/asset details
// #[contracttype]
// #[derive(Clone)]
// pub struct Asset {
//     pub asset_id: u64,             // Unique identifier for the asset
//     pub owner: Address,            // Owner's address
//     pub title: String,             // Title of the code/asset
//     pub description: String,       // Description of the code/asset
//     pub price: u64,                // Price in Lumens (XLM)
//     pub is_available: bool,        // Availability status
//     pub created_at: u64,           // Creation timestamp
// }

// // Lease structure to track leases
// #[contracttype]
// #[derive(Clone)]
// pub struct Lease {
//     pub lease_id: u64,             // Unique identifier for the lease
//     pub asset_id: u64,             // Reference to the asset being leased
//     pub owner: Address,            // Asset owner
//     pub lessee: Address,           // Address of the person leasing the asset
//     pub start_time: u64,           // Start timestamp of the lease
//     pub end_time: u64,             // End timestamp of the lease
//     pub price: u64,                // Agreed price for the lease
//     pub is_active: bool,           // Status of the lease
//     pub is_paid: bool,             // Payment status
// }

// // Marketplace statistics
// #[contracttype]
// #[derive(Clone)]
// pub struct MarketStats {
//     pub total_assets: u64,         // Total number of assets registered
//     pub available_assets: u64,     // Number of assets available for lease
//     pub total_leases: u64,         // Total number of leases created
//     pub active_leases: u64,        // Number of active leases
// }

// // Enum for asset mappings
// #[contracttype]
// pub enum AssetKey {
//     Asset(u64)                     // Maps asset_id to Asset
// }

// // Enum for lease mappings
// #[contracttype]
// pub enum LeaseKey {
//     Lease(u64)                     // Maps lease_id to Lease
// }

// // Constants for storing counters and marketplace data
// const ASSET_COUNTER: Symbol = symbol_short!("A_COUNT");
// const LEASE_COUNTER: Symbol = symbol_short!("L_COUNT");
// const MARKET_STATS: Symbol = symbol_short!("MKT_STAT");
// const USER_ASSETS: Symbol = symbol_short!("U_ASSETS");
// const USER_LEASES: Symbol = symbol_short!("U_LEASES");

// #[contract]
// pub struct CodeMarketplace;

// #[contractimpl]
// impl CodeMarketplace {
//     // Register a new asset to the marketplace
//     pub fn register_asset(
//         env: Env, 
//         owner: Address, 
//         title: String, 
//         description: String, 
//         price: u64
//     ) -> u64 {
//         // Authenticate the caller
//         owner.require_auth();
        
//         // Get the current asset counter and increment it
//         let mut asset_counter: u64 = env.storage().instance().get(&ASSET_COUNTER).unwrap_or(0);
//         asset_counter += 1;
        
//         // Get current timestamp
//         let current_time = env.ledger().timestamp();
        
//         // Create a new asset
//         let asset = Asset {
//             asset_id: asset_counter,
//             owner: owner.clone(),
//             title,
//             description,
//             price,
//             is_available: true,
//             created_at: current_time,
//         };
        
//         // Update marketplace statistics
//         let mut stats = Self::get_market_stats(env.clone());
//         stats.total_assets += 1;
//         stats.available_assets += 1;
        
//         // Store the asset
//         env.storage().instance().set(&AssetKey::Asset(asset_counter), &asset);
        
//         // Update the user's assets list
//         let mut user_assets: Vec<u64> = env.storage().temporary()
//             .get(&(USER_ASSETS, &owner))
//             .unwrap_or_else(|| Vec::new(&env));
//         user_assets.push_back(asset_counter);
//         env.storage().temporary().set(&(USER_ASSETS, &owner), &user_assets);
        
//         // Update counters and stats
//         env.storage().instance().set(&ASSET_COUNTER, &asset_counter);
//         env.storage().instance().set(&MARKET_STATS, &stats);
        
//         // Set contract storage TTL
//         env.storage().instance().extend_ttl(5000, 5000);
        
//         log!(&env, "Asset registered with ID: {}", asset_counter);
//         asset_counter
//     }
    
//     // Create a lease for an asset
//     pub fn create_lease(
//         env: Env, 
//         lessee: Address, 
//         asset_id: u64, 
//         duration: u64
//     ) -> u64 {
//         // Authenticate the caller
//         lessee.require_auth();
        
//         // Retrieve the asset
//         let mut asset = Self::get_asset(env.clone(), asset_id);
        
//         // Ensure the asset exists and is available
//         if asset.asset_id == 0 || !asset.is_available {
//             log!(&env, "Asset not available for lease");
//             panic!("Asset not available for lease");
//         }
        
//         // Get current timestamp and calculate end time
//         let current_time = env.ledger().timestamp();
//         let end_time = current_time + duration;
        
//         // Get the current lease counter and increment it
//         let mut lease_counter: u64 = env.storage().instance().get(&LEASE_COUNTER).unwrap_or(0);
//         lease_counter += 1;
        
//         // Create a new lease
//         let lease = Lease {
//             lease_id: lease_counter,
//             asset_id,
//             owner: asset.owner.clone(),
//             lessee: lessee.clone(),
//             start_time: current_time,
//             end_time,
//             price: asset.price,
//             is_active: true,
//             is_paid: false,
//         };
        
//         // Update asset availability
//         asset.is_available = false;
        
//         // Update marketplace statistics
//         let mut stats = Self::get_market_stats(env.clone());
//         stats.total_leases += 1;
//         stats.active_leases += 1;
//         stats.available_assets -= 1;
        
//         // Store the lease and updated asset
//         env.storage().instance().set(&LeaseKey::Lease(lease_counter), &lease);
//         env.storage().instance().set(&AssetKey::Asset(asset_id), &asset);
        
//         // Update the user's leases list
//         let mut user_leases: Vec<u64> = env.storage().temporary()
//             .get(&(USER_LEASES, &lessee))
//             .unwrap_or_else(|| Vec::new(&env));
//         user_leases.push_back(lease_counter);
//         env.storage().temporary().set(&(USER_LEASES, &lessee), &user_leases);
        
//         // Update counters and stats
//         env.storage().instance().set(&LEASE_COUNTER, &lease_counter);
//         env.storage().instance().set(&MARKET_STATS, &stats);
        
//         // Set contract storage TTL
//         env.storage().instance().extend_ttl(5000, 5000);
        
//         log!(&env, "Lease created with ID: {}", lease_counter);
//         lease_counter
//     }
    
//     // Process payment for a lease
//     pub fn pay_lease(env: Env, lessee: Address, lease_id: u64) {
//         // Authenticate the caller
//         lessee.require_auth();
        
//         // Retrieve the lease
//         let mut lease = Self::get_lease(env.clone(), lease_id);
        
//         // Ensure the lease exists, is active, and belongs to the lessee
//         if lease.lease_id == 0 || !lease.is_active {
//             log!(&env, "Lease not found or not active");
//             panic!("Lease not found or not active");
//         }
        
//         if lease.lessee != lessee {
//             log!(&env, "You are not the lessee of this asset");
//             panic!("You are not the lessee of this asset");
//         }
        
//         if lease.is_paid {
//             log!(&env, "Lease already paid");
//             panic!("Lease already paid");
//         }
        
//         // In a real implementation, this is where you would handle the XLM transfer
//         // For now, we'll just mark the lease as paid
//         lease.is_paid = true;
        
//         // Store the updated lease
//         env.storage().instance().set(&LeaseKey::Lease(lease_id), &lease);
        
//         // Set contract storage TTL
//         env.storage().instance().extend_ttl(5000, 5000);
        
//         log!(&env, "Payment processed for lease ID: {}", lease_id);
//     }
    
//     // End an active lease
//     pub fn end_lease(env: Env, caller: Address, lease_id: u64) {
//         // Authenticate the caller
//         caller.require_auth();
        
//         // Retrieve the lease
//         let mut lease = Self::get_lease(env.clone(), lease_id);
        
//         // Ensure the lease exists and is active
//         if lease.lease_id == 0 || !lease.is_active {
//             log!(&env, "Lease not found or not active");
//             panic!("Lease not found or not active");
//         }
        
//         // Ensure the caller is either the owner or the lessee
//         if lease.owner != caller && lease.lessee != caller {
//             log!(&env, "Only the owner or lessee can end this lease");
//             panic!("Only the owner or lessee can end this lease");
//         }
        
//         // Check if lease period has expired
//         let current_time = env.ledger().timestamp();
//         let _is_expired = current_time >= lease.end_time;
        
//         // If ending early and caller is not the owner, could add penalty logic here
        
//         // Update lease status
//         lease.is_active = false;
        
//         // Update the asset availability
//         let mut asset = Self::get_asset(env.clone(), lease.asset_id);
//         asset.is_available = true;
        
//         // Update marketplace statistics
//         let mut stats = Self::get_market_stats(env.clone());
//         stats.active_leases -= 1;
//         stats.available_assets += 1;
        
//         // Store the updated lease and asset
//         env.storage().instance().set(&LeaseKey::Lease(lease_id), &lease);
//         env.storage().instance().set(&AssetKey::Asset(lease.asset_id), &asset);
//         env.storage().instance().set(&MARKET_STATS, &stats);
        
//         // Set contract storage TTL
//         env.storage().instance().extend_ttl(5000, 5000);
        
//         log!(&env, "Lease ended: {}", lease_id);
//     }
    
//     // Update asset price
//     pub fn update_asset_price(env: Env, owner: Address, asset_id: u64, new_price: u64) {
//         // Authenticate the caller
//         owner.require_auth();
        
//         // Retrieve the asset
//         let mut asset = Self::get_asset(env.clone(), asset_id);
        
//         // Ensure the asset exists and belongs to the owner
//         if asset.asset_id == 0 {
//             log!(&env, "Asset not found");
//             panic!("Asset not found");
//         }
        
//         if asset.owner != owner {
//             log!(&env, "Only the owner can update the asset price");
//             panic!("Only the owner can update the asset price");
//         }
        
//         // Update price
//         asset.price = new_price;
        
//         // Store the updated asset
//         env.storage().instance().set(&AssetKey::Asset(asset_id), &asset);
        
//         // Set contract storage TTL
//         env.storage().instance().extend_ttl(5000, 5000);
        
//         log!(&env, "Asset price updated: {}", asset_id);
//     }
    
//     // Remove an asset from the marketplace
//     pub fn remove_asset(env: Env, owner: Address, asset_id: u64) {
//         // Authenticate the caller
//         owner.require_auth();
        
//         // Retrieve the asset
//         let asset = Self::get_asset(env.clone(), asset_id);
        
//         // Ensure the asset exists and belongs to the owner
//         if asset.asset_id == 0 {
//             log!(&env, "Asset not found");
//             panic!("Asset not found");
//         }
        
//         if asset.owner != owner {
//             log!(&env, "Only the owner can remove the asset");
//             panic!("Only the owner can remove the asset");
//         }
        
//         // Ensure the asset is not currently leased
//         if !asset.is_available {
//             log!(&env, "Cannot remove an asset that is currently leased");
//             panic!("Cannot remove an asset that is currently leased");
//         }
        
//         // Update marketplace statistics
//         let mut stats = Self::get_market_stats(env.clone());
//         stats.total_assets -= 1;
//         stats.available_assets -= 1;
        
//         // Remove the asset
//         env.storage().instance().remove(&AssetKey::Asset(asset_id));
        
//         // Update stats
//         env.storage().instance().set(&MARKET_STATS, &stats);
        
//         // Set contract storage TTL
//         env.storage().instance().extend_ttl(5000, 5000);
        
//         log!(&env, "Asset removed: {}", asset_id);
//     }
    
// // Get an asset by its ID
// pub fn get_asset(env: Env, asset_id: u64) -> Asset {
//     env.storage().instance().get(&AssetKey::Asset(asset_id)).unwrap_or(Asset {
//         asset_id: 0,
//         owner: Address::from_string(&String::from_str(&env, "G...")),  // Corrected
//         title: String::from_str(&env, ""),
//         description: String::from_str(&env, ""),
//         price: 0,
//         is_available: false,
//         created_at: 0,
//     })
// }

// // Get a lease by its ID
// pub fn get_lease(env: Env, lease_id: u64) -> Lease {
//     env.storage().instance().get(&LeaseKey::Lease(lease_id)).unwrap_or(Lease {
//         lease_id: 0,
//         asset_id: 0,
//         owner: Address::from_string(&String::from_str(&env, "G...")),  // Corrected
//         lessee: Address::from_string(&String::from_str(&env, "G...")), // Corrected
//         start_time: 0,
//         end_time: 0,
//         price: 0,
//         is_active: false,
//         is_paid: false,
//     })
// }

    
//     // Get marketplace statistics
//     pub fn get_market_stats(env: Env) -> MarketStats {
//         env.storage().instance().get(&MARKET_STATS).unwrap_or(MarketStats {
//             total_assets: 0,
//             available_assets: 0,
//             total_leases: 0,
//             active_leases: 0,
//         })
//     }
    
//     // Get all assets owned by a user
//     pub fn get_user_assets(env: Env, owner: Address) -> Vec<Asset> {
//         let asset_ids: Vec<u64> = env.storage().temporary()
//             .get(&(USER_ASSETS, &owner))
//             .unwrap_or_else(|| Vec::new(&env));
        
//         let mut assets = Vec::new(&env);
//         for id in asset_ids.iter() {
//             let asset = Self::get_asset(env.clone(), id);
//             if asset.asset_id != 0 {
//                 assets.push_back(asset);
//             }
//         }
        
//         assets
//     }
    
//     // Get all leases created by a user
//     pub fn get_user_leases(env: Env, lessee: Address) -> Vec<Lease> {
//         let lease_ids: Vec<u64> = env.storage().temporary()
//             .get(&(USER_LEASES, &lessee))
//             .unwrap_or_else(|| Vec::new(&env));
        
//         let mut leases = Vec::new(&env);
//         for id in lease_ids.iter() {
//             let lease = Self::get_lease(env.clone(), id);
//             if lease.lease_id != 0 {
//                 leases.push_back(lease);
//             }
//         }
        
//         leases
//     }
    
//     // Get all available assets for lease
//     pub fn get_available_assets(env: Env) -> Vec<Asset> {
//         let asset_counter: u64 = env.storage().instance().get(&ASSET_COUNTER).unwrap_or(0);
//         let mut available_assets = Vec::new(&env);
        
//         for i in 1..=asset_counter {
//             let asset = Self::get_asset(env.clone(), i);
//             if asset.asset_id != 0 && asset.is_available {
//                 available_assets.push_back(asset);
//             }
//         }
        
//         available_assets
//     }
// }
#![no_std]

use soroban_sdk::{contract, contractimpl, log, symbol_short, Address, Env, Symbol};

// Key used to store balances
const BALANCES: Symbol = symbol_short!("BALANCES");

#[contract]
pub struct MyTokenContract;

#[contractimpl]
impl MyTokenContract {
    // Initialize balance for a user
    pub fn init_account(env: Env, user: Address, amount: i128) {
        user.require_auth();

        env.storage().instance().set(&(BALANCES, &user), &amount);
        log!(&env, "Initialized {} with balance {}", user, amount);
    }

    // Transfer tokens from one user to another
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        let from_balance: i128 = env.storage().instance()
            .get(&(BALANCES, &from))
            .unwrap_or(0);

        if from_balance < amount {
            panic!("Insufficient balance");
        }

        let to_balance: i128 = env.storage().instance()
            .get(&(BALANCES, &to))
            .unwrap_or(0);

        env.storage().instance().set(&(BALANCES, &from), &(from_balance - amount));
        env.storage().instance().set(&(BALANCES, &to), &(to_balance + amount));

        log!(&env, "Transferred {} from {} to {}", amount, from, to);
    }

    // View balance of a user
    pub fn balance_of(env: Env, user: Address) -> i128 {
        env.storage().instance()
            .get(&(BALANCES, &user))
            .unwrap_or(0)
    }
}
