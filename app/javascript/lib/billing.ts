// Cliente HTTP do checkout Stripe.
// O endpoint Rails retorna { mode: "stripe" | "stub", url, session_id? } com
// a URL pra redirecionar o usuario. Quando STRIPE_SECRET_KEY nao esta
// configurado o backend devolve uma URL stub pra UX continuar funcional.
import { getStoredAuthSession } from "./auth";

export type CheckoutResult = {
  mode: "stripe" | "stub";
  url: string;
  session_id?: string;
  message?: string;
};

export async function createCheckoutSession(planId: string): Promise<CheckoutResult> {
  const headers = new Headers({
    "Accept": "application/json",
    "Content-Type": "application/json",
  });

  const session = getStoredAuthSession();
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const response = await fetch("/api/v1/billing", {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({
      billing: { plan_id: planId },
      success_path: "/settings/plans?checkout=ok",
      cancel_path: "/settings/plans?checkout=cancel",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Checkout failed (${response.status}): ${text}`);
  }

  return (await response.json()) as CheckoutResult;
}
