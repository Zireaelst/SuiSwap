import React from 'react';

interface OrderBookData {
  price: number;
  size: number;
  total: number;
}

interface OrderBookChartProps {
  bids: OrderBookData[];
  asks: OrderBookData[];
}

export default function OrderBookChart({ bids, asks }: OrderBookChartProps) {
  return (
    <div className="w-full h-64 bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Order Book</h3>
      
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Bids */}
        <div>
          <h4 className="text-sm font-medium text-green-600 mb-2">Bids</h4>
          <div className="space-y-1 text-xs">
            {bids.slice(0, 10).map((bid, index) => (
              <div key={index} className="flex justify-between text-green-600">
                <span>{bid.price.toFixed(4)}</span>
                <span>{bid.size.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Asks */}
        <div>
          <h4 className="text-sm font-medium text-red-600 mb-2">Asks</h4>
          <div className="space-y-1 text-xs">
            {asks.slice(0, 10).map((ask, index) => (
              <div key={index} className="flex justify-between text-red-600">
                <span>{ask.price.toFixed(4)}</span>
                <span>{ask.size.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {bids.length === 0 && asks.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-500">
          No order book data available
        </div>
      )}
    </div>
  );
}
