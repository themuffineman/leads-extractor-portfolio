import React from "react";
import { twMerge } from "tailwind-merge";

const Button = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={twMerge(
        "bg-blue-500 w-full disabled:cursor-not-allowed disabled:bg-blue-200 text-white p-2 hover:bg-blue-400 hover:-translate-y-[2px] hover:shadow-md cursor-pointer transition-all active:translate-y-[2px] active:shadow-none rounded-md",
        props.className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
