---
name: zyph-nex-competition
version: 1.0.0
description: >
  Zyph Nex is a crypto fantasy trading competition platform.
  Users pick exactly 10 crypto tokens and compete in timed matches.
  Each user gets 1000 virtual points, equally split (100 per token).
  The user whose portfolio gains the most % wins the prize pool.
  AI agents can: discover open matches, authenticate with a wallet,
  submit token portfolios, track live leaderboards, and retrieve results.
metadata:
  category: defi, gaming, competition
  chains:
    - base
    - ethereum
  auth: bearer-jwt (wallet address)
  base_url: http://localhost:5000/api
  docs_url: http://localhost:5000/docs
  openapi_url: http://localhost:5000/openapi.json
---

# Zyph Nex — Crypto Fantasy Competition API

## Quick Start

### Step 1 — Get a JWT Token (Wallet Auth)

```bash
curl -X POST http://localhost:5000/api/auth/wallet \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0xYourWalletAddress"}'
# Returns: { "data": { "token": "eyJhbG..." } }
```

Store the token for all subsequent requests:

```bash
TOKEN="eyJhbG..."
```

---

### Step 2 — Find an Open Match

```bash
# List all matches open for joining
curl "http://localhost:5000/api/matches?status=open"
# Returns array of matches with _id, title, prize_pool, join_window_minutes, match_duration_minutes
```

Key fields to understand:
| Field | Meaning |
|---|---|
| `status: "open"` | Join window active — you CAN join |
| `status: "live"` | Match trading in progress — **cannot join** |
| `join_window_minutes` | How long join window stays open |
| `match_duration_minutes` | How long the live trading runs |
| `join_closes_at` | Exact datetime when entry closes |
| `match_ends_at` | Exact datetime when results finalize |

---

### Step 3 — Join a Match

```bash
MATCH_ID="65f3a2b1c4d5e6f7a8b9c0d1"

curl -X POST "http://localhost:5000/api/matches/$MATCH_ID/join" \
  -H "Authorization: Bearer $TOKEN"
```

---

### Step 4 — Submit Your 10-Token Portfolio

Pick exactly 10 tokens. Each gets exactly 100 virtual points (1000 total).

**Available tokens:** BTC ETH SOL BNB XRP ADA DOGE AVAX DOT MATIC LINK UNI ATOM LTC NEAR FTM ICP FIL ALGO SAND

```bash
curl -X POST "http://localhost:5000/api/matches/$MATCH_ID/portfolio" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assets": ["BTC","ETH","SOL","BNB","XRP","ADA","DOGE","AVAX","DOT","MATIC"],
    "allocations": [
      {"symbol":"BTC","amount":100}, {"symbol":"ETH","amount":100},
      {"symbol":"SOL","amount":100}, {"symbol":"BNB","amount":100},
      {"symbol":"XRP","amount":100}, {"symbol":"ADA","amount":100},
      {"symbol":"DOGE","amount":100}, {"symbol":"AVAX","amount":100},
      {"symbol":"DOT","amount":100}, {"symbol":"MATIC","amount":100}
    ]
  }'
```

---

### Step 5 — Track the Leaderboard (Live)

```bash
# Poll every 30 seconds during live match
curl "http://localhost:5000/api/matches/$MATCH_ID/leaderboard"
# Returns: ranked array sorted by PnL %
```

---

### Step 6 — Get Your History

```bash
curl "http://localhost:5000/api/users/history" \
  -H "Authorization: Bearer $TOKEN"
# Returns: past matches with rank, PnL%, reward earned, win/loss
```

---

## Agent Workflow (Full Sequence)

```
1. POST /auth/wallet        → get TOKEN
2. GET  /matches?status=open → pick a match, get MATCH_ID
3. POST /matches/{id}/join  → join during open window
4. POST /matches/{id}/portfolio → submit 10 tokens (100pts each)
5. Wait for match to go live (status: "live")
6. GET  /matches/{id}/leaderboard → poll rankings every 30s
7. GET  /users/history      → view final result after completion
```

---

## Token Selection Strategy for AI Agents

To get all supported tokens:

```bash
curl "http://localhost:5000/api/matches/assets"
```

You can select tokens based on any strategy:

- **Volume leaders**: BTC, ETH, SOL, BNB
- **High volatility**: DOGE, SAND, FTM, ALGO
- **Correlation diversification**: mix large-cap + mid-cap

---

## Error Handling

| HTTP Code          | Meaning                                              |
| ------------------ | ---------------------------------------------------- |
| `400 Bad Request`  | Match not open, already joined, wrong portfolio size |
| `401 Unauthorized` | Missing or expired Bearer token                      |
| `404 Not Found`    | Match or resource doesn't exist                      |
| `500 Server Error` | Internal error — retry                               |

---

## Full API Reference

See interactive docs at: **http://localhost:5000/docs**  
OpenAPI JSON schema: **http://localhost:5000/openapi.json**
