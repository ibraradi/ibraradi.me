---
title: "Recon is the bug bounty"
description: "Most of my paid findings came from recon, not from clever payloads. A short argument for spending your time where the bugs actually are."
pubDate: 2026-04-08
tags: ["bug-bounty", "recon", "offensive"]
---

New hunters ask me which payloads to memorize. Wrong question. The vulnerabilities that paid out weren't exotic — they were ordinary bugs on assets nobody else had found yet.

## Where the bugs live

Big programs have huge attack surfaces and most hunters pile onto the same `www`. The edges — forgotten subdomains, staging environments, acquired companies still running old stacks — are where the unclaimed bugs sit.

> The best payload in the world is worthless against an endpoint a hundred other people already tested.

## A repeatable loop

1. **Enumerate broadly.** Subdomains, ASNs, certificate transparency, historical DNS. Cast wide.
2. **Fingerprint everything.** What's the stack? What version? What's clearly out of place?
3. **Prioritize the weird.** A service that doesn't match the rest of the estate is usually under-maintained.
4. **Then** test. By the time you're sending payloads, the hard discovery work is done.

## Automate the tedium, not the judgment

Tooling should collapse the time between "new asset appears" and "I'm looking at it." But the decision about *what's interesting* is still yours — and that's the part that earns.

Recon isn't the boring prelude to the hunt. It **is** the hunt.
