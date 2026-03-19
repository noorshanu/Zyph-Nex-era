/**
 * OpenAPI 3.0 Schema for Zyph Nex
 * Describes all public API endpoints for AI agent consumption.
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Zyph Nex — Crypto Fantasy Trading API",
    version: "1.0.0",
    description:
      "Zyph Nex is a fantasy crypto trading competition platform. " +
      "Users pick 10 crypto tokens and compete in timed matches. " +
      "This API allows AI agents to: discover open matches, join them with a wallet, " +
      "submit token portfolios, track live leaderboards, and retrieve results.",
    contact: { name: "Zyph Nex", url: "http://localhost:5173" },
  },
  servers: [
    { url: "http://localhost:5000/api", description: "Local Development" },
  ],

  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "JWT token obtained via POST /auth/wallet or POST /auth/login",
      },
    },
    schemas: {
      Match: {
        type: "object",
        properties: {
          _id: { type: "string", example: "65f3a2b1c4d5e6f7a8b9c0d1" },
          title: { type: "string", example: "Crypto Classic #42" },
          type: { type: "string", enum: ["paid", "practice"], example: "paid" },
          status: {
            type: "string",
            enum: [
              "scheduled",
              "upcoming",
              "open",
              "live",
              "completed",
              "settled",
            ],
            description:
              "open = join window active, live = trading in progress (no new joins)",
          },
          entry_fee: { type: "number", example: 20, description: "In USD" },
          prize_pool: { type: "number", example: 500 },
          virtual_balance: {
            type: "number",
            example: 1000,
            description: "Virtual points user gets to allocate",
          },
          join_window_minutes: {
            type: "number",
            example: 30,
            description: "How long users can join before match starts",
          },
          match_duration_minutes: {
            type: "number",
            example: 4,
            description: "How long the live trading phase runs",
          },
          max_participants: { type: "number", example: 50 },
          current_participants: { type: "number", example: 23 },
          start_time: {
            type: "string",
            format: "date-time",
            description: "When the join window opens",
          },
          join_closes_at: {
            type: "string",
            format: "date-time",
            description: "When the join window closes and match goes live",
          },
          match_ends_at: {
            type: "string",
            format: "date-time",
            description: "When the live match ends",
          },
        },
      },
      Portfolio: {
        type: "object",
        required: ["assets", "allocations"],
        properties: {
          assets: {
            type: "array",
            items: { type: "string" },
            minItems: 10,
            maxItems: 10,
            example: [
              "BTC",
              "ETH",
              "SOL",
              "BNB",
              "XRP",
              "ADA",
              "DOGE",
              "AVAX",
              "DOT",
              "MATIC",
            ],
            description: "Exactly 10 token symbols to compete with",
          },
          allocations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                symbol: { type: "string", example: "BTC" },
                amount: {
                  type: "number",
                  example: 100,
                  description:
                    "Virtual points allocated (must be 100 each, sum to 1000)",
                },
              },
            },
            description:
              "Equal distribution — 100 points per token, 10 tokens = 1000 total",
          },
        },
      },
      LeaderboardEntry: {
        type: "object",
        properties: {
          rank: { type: "number", example: 1 },
          username: { type: "string", example: "ApexTrader" },
          pnl_percentage: { type: "number", example: 12.45 },
          reward: { type: "number", example: 150 },
          is_winner: { type: "boolean", example: true },
        },
      },
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: { type: "object" },
          message: { type: "string" },
        },
      },
    },
  },

  security: [{ BearerAuth: [] }],

  paths: {
    "/health": {
      get: {
        summary: "Health Check",
        description: "Check if the API is running. No auth required.",
        security: [],
        tags: ["System"],
        operationId: "healthCheck",
        responses: {
          200: {
            description: "Server is healthy",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Server is running",
                  timestamp: "2026-02-20T05:00:00.000Z",
                },
              },
            },
          },
        },
      },
    },

    "/auth/wallet": {
      post: {
        summary: "Authenticate with Wallet Address",
        description:
          "Authenticate or register using an Ethereum wallet address. " +
          "Returns a JWT token. Use this token as Bearer in all subsequent requests.",
        security: [],
        tags: ["Authentication"],
        operationId: "walletAuth",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["walletAddress"],
                properties: {
                  walletAddress: {
                    type: "string",
                    example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Authentication successful",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    token: "eyJhbG...",
                    user: { _id: "...", wallet_address: "0x..." },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/matches": {
      get: {
        summary: "List All Matches",
        description:
          "Get all matches. Filter by status to find joinable matches. " +
          "Use status=open to find matches with an active join window. " +
          "Matches with status=live are in progress — entry is closed.",
        security: [],
        tags: ["Matches"],
        operationId: "getMatches",
        parameters: [
          {
            name: "status",
            in: "query",
            description:
              "Filter by status: open (joinable), live (ongoing), completed, scheduled",
            schema: {
              type: "string",
              enum: [
                "open",
                "live",
                "completed",
                "settled",
                "scheduled",
                "upcoming",
              ],
            },
          },
          {
            name: "type",
            in: "query",
            description: "Filter by type",
            schema: { type: "string", enum: ["paid", "practice"] },
          },
        ],
        responses: {
          200: {
            description: "List of matches",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Match" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/matches/{id}": {
      get: {
        summary: "Get Match Details",
        description:
          "Get full details of a single match including timing, participants, and prize pool.",
        security: [],
        tags: ["Matches"],
        operationId: "getMatch",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Match MongoDB ObjectId",
          },
        ],
        responses: {
          200: {
            description: "Match details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Match" },
              },
            },
          },
          404: { description: "Match not found" },
        },
      },
    },

    "/matches/{id}/join": {
      post: {
        summary: "Join a Match",
        description:
          "Join an open match. Must be called while match status is 'open' (during join window). " +
          "Returns a portfolio_id. Immediately after joining, call POST /matches/{id}/portfolio to submit your token picks.",
        tags: ["Match Flow"],
        operationId: "joinMatch",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Successfully joined. Returns portfolio_id.",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Successfully joined match",
                  data: { match_id: "...", portfolio_id: "..." },
                },
              },
            },
          },
          400: {
            description: "Match not open, already joined, or match is full",
          },
          401: { description: "Auth required — include Bearer token" },
        },
      },
    },

    "/matches/{id}/portfolio": {
      post: {
        summary: "Submit Token Portfolio",
        description:
          "Submit your 10-token selection and allocation. " +
          "Rule: exactly 10 tokens, each allocated exactly 100 virtual points (total = 1000). " +
          "Available tokens: BTC ETH SOL BNB XRP ADA DOGE AVAX DOT MATIC LINK UNI ATOM LTC NEAR FTM ICP FIL ALGO SAND. " +
          "Must be submitted before the join window closes (before match goes live).",
        tags: ["Match Flow"],
        operationId: "submitPortfolio",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Portfolio" },
              example: {
                assets: [
                  "BTC",
                  "ETH",
                  "SOL",
                  "BNB",
                  "XRP",
                  "ADA",
                  "DOGE",
                  "AVAX",
                  "DOT",
                  "MATIC",
                ],
                allocations: [
                  { symbol: "BTC", amount: 100 },
                  { symbol: "ETH", amount: 100 },
                  { symbol: "SOL", amount: 100 },
                  { symbol: "BNB", amount: 100 },
                  { symbol: "XRP", amount: 100 },
                  { symbol: "ADA", amount: 100 },
                  { symbol: "DOGE", amount: 100 },
                  { symbol: "AVAX", amount: 100 },
                  { symbol: "DOT", amount: 100 },
                  { symbol: "MATIC", amount: 100 },
                ],
              },
            },
          },
        },
        responses: {
          200: { description: "Portfolio submitted successfully" },
          400: {
            description:
              "Invalid portfolio (wrong number of tokens or allocations)",
          },
        },
      },
    },

    "/matches/{id}/leaderboard": {
      get: {
        summary: "Get Live Leaderboard",
        description:
          "Get current rankings for a match. During a live match, this updates every 30 seconds. " +
          "After match completion, shows final results. Returns an array of ranking objects sorted by rank.",
        security: [],
        tags: ["Match Flow"],
        operationId: "getLeaderboard",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Leaderboard array sorted by rank",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/LeaderboardEntry" },
                    },
                  },
                },
                example: {
                  success: true,
                  data: [
                    {
                      rank: 1,
                      username: "ApexTrader",
                      pnl_percentage: 12.45,
                      reward: 150,
                      is_winner: true,
                    },
                    {
                      rank: 2,
                      username: "CryptoKing",
                      pnl_percentage: 9.82,
                      reward: 100,
                      is_winner: true,
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },

    "/matches/assets": {
      get: {
        summary: "Get Available Tokens",
        description:
          "Returns all 20 supported crypto tokens that can be selected for a portfolio.",
        security: [],
        tags: ["Matches"],
        operationId: "getAssets",
        responses: {
          200: {
            description: "List of supported tokens",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: [
                    { symbol: "BTC", name: "Bitcoin", icon: "₿" },
                    { symbol: "ETH", name: "Ethereum", icon: "Ξ" },
                  ],
                },
              },
            },
          },
        },
      },
    },

    "/users/history": {
      get: {
        summary: "Get User Match History",
        description:
          "Returns completed match history for the authenticated user, including rank, PnL, and reward earned.",
        tags: ["Users"],
        operationId: "getUserHistory",
        responses: {
          200: {
            description: "Array of past match results",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: [
                    {
                      match_title: "Crypto Classic #42",
                      rank: 3,
                      pnl_percentage: 12.5,
                      reward: 150,
                      is_winner: true,
                      date: "2026-02-19T00:00:00.000Z",
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },

    "/users/stats": {
      get: {
        summary: "Get User Stats",
        description:
          "Returns performance statistics: skill rating, total wins, earnings, and match count.",
        tags: ["Users"],
        operationId: "getUserStats",
        responses: {
          200: { description: "User stats object" },
        },
      },
    },
  },

  tags: [
    { name: "System", description: "Backend health and status" },
    {
      name: "Authentication",
      description: "Wallet-based auth — get a JWT token",
    },
    { name: "Matches", description: "Browse and discover matches" },
    {
      name: "Match Flow",
      description:
        "Participate: join → submit portfolio → track leaderboard → view results",
    },
    { name: "Users", description: "User profile, history, and stats" },
  ],
};
