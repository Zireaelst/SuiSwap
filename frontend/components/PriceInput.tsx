import React from 'react';

interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function PriceInput({ value, onChange, placeholder, disabled }: PriceInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Price</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "0.00"}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        step="any"
        min="0"
      />
    </div>
  );
}
