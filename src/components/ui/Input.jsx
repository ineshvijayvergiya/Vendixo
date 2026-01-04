import React from 'react';

const Input = ({ label, type = "text", placeholder, value, onChange }) => {
  // Design Specs: Height 44px, Radius 4px
  return (
    <div className="flex flex-col gap-1 mb-4">
      {label && (
        <label className="text-text-main font-semibold text-[14px]">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="h-[44px] px-3 rounded-input border border-border text-text-main text-[14px] placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
      />
    </div>
  );
};

export default Input;