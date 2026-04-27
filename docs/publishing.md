# Publishing

## Revenue share

For every plugin sale, authors keep **70%** and the Horizon platform
keeps **30%** to cover marketplace infrastructure, review, payment
processing, and refunds.

| | |
|---|---|
| Minimum price | $1 |
| Maximum price | $200 |
| Free plugins | allowed |
| Author share | 70% |
| Platform share | 30% |
| Minimum payout | $30 |
| Payout cadence | weekly |
| Payout currencies | USDT (TRC20 / BSC / TON / SOL) |

Request a payout from the Creator dashboard once your balance is at or
above $30. Horizon batches all queued payouts on the scheduled day.

## Submission flow

1. `hz-plugin build` — produces a `.hzplugin` bundle.
2. `hz-plugin publish --token $HORIZON_TOKEN` — uploads the bundle to
   `https://api.horizonaai.dev/api/plugins/publish`.
3. The plugin enters **`pending_review`**. Ernest reviews within 72h
   (Phase 1). Once approved, it shows up on the marketplace.
4. Buyers purchase via crypto through NOWPayments. Your 70% lands in
   the `creator_earnings` ledger the moment payment confirms.

## Review checklist

To pass review your plugin must:

- Have a valid manifest and a working `main.js`.
- Declare only the permissions it actually uses.
- Not obfuscate code beyond standard minification.
- Not touch `child_process`, `fs.unlinkSync` on system paths, or
  unknown external endpoints without a good reason.
- Match its stated behaviour — no hidden telemetry, no key scraping.
- Have sane pricing for what it does ($5 minimum suggested for paid,
  $50 suggested cap during Phase 1).

If rejected you get a note explaining why and can re-submit.

## Takedown and refunds

Horizon may take a plugin down at any time if it harms users. Existing
owners keep access. Refund requests go to support — decisions are
case-by-case. Reversed earnings get clawed back from future payouts.
