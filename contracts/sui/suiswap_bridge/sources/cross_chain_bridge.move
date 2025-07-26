module suiswap_bridge::cross_chain_bridge {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use std::vector;
    use std::hash;

    struct HTLCOrder has key, store {
        id: UID,
        initiator: address,
        recipient: address,
        amount: u64,
        token_type: vector<u8>,
        hashlock: vector<u8>,
        timelock: u64,
        withdrawn: bool,
        refunded: bool,
        ethereum_order_id: vector<u8>
    }

    struct OrderCreated has copy, drop {
        order_id: ID,
        initiator: address,
        ethereum_order_id: vector<u8>
    }

    struct OrderWithdrawn has copy, drop {
        order_id: ID,
        preimage: vector<u8>
    }

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
        assert!(timelock > current_time, 0);

        let amount = coin::value(&coin);
        let order_id = object::new(ctx);
        let id = object::uid_to_inner(&order_id);

        let order = HTLCOrder {
            id: order_id,
            initiator: tx_context::sender(ctx),
            recipient,
            amount,
            token_type: b"SUI", // Simplified for demo
            hashlock,
            timelock,
            withdrawn: false,
            refunded: false,
            ethereum_order_id
        };

        // Store coin in object
        // Note: This is simplified - in production, use proper coin storage
        coin::destroy_for_testing(coin);

        sui::event::emit(OrderCreated {
            order_id: id,
            initiator: tx_context::sender(ctx),
            ethereum_order_id
        });

        transfer::share_object(order);
        id
    }

    public fun withdraw_htlc<T>(
        order: &mut HTLCOrder,
        preimage: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ): Coin<T> {
        assert!(!order.withdrawn, 1);
        assert!(!order.refunded, 2);
        assert!(clock::timestamp_ms(clock) <= order.timelock, 3);

        let computed_hash = hash::sha2_256(preimage);
        assert!(computed_hash == order.hashlock, 4);

        order.withdrawn = true;

        sui::event::emit(OrderWithdrawn {
            order_id: object::uid_to_inner(&order.id),
            preimage
        });

        // Return coin - simplified for demo
        coin::zero<T>(ctx)
    }

    public fun refund_htlc<T>(
        order: &mut HTLCOrder,
        clock: &Clock,
        ctx: &mut TxContext
    ): Coin<T> {
        assert!(tx_context::sender(ctx) == order.initiator, 5);
        assert!(!order.withdrawn, 6);
        assert!(!order.refunded, 7);
        assert!(clock::timestamp_ms(clock) > order.timelock, 8);

        order.refunded = true;

        // Return coin - simplified for demo
        coin::zero<T>(ctx)
    }
}
