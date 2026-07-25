"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import { makeStore, type AppStore } from "@/store";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <SessionProvider>{children}</SessionProvider>
    </Provider>
  );
}
