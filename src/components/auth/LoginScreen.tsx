"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useSyncExternalStore } from "react";
import { ContinueAsCard } from "@/components/auth/ContinueAsCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { useSavedAccountsStore } from "@/store/savedAccounts.store";

/**
 * The right half of /login. If this browser has signed in before, Instagram
 * greets you with "Continue as …" instead of an empty form (img1); the form is
 * one click away, and so is a clean one.
 */
export function LoginScreen() {
  const accounts = useSavedAccountsStore((s) => s.accounts);
  const [showForm, setShowForm] = useState(false);
  const [prefill, setPrefill] = useState("");

  // The saved list lives in localStorage, so it does not exist on the server:
  // useSyncExternalStore gives `false` for the server snapshot and `true` on the
  // client, which is the supported way to render "client-only" without a
  // hydration mismatch (and without setState-in-effect).
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const account = accounts[0];
  const showCard = hydrated && account && !showForm;

  if (!hydrated) {
    // Reserve the space so the panel does not jump once the store rehydrates.
    return <div className="w-full max-w-[420px]" />;
  }

  return (
    <AnimatePresence mode="wait">
      {showCard ? (
        <motion.div key="card" exit={{ opacity: 0, y: -8 }} className="w-full max-w-[420px]">
          <ContinueAsCard
            account={account}
            onContinue={() => {
              setPrefill(account.userName);
              setShowForm(true);
            }}
            onUseAnother={() => {
              setPrefill("");
              setShowForm(true);
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[420px]"
        >
          <LoginForm
            prefillLogin={prefill}
            onBack={account ? () => setShowForm(false) : undefined}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
