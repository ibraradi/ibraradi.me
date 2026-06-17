---
title: "Mapping 7,000+ assets in under 3 hours"
description: "Notes on building a distributed scanning engine for attack surface management — concurrency, coordination, and the boring problems that actually matter."
pubDate: 2026-05-20
tags: ["asm", "infrastructure", "engineering"]
---

Attack Surface Management lives or dies on a single question: *how fresh is your map?* A list of a company's internet-facing assets that's a week old is a list of yesterday's risk. The goal I set was to map large infrastructures — 7,000+ assets — in under three hours, continuously.

## The naive version

The first version was a single fat scanner walking a queue. It worked for small targets and fell over on anything real. Network I/O dominates, so the CPU sat idle while sockets waited.

## Going distributed

The fix was hundreds of concurrent worker instances, each pulling work from a shared queue and pushing results to a normalization layer. A few principles held up:

- **Make work units small and idempotent.** A worker dying mid-scan should cost you one host, not the whole run.
- **Separate discovery from enrichment.** Finding an asset and deep-scanning it have different cost profiles — don't couple them.
- **Normalize early.** Raw scanner output is chaos. Turning it into a consistent schema at ingest saved endless pain downstream.

## The boring problems

The interesting part wasn't concurrency — it was rate limiting, deduplication, and not getting your IP ranges blocked. Those "boring" problems are where most of the real engineering time went, and where the difference between a demo and production lives.

I'll go deeper on the queue design and the dedup strategy in a follow-up.
