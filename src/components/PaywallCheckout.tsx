"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import type { CorridorId, Locale } from "@/lib/types";
import type { SkuId } from "@/lib/pricing";

type PaywallCheckoutProps = {
  locale: Locale;
  sku: SkuId;
  corridorId: CorridorId | null;
  label: string;
  disabled: boolean;
  messages: {
    checkoutProcessing: string;
    checkoutError: string;
    qrisTitle: string;
    devSimulate: string;
    devSimulateHint: string;
    refreshAfterPay: string;
  };
};

type CheckoutResponse = {
  paymentId?: string;
  qrisString?: string | null;
  devSimulate?: boolean;
  error?: string;
};

export function PaywallCheckout({
  sku,
  corridorId,
  label,
  disabled,
  messages,
}: PaywallCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrisString, setQrisString] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [devSimulate, setDevSimulate] = useState(false);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    setQrisString(null);
    setPaymentId(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku, corridorId }),
      });
      const data = (await res.json()) as CheckoutResponse;
      if (!res.ok) {
        throw new Error(data.error ?? messages.checkoutError);
      }
      setPaymentId(data.paymentId ?? null);
      setQrisString(data.qrisString ?? null);
      setDevSimulate(Boolean(data.devSimulate));
    } catch (e) {
      setError(e instanceof Error ? e.message : messages.checkoutError);
    } finally {
      setLoading(false);
    }
  }

  async function simulateDevPayment() {
    if (!paymentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? messages.checkoutError);
      }
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : messages.checkoutError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        className="w-full"
        disabled={disabled || loading}
        onClick={() => void startCheckout()}
      >
        {loading ? messages.checkoutProcessing : label}
      </Button>
      {error && (
        <p className="text-center text-xs text-red-700" role="alert">{error}</p>
      )}
      {qrisString && (
        <div className="rounded-xl border border-border bg-slate-50 px-3 py-3 text-xs break-all">
          <p className="font-semibold text-slate-800">{messages.qrisTitle}</p>
          <p className="mt-2 font-mono text-[11px] text-slate-700">{qrisString}</p>
          <p className="mt-2 text-slate-600">{messages.refreshAfterPay}</p>
        </div>
      )}
      {devSimulate && paymentId && (
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3 py-3 text-center space-y-2">
          <p className="text-xs text-amber-950">{messages.devSimulateHint}</p>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={loading}
            onClick={() => void simulateDevPayment()}
          >
            {messages.devSimulate}
          </Button>
        </div>
      )}
    </div>
  );
}
