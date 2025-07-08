import * as React from 'react';

export function Select({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>;
}

export function SelectTrigger({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props}>{children}</button>;
}

export function SelectValue({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span {...props}>{children}</span>;
}

export function SelectContent({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>;
}

export function SelectItem({ children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li {...props}>{children}</li>;
}
