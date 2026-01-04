import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  fullWidth = false, 
  type = "button", // Default type button rakha hai taaki form submit na ho jaye फालतू में
  disabled = false,
  className = "" // Extra styling ke liye
}) => {
  
  const baseStyles = "h-[48px] px-6 rounded-[12px] font-bold text-[16px] text-white transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-100",   
    secondary: "bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-100", 
    danger: "bg-red-500 hover:bg-red-600",
    outline: "border-2 border-gray-900 text-gray-900 bg-transparent hover:bg-gray-900 hover:text-white"
  };

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;