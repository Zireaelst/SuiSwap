// HTLC implementation for Sui - Cross-chain atomic swaps
module kata_protocol::htlc {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::event;
    use std::vector;
    use std::hash;

    /// Error codes
    const EInvalidTimelock: u64 = 0;
    const EInvalidHashlock: u64 = 1;
    const EAlreadyWithdrawn: u64 = 2;
    const EAlreadyRefunded: u64 = 3;
    const ETimelockNotExpired: u64 = 4;
    const ETimelockExpired: u64 = 5;
    const EInvalidPreimage: u64 = 6;
    const ENotInitiator: u64 = 7;
    const EOrderNotFound: u64 = 8;

    /// HTLC Order structure for cross-chain swaps
    public struct HTLCOrder<phantom T> has key, store {
        id: UID,
        initiator: address,
        recipient: address,
        amount: u64,
        hashlock: vector<u8>,
        timelock: u64,
        withdrawn: bool,
        refunded: bool,
        ethereum_order_id: vector<u8>,
        secret_hash: vector<u8>,
        locked_balance: Balance<T>
    }

    /// Events
    public struct OrderCreated has copy, drop {
        order_id: ID,
        initiator: address,
        recipient: address,
        amount: u64,
        ethereum_order_id: vector<u8>,
        hashlock: vector<u8>,
        timelock: u64
    }

    public struct OrderWithdrawn has copy, drop {
        order_id: ID,
        preimage: vector<u8>,
        recipient: address
    }

    public struct OrderRefunded has copy, drop {
        order_id: ID,
        initiator: address,
        amount: u64
    }

    /// Create HTLC order for cross-chain swap
    public fun create_htlc_order<T>(
        coin: Coin<T>,
        recipient: address,
        hashlock: vector<u8>,
        timelock: u64,
        ethereum_order_id: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ): ID {
        let current_time = clock::timestamp_ms(clock);
        assert!(timelock > current_time, EInvalidTimelock);
        assert!(vector::length(&hashlock) == 32, EInvalidHashlock);

        let amount = coin::value(&coin);
        let balance = coin::into_balance(coin);
        let order_id = object::new(ctx);
        let id = object::uid_to_inner(&order_id);

        let order = HTLCOrder<T> {
            id: order_id,
            initiator: tx_context::sender(ctx),
            recipient,
            amount,
            hashlock,
            timelock,
            withdrawn: false,
            refunded: false,
            ethereum_order_id,
            secret_hash: hashlock,
            locked_balance: balance
        };

        event::emit(OrderCreated {
            order_id: id,
            initiator: tx_context::sender(ctx),
            recipient,
            amount,
            ethereum_order_id,
            hashlock,
            timelock
        });

        transfer::share_object(order);
        id
    }

    /// Withdraw funds with preimage (complete the swap)
    public fun withdraw<T>(
        order: &mut HTLCOrder<T>,
        preimage: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ): Coin<T> {
        assert!(!order.withdrawn, EAlreadyWithdrawn);
        assert!(!order.refunded, EAlreadyRefunded);
        assert!(clock::timestamp_ms(clock) <= order.timelock, ETimelockExpired);

        // Verify preimage matches hashlock
        let computed_hash = hash::sha2_256(preimage);
        assert!(computed_hash == order.hashlock, EInvalidPreimage);

        order.withdrawn = true;
        let amount = balance::value(&order.locked_balance);
        let withdrawn_balance = balance::split(&mut order.locked_balance, amount);

        event::emit(OrderWithdrawn {
            order_id: object::uid_to_inner(&order.id),
            preimage,
            recipient: order.recipient
        });

        coin::from_balance(withdrawn_balance, ctx)
    }

    /// Refund after timelock expires
    public fun refund<T>(
        order: &mut HTLCOrder<T>,
        clock: &Clock,
        ctx: &mut TxContext
    ): Coin<T> {
        assert!(tx_context::sender(ctx) == order.initiator, ENotInitiator);
        assert!(!order.withdrawn, EAlreadyWithdrawn);
        assert!(!order.refunded, EAlreadyRefunded);
        assert!(clock::timestamp_ms(clock) > order.timelock, ETimelockNotExpired);

        order.refunded = true;
        let amount = balance::value(&order.locked_balance);
        let refunded_balance = balance::split(&mut order.locked_balance, amount);

        event::emit(OrderRefunded {
            order_id: object::uid_to_inner(&order.id),
            initiator: order.initiator,
            amount
        });

        coin::from_balance(refunded_balance, ctx)
    }

    /// Get order details
    public fun get_order_details<T>(order: &HTLCOrder<T>): (address, address, u64, vector<u8>, u64, bool, bool) {
        (
            order.initiator,
            order.recipient,
            order.amount,
            order.hashlock,
            order.timelock,
            order.withdrawn,
            order.refunded
        )
    }

    /// Check if order can be withdrawn
    public fun can_withdraw<T>(order: &HTLCOrder<T>, clock: &Clock): bool {
        !order.withdrawn && !order.refunded && clock::timestamp_ms(clock) <= order.timelock
    }

    /// Check if order can be refunded
    public fun can_refund<T>(order: &HTLCOrder<T>, clock: &Clock): bool {
        !order.withdrawn && !order.refunded && clock::timestamp_ms(clock) > order.timelock
    }

    /// Generate secret hash for cross-chain coordination
    public fun generate_secret_hash(secret: vector<u8>): vector<u8> {
        hash::sha2_256(secret)
    }

    /// Partial fill support - withdraw partial amount with preimage
    public fun partial_withdraw<T>(
        order: &mut HTLCOrder<T>,
        preimage: vector<u8>,
        withdraw_amount: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ): Coin<T> {
        assert!(!order.withdrawn, EAlreadyWithdrawn);
        assert!(!order.refunded, EAlreadyRefunded);
        assert!(clock::timestamp_ms(clock) <= order.timelock, ETimelockExpired);
        assert!(withdraw_amount <= balance::value(&order.locked_balance), EInvalidPreimage);

        // Verify preimage matches hashlock
        let computed_hash = hash::sha2_256(preimage);
        assert!(computed_hash == order.hashlock, EInvalidPreimage);

        // Mark as partially withdrawn if full amount
        if (withdraw_amount == balance::value(&order.locked_balance)) {
            order.withdrawn = true;
        };

        let withdrawn_balance = balance::split(&mut order.locked_balance, withdraw_amount);

        event::emit(OrderWithdrawn {
            order_id: object::uid_to_inner(&order.id),
            preimage,
            recipient: order.recipient
        });

        coin::from_balance(withdrawn_balance, ctx)
    }
}
