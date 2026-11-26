"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "@/components/ui/button";

type ButtonStyle = VariantProps<typeof buttonVariants>;

export function AppLink({
  href,
  children,
  variant,
  size,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
} & ButtonStyle) {
  return (
    <Link href={href} className={buttonVariants({ variant, size, className })}>
      {children}
    </Link>
  );
}
