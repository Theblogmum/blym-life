export function PaymentTestModeBanner() {
  // With Stripe BYOK we cannot tell from the client whether the connected
  // account is in test or live mode. Show nothing — Stripe's own checkout
  // surfaces a "TEST MODE" banner when applicable.
  return null;
  // eslint-disable-next-line no-unreachable
  return (
    <div className="w-full bg-orange-100 border-b border-orange-300 px-4 py-2 text-center text-sm text-orange-800">
      All payments made in the preview are in test mode.{" "}
      <a
        href="https://docs.lovable.dev/features/payments#test-and-live-environments"
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-medium"
      >
        Read more
      </a>
    </div>
  );
}