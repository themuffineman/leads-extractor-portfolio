import React from "react";

const Button = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className="bg-blue-500 w-full disabled:cursor-not-allowed disabled:bg-blue-200 text-white p-2 hover:bg-blue-400 hover:-translate-y-[2px] hover:shadow-md cursor-pointer transition-all active:translate-y-[2px] active:shadow-none rounded-md"
    >
      {children}
    </button>
  );
};

export default Button;
