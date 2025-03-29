module 0x903a8c9e37c744674108ea208c81e60ff09d78c612ffa9df78396e99634f8204::FeeSystem {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;

    // Constants
    const FEE_AMOUNT: u64 = 10000000; // 0.1 APT in Octas (1 APT = 10^8 Octas)

    // Admin address to collect fees (your address)
    const ADMIN_ADDRESS: address = @0x903a8c9e37c744674108ea208c81e60ff09d78c612ffa9df78396e99634f8204;

    // Struct to track if a user has paid
    struct Access has key {
        has_paid: bool, // True if the user has paid the fee
    }

    // Initialize the module (optional, can be used to set up resources)
    public entry fun initialize(account: &signer) {
        let sender = signer::address_of(account);
        assert!(sender == ADMIN_ADDRESS, 1); // Only admin can initialize
        // No initialization needed for now, but can add resources here if required
    }

    // User pays 0.1 APT to gain permanent access
    public entry fun pay_fee(account: &signer) acquires Access {
        let sender = signer::address_of(account);

        // Ensure user has enough APT and transfer it to admin
        assert!(coin::balance<AptosCoin>(sender) >= FEE_AMOUNT, 2); // Error if insufficient balance
        coin::transfer<AptosCoin>(account, ADMIN_ADDRESS, FEE_AMOUNT);

        // Update or create access status
        if (exists<Access>(sender)) {
            let access = borrow_global_mut<Access>(sender);
            access.has_paid = true; // Set to true if not already
        } else {
            move_to(account, Access {
                has_paid: true
            });
        }
    }

    // Check if a user has paid and has access
    public fun has_access(user: address): bool acquires Access {
        if (!exists<Access>(user)) {
            return false
        };
        let access = borrow_global<Access>(user);
        access.has_paid
    }

    // Helper function for testing: Check payment status (optional)
    #[view]
    public fun get_access_status(user: address): bool acquires Access {
        if (!exists<Access>(user)) {
            return false
        };
        let access = borrow_global<Access>(user);
        access.has_paid
    }
}