#!/usr/bin/env node
/**
 * DIO Explorer — MCP Server
 *
 * Modos de transporte suportados:
 *   stdio (padrão)  — para uso local com Bob / Claude Desktop
 *   http            — para acesso remoto via HTTPS, SSO ou API
 *
 * Variáveis de ambiente relevantes:
 *   MCP_TRANSPORT   = "stdio" | "http"   (padrão: stdio)
 *   PORT            = número             (padrão: 3100)
 *   HOST            = string             (padrão: 0.0.0.0)
 *   API_KEY         = string             (quando definida, exige Bearer token no header Authorization)
 *   CORS_ORIGINS    = string CSV         (padrão: * em dev, restritivo em prod)
 */

import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { registerTools } from "./tools.js";

const SERVER_NAME = "dio-explorer-mcp";
const SERVER_VERSION = "1.0.0";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function env(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

function createMcpServer(): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  registerTools(server);
  return server;
}

// ──────────────────────────────────────────────────────────────────────────────
// Modo stdio (local, usado pelo Bob / Claude Desktop)
// ──────────────────────────────────────────────────────────────────────────────

async function runStdio(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[${SERVER_NAME}] rodando em modo stdio`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Modo HTTP (remoto — HTTPS, SSO, API)
// ──────────────────────────────────────────────────────────────────────────────

async function runHttp(): Promise<void> {
  // Importações dinâmicas para não quebrar o bundle quando não instaladas
  const [{ default: express }, { default: cors }] = await Promise.all([
    import("express"),
    import("cors"),
  ]);

  const port = parseInt(env("PORT", "3100"), 10);
  const host = env("HOST", "0.0.0.0");
  const apiKey = env("API_KEY");
  const corsOrigins = env("CORS_ORIGINS", "*");

  const app = express();
  app.use(express.json());

  // CORS
  app.use(
    cors({
      origin: corsOrigins === "*" ? "*" : corsOrigins.split(",").map((s) => s.trim()),
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Mcp-Session-Id"],
    })
  );

  // ── Health-check (não requer auth — deve vir ANTES do middleware de auth) ──
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: SERVER_NAME, version: SERVER_VERSION });
  });

  // ── Middleware de autenticação Bearer / API Key ──────────────────────────
  app.use((req, res, next) => {
    if (!apiKey) return next(); // sem API_KEY configurada → acesso livre (dev)

    const authHeader = req.headers["authorization"] ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    if (token !== apiKey) {
      res.status(401).json({ error: "Unauthorized: API key inválida ou ausente." });
      return;
    }
    next();
  });

  // ── Endpoint MCP Streamable HTTP  ─────────────────────────────────────────
  // Cada POST em /mcp inicia uma sessão MCP stateless (Streamable HTTP)
  // Compatível com o protocolo MCP 2025-03-26.
  app.post("/mcp", async (req, res) => {
    try {
      const { StreamableHTTPServerTransport } = await import(
        "@modelcontextprotocol/server/http"
      );

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () =>
          `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
        // Habilita SSE para long-polling / SSO callbacks
        enableJsonResponse: false,
      });

      const server = createMcpServer();
      await server.connect(transport);

      res.on("close", () => {
        transport.close().catch(() => undefined);
      });

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("[mcp] erro no handler:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Erro interno no servidor MCP." });
      }
    }
  });

  // GET /mcp → retorna capacidades do servidor (discovery)
  app.get("/mcp", (_req, res) => {
    res.json({
      server: SERVER_NAME,
      version: SERVER_VERSION,
      protocol: "MCP/2025-03-26",
      transport: "StreamableHTTP",
      auth: apiKey ? "Bearer (API Key)" : "none",
      endpoint: "/mcp",
      tools_endpoint: "POST /mcp  (JSON-RPC 2.0)",
    });
  });

  app.listen(port, host, () => {
    console.error(
      `[${SERVER_NAME}] HTTP server ouvindo em http://${host}:${port}`
    );
    console.error(`  Health:   http://${host}:${port}/health`);
    console.error(`  MCP:      POST http://${host}:${port}/mcp`);
    console.error(`  Auth:     ${apiKey ? "Bearer (API_KEY)" : "desativada (defina API_KEY para habilitar)"}`);
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Entry point
// ──────────────────────────────────────────────────────────────────────────────

const transport = env("MCP_TRANSPORT", "stdio").toLowerCase();

(async () => {
  if (transport === "http") {
    await runHttp();
  } else {
    await runStdio();
  }
})().catch((error) => {
  console.error(`[${SERVER_NAME}] Erro fatal:`, error);
  process.exit(1);
});
