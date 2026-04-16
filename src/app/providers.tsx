"use client";

import { ReactNode } from "react";
import { CurrencyProvider } from "@/lib/currency";
import { LanguageProvider } from "@/lib/language";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CurrencyProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </CurrencyProvider>
  );
}
