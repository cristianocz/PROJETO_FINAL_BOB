# DIO Explorer — MCP Server

Servidor MCP (Model Context Protocol) que expõe o catálogo de trilhas da DIO como ferramentas de IA. Suporta dois modos de transporte:

| Modo | Uso |
|------|-----|
| **stdio** | Local — Bob / Claude Desktop / qualquer host MCP que spawne o processo |
| **http** | Remoto — HTTPS, SSO, integração via API REST |

---

## Estrutura

```
MCP/
├── src/
│   ├── index.ts     # Entry point — escolhe stdio ou HTTP
│   ├── tools.ts     # Todas as ferramentas MCP registradas
│   └── data.ts      # Leitura e cache dos dados JSON
├── build/           # Saída do TypeScript (gerada pelo build)
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Pré-requisitos

- Node.js ≥ 18
- npm ≥ 9

---

## Instalação e build

```bash
cd DIO_EXPLORER/MCP
npm install
npm run build
```

---

## Uso local (stdio) — integração com Bob

Após o build, registre no `mcp.json` do Bob:

```json
{
  "mcpServers": {
    "dio-explorer": {
      "command": "node",
      "args": ["C:/PROJETOS/PROJETO_FINAL_BOB/DIO_EXPLORER/MCP/build/index.js"]
    }
  }
}
```

Pronto. O Bob reconhecerá automaticamente as ferramentas abaixo.

---

## Uso remoto (HTTP / HTTPS / API)

### Iniciar o servidor HTTP

```bash
# Sem autenticação (desenvolvimento)
MCP_TRANSPORT=http PORT=3100 node build/index.js

# Com API Key (produção)
MCP_TRANSPORT=http PORT=3100 API_KEY=minha-chave-secreta node build/index.js
```

### Endpoints

| Método | Path | Descrição |
|--------|------|-----------|
| `GET`  | `/health` | Health-check (sem auth) |
| `GET`  | `/mcp` | Discovery / capacidades do servidor |
| `POST` | `/mcp` | Endpoint JSON-RPC 2.0 (protocolo MCP) |

### Autenticação

Quando `API_KEY` estiver definida, inclua o header em todas as requisições:

```
Authorization: Bearer <API_KEY>
```

### Exemplo de chamada direta via API

```bash
curl -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha-chave-secreta" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_trilhas",
      "arguments": {}
    }
  }'
```

---

## Ferramentas disponíveis

| Tool | Descrição |
|------|-----------|
| `list_trilhas` | Lista todas as trilhas (id, nome, tecnologia, nível, módulos, XP) |
| `get_trilha_by_id` | Detalhes completos de uma trilha por ID |
| `search_trilhas_by_tecnologia` | Filtra trilhas por tecnologia (case-insensitive) |
| `search_trilhas_by_nivel` | Filtra trilhas por nível de dificuldade |
| `list_promocoes` | Todas as promoções, cupons, descontos e ofertas vitalícias |
| `list_lives` | Lives agendadas — pode filtrar por data mínima |
| `ranking_trilhas_xp` | Ranking de trilhas por XP total |
| `get_estatisticas` | Estatísticas gerais do catálogo |

---

## HTTPS / Proxy reverso (produção)

Para expor com HTTPS, coloque um proxy reverso na frente (Nginx / Caddy / Traefik):

```nginx
# Exemplo Nginx
server {
    listen 443 ssl;
    server_name mcp.seudominio.com;

    ssl_certificate     /etc/letsencrypt/live/mcp.seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mcp.seudominio.com/privkey.pem;

    location / {
        proxy_pass         http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection keep-alive;
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Depois registre no Bob como servidor remoto:

```json
{
  "mcpServers": {
    "dio-explorer-remote": {
      "url": "https://mcp.seudominio.com/mcp",
      "headers": {
        "Authorization": "Bearer ${env:DIO_MCP_API_KEY}"
      }
    }
  }
}
```

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `MCP_TRANSPORT` | `stdio` | `stdio` ou `http` |
| `PORT` | `3100` | Porta HTTP |
| `HOST` | `0.0.0.0` | Bind address |
| `API_KEY` | _(vazio)_ | Chave Bearer; vazio = sem auth |
| `CORS_ORIGINS` | `*` | Origens CORS permitidas (CSV) |
