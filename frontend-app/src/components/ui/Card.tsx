import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div 
      className={"bg-[#151515] border border-[#222] rounded-xl p-6 shadow-lg " + className}
      {...props}
    >
      {children}
    </div>
  );
}
