<div align="center">

# 🎓 DIO Explorer

**Assistente de IA integrado ao IBM Bob para explorar o catálogo de trilhas da Digital Innovation One**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A518-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Protocol-6B21A8?style=flat-square)](https://modelcontextprotocol.io/)
[![IBM Bob](https://img.shields.io/badge/IBM-Bob-0F62FE?style=flat-square)](https://ibm.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Funcionalidades](#-funcionalidades)
3. [Arquitetura](#-arquitetura)
4. [Estrutura de Arquivos](#-estrutura-de-arquivos)
5. [Pré-requisitos](#-pré-requisitos)
6. [Instalação e Build](#-instalação-e-build)
7. [Configuração no IBM Bob](#-configuração-no-ibm-bob)
8. [Slash Commands do Bob](#-slash-commands-do-bob-bobcommands)
9. [Slash Commands do Sistema](#-slash-commands-do-sistema)
10. [MCP Server](#-mcp-server)
11. [Modelo de Dados](#-modelo-de-dados)
12. [Como Usar](#-como-usar)
13. [Prompts — Engenharia e Análise](#-prompts--engenharia-e-análise)
14. [Dicas e Boas Práticas](#-dicas-e-boas-práticas)
15. [Insights para Profissionais](#-insights-para-profissionais)
16. [FAQ](#-faq)

---

## 🚀 Visão Geral

O **DIO Explorer** é um sistema integrado ao **IBM Bob** que transforma o catálogo de trilhas da [DIO (Digital Innovation One)](https://dio.me) em uma experiência interativa de IA. O usuário conversa em linguagem natural ou digita slash commands e recebe respostas formatadas em Markdown sobre trilhas, desafios de código, certificados, promoções e lives.

> **Propósito:** Tornar o catálogo de 30 trilhas da DIO acessível via linguagem natural e comandos estruturados, integrando a plataforma de IA IBM Bob com dados reais de cursos, XP, badges, promoções e eventos ao vivo.

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🗂️ **Exploração de Trilhas** | Lista, busca e detalhes de 30 trilhas com tecnologia, nível, módulos e XP |
| 🤖 **Recomendação Inteligente** | Sugere trilhas por nível do usuário (iniciante/intermediário/avançado) e área de interesse |
| ⚔️ **Desafios de Código** | Gera desafios criativos por tecnologia e nível com exemplos reais |
| 🎓 **Certificados** | Emite certificados comemorativos com dados reais da trilha |
| 🎫 **Promoções e Cupons** | Lista promoções ativas com desconto, validade e cupons |
| 📡 **Agenda de Lives** | Mostra próximas aulas ao vivo agrupadas por data |
| 🏆 **Ranking e Estatísticas** | XP ranking e métricas gerais do catálogo |

---

## 🏗️ Arquitetura

```
Usuário / Bob  →  .bob/commands/  →  MCP Server  →  DATA/trilhas_dio.json
   (input)        (prompts de         (12 tools       (30 trilhas, badges,
                   sistema)         TypeScript via     promoções, lives)
                                    stdio ou HTTP)
```

O projeto tem **dois módulos paralelos** com a mesma lógica de negócio:

- **`MCP/src/`** — compilado e servido via protocolo MCP (integração com Bob)
- **`SRC/`** — código standalone para testes e uso direto sem MCP

---

## 📁 Estrutura de Arquivos

```
PROJETO_FINAL_BOB/
├── .bob/
│   ├── commands/
│   │   ├── trilha.md         ← Prompt: exibe plano de estudos de uma trilha
│   │   ├── desafio.md        ← Prompt: gera desafio de código criativo
│   │   └── certificado.md    ← Prompt: emite certificado de conclusão
│   └── artifacts/
│       └── *.html            ← Artefatos gerados pelo Bob
│
└── DIO_EXPLORER/
    ├── COMMANDS/
    │   └── slash-commands.json   ← Definição JSON de todos os comandos
    ├── DATA/
    │   └── trilhas_dio.json      ← Fonte de dados: 30 trilhas DIO
    ├── DOCS/
    │   └── slash-commands.md     ← Documentação detalhada dos comandos
    ├── MCP/                      ← MCP Server (Node.js / TypeScript)
    │   ├── src/
    │   │   ├── index.ts          ← Entry point (stdio ou HTTP)
    │   │   ├── tools.ts          ← 12 tools MCP registradas
    │   │   ├── data.ts           ← Leitura e cache do JSON
    │   │   └── formatters.ts     ← Formatadores Markdown
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── .env.example
    └── SRC/                      ← Módulo standalone (sem MCP)
        ├── router.ts             ← Router de slash commands
        ├── data.ts               ← Mesma lógica de dados
        ├── formatters.ts         ← Mesmos formatadores
        └── tsconfig.json
```

---

## 🔧 Pré-requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9
- **IBM Bob** instalado e configurado

---

## ⚙️ Instalação e Build

```bash
# Clone o repositório
git clone https://github.com/cristianocz/PROJETO_FINAL_BOB.git
cd PROJETO_FINAL_BOB

# Instale as dependências do MCP Server
cd DIO_EXPLORER/MCP
npm install

# Compile o TypeScript
npm run build
```

---

## 🤖 Configuração no IBM Bob

Após o build, registre o servidor no `mcp.json` do Bob:

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

> O Bob reconhecerá automaticamente todas as 12 tools e os 3 slash commands de prompt.

---

## 📝 Slash Commands do Bob (`.bob/commands`)

Estes são os **prompts de sistema** registrados no Bob. Quando o usuário digita o comando, o Bob injeta o prompt como contexto e executa a instrução.

### `/trilha <tecnologia>`
> Arquivo: [`.bob/commands/trilha.md`](.bob/commands/trilha.md)

Lê `trilhas_dio.json`, localiza a trilha por nome ou tecnologia (busca parcial, case-insensitive) e exibe um **plano de estudos completo** em Markdown.

- Gera lista de módulos progressivos baseada em `numero_modulos`
- Exibe badges disponíveis, lives agendadas e promoção ativa
- **Fallback:** se não encontrar a trilha, lista todas as tecnologias disponíveis em tabela
- Termina com CTA para `/desafio` e `/certificado`

```
/trilha Python
/trilha aws
/trilha Machine Learning
```

---

### `/desafio <tecnologia> <nível>`
> Arquivo: [`.bob/commands/desafio.md`](.bob/commands/desafio.md)

Gera um **desafio de código criativo e único** com contexto de cenário real, requisitos funcionais, restrições técnicas, exemplos de entrada/saída e critérios de avaliação.

| Nível | Complexidade esperada |
|---|---|
| Básico / Iniciante | Lógica simples, strings/arrays, estruturas de controle |
| Intermediário | OOP, APIs, estruturas de dados, padrões de projeto básicos |
| Avançado | Algoritmos O(n log n)+, concorrência, otimização de memória |

```
/desafio Python Intermediário
/desafio TypeScript Avançado
/desafio Go Básico
```

---

### `/certificado <nome> <trilha>`
> Arquivo: [`.bob/commands/certificado.md`](.bob/commands/certificado.md)

Gera um **certificado comemorativo** em Markdown com dados reais da trilha (lidos do JSON), data atual, código único de 12 caracteres e assinaturas.

- Usa dados reais se encontrar a trilha, ou gera valores coerentes como fallback
- Data gerada automaticamente no formato `DD/MM/AAAA`
- Código único alfanumérico de 12 caracteres em maiúsculas

```
/certificado João Silva Python
/certificado Maria AWS Developer
```

---

## 🎮 Slash Commands do Sistema

Além dos 3 prompts do Bob, o sistema possui **11 slash commands** implementados no router TypeScript com aliases e roteamento dinâmico.

| Comando | Aliases | Descrição |
|---|---|---|
| `/trilhas` | `/catalogo`, `/listar` | Lista todas as 30 trilhas com resumo |
| `/trilha <id\|nome>` | `/detalhe`, `/info` | Detalhes completos de uma trilha |
| `/buscar <termo>` | `/search`, `/filtrar` | Busca por tecnologia ou nível |
| `/recomendar <nível> [área]` | `/quero`, `/me-indique` | Recomenda trilhas por perfil |
| `/desafios <id>` | `/challenges`, `/projetos` | Lista desafios práticos da trilha |
| `/certificado <id>` | `/cert`, `/badge` | Requisitos para obter o certificado |
| `/promocoes` | `/promo`, `/cupons`, `/desconto` | Lista promoções ativas com cupons |
| `/lives [data]` | `/ao-vivo`, `/agenda`, `/eventos` | Próximas aulas ao vivo |
| `/ranking [top]` | `/top`, `/melhores` | Ranking de trilhas por XP |
| `/stats` | `/estatisticas`, `/resumo` | Estatísticas gerais do catálogo |
| `/ajuda` | `/help`, `/?` | Lista todos os comandos |

### Áreas disponíveis para `/recomendar`

| Área | Tecnologias cobertas |
|---|---|
| `web` | React, Angular, Vue.js, TypeScript, Node.js, PHP, Ruby, .NET |
| `mobile` | Flutter, Swift, Kotlin, Android, iOS |
| `cloud` | AWS, Azure, GCP, DevOps, Kubernetes |
| `dados` | Python, Spark, Databricks, Power BI, SQL, MongoDB |
| `ia` | LLMs, LangChain, TensorFlow, Scikit-Learn, Python |
| `devops` | DevOps, Docker, Kubernetes, CI-CD |
| `seguranca` | Cybersecurity, Ethical Hacking |
| `blockchain` | Solidity, Ethereum, Web3 |
| `backend` | Python, Java, Node.js, Go, Rust, PHP, .NET, Ruby |
| `fundamentos` | Redes, Sistemas Operacionais, Lógica, Scrum, Kanban |

---

## 🖥️ MCP Server

O coração técnico do projeto. Implementa o **Model Context Protocol (MCP)** expondo 12 tools que o IBM Bob usa automaticamente.

### Modos de Transporte

| Modo | Variável | Quando usar |
|---|---|---|
| **stdio** (padrão) | `MCP_TRANSPORT=stdio` | Local com Bob / Claude Desktop |
| **HTTP** | `MCP_TRANSPORT=http` | Remoto via HTTPS, APIs REST |

### Scripts disponíveis

```bash
npm run build       # Compila TypeScript → build/
npm start           # Inicia em modo stdio
npm run start:http  # Inicia em modo HTTP (porta 3100)
npm run dev         # Modo watch (recompila automaticamente)
```

### Modo HTTP com autenticação

```bash
# Sem autenticação (desenvolvimento)
MCP_TRANSPORT=http PORT=3100 node build/index.js

# Com API Key (produção)
MCP_TRANSPORT=http PORT=3100 API_KEY=minha-chave-secreta node build/index.js
```

```bash
# Chamada direta via curl
curl -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha-chave-secreta" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": { "name": "list_trilhas", "arguments": {} }
  }'
```

### 12 Tools Registradas

| Tool MCP | Slash Command | Parâmetros |
|---|---|---|
| `list_trilhas` | `/trilhas` | — |
| `get_trilha` | `/trilha` | `id_ou_nome` (string\|number) |
| `search_trilhas_by_tecnologia` | `/buscar` | `tecnologia` (string) |
| `search_trilhas_by_nivel` | `/buscar` | `nivel` (string) |
| `recomendar_trilhas` | `/recomendar` | `nivel` (enum), `area`? (string) |
| `list_desafios` | `/desafios` | `trilha_id` (number) |
| `get_certificado_info` | `/certificado` | `trilha_id` (number) |
| `list_promocoes` | `/promocoes` | — |
| `list_lives` | `/lives` | `data_minima`? (YYYY-MM-DD) |
| `ranking_trilhas_xp` | `/ranking` | `top`? (number) |
| `get_estatisticas` | `/stats` | — |
| `executar_slash_command` | qualquer | `comando` (string completa) |

### Endpoints HTTP

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `GET` | `/health` | Não | Health-check |
| `GET` | `/mcp` | Sim | Discovery / capacidades |
| `POST` | `/mcp` | Sim | JSON-RPC 2.0 (protocolo MCP) |

### Variáveis de Ambiente

Copie `.env.example` para `.env` e ajuste:

| Variável | Padrão | Descrição |
|---|---|---|
| `MCP_TRANSPORT` | `stdio` | `stdio` ou `http` |
| `PORT` | `3100` | Porta do servidor HTTP |
| `HOST` | `0.0.0.0` | Endereço de bind |
| `API_KEY` | _(vazio)_ | Chave Bearer; vazio = sem auth |
| `CORS_ORIGINS` | `*` | Origens CORS permitidas (CSV) |

---

## 📊 Modelo de Dados

Arquivo único [`DIO_EXPLORER/DATA/trilhas_dio.json`](DIO_EXPLORER/DATA/trilhas_dio.json) com **30 trilhas** — fonte de verdade de todo o sistema.

### Schema de uma trilha

```json
{
  "id": 1,
  "nome": "Formação Python Developer",
  "tecnologia": "Python",
  "nivel": "Básico ao Avançado",
  "numero_modulos": 12,
  "xp_total": 18500,
  "badges_disponiveis": ["Python Starter", "Python Pro", "Python Expert", "Python Master"],
  "promocoes": {
    "desconto_percentual": 30,
    "validade": "2025-09-30",
    "cupom": "PYTHON30"
  },
  "promocao_vitalicia": {
    "disponivel": true,
    "preco_original": 549.90,
    "preco_vitalicio": 399.90
  },
  "lives_ao_vivo": [
    { "titulo": "Python para Iniciantes", "data": "2025-08-10", "horario": "19:00" }
  ]
}
```

| Campo | Tipo | Usado em |
|---|---|---|
| `id`, `nome`, `tecnologia`, `nivel` | string/number | Busca, listagem, filtros |
| `numero_modulos`, `xp_total` | number | Ranking, estatísticas, certificados |
| `badges_disponiveis` | string[] | Desafios, certificados |
| `promocoes` | object | `/promocoes` — desconto, validade, cupom |
| `promocao_vitalicia` | object | `/trilha` — oferta lifetime |
| `lives_ao_vivo` | array | `/lives` — agenda de eventos |

---

## 💻 Como Usar

### Fluxo 1: Explorar e escolher uma trilha

```
# Ver todas as trilhas disponíveis
/trilhas

# Buscar por tecnologia
/buscar React

# Ver detalhes de uma trilha específica
/trilha 3

# Ver recomendações para seu perfil
/recomendar intermediario web
```

### Fluxo 2: Praticar com desafios

```
# Ver desafios práticos de uma trilha
/desafios 1

# Gerar um desafio de código criativo (prompt do Bob)
/desafio TypeScript Avançado

# Ver o que é necessário para o certificado
/certificado 1
```

### Fluxo 3: Aproveitar promoções e lives

```
# Ver todas as promoções com cupons
/promocoes

# Ver agenda de lives da semana
/lives

# Lives a partir de uma data específica
/lives 2025-09-01
```

### Fluxo 4: Estatísticas e ranking

```
# Estatísticas do catálogo inteiro
/stats

# Ranking top 5 trilhas por XP
/ranking 5
```

> 💡 **Dica Pro:** O Bob entende linguagem natural! Você pode perguntar *"Quais trilhas de cloud existem?"* e ele usará automaticamente a tool `search_trilhas_by_tecnologia` sem precisar do slash command.

---

## 🧠 Prompts — Engenharia e Análise

Cada arquivo `.bob/commands/*.md` é um prompt de sistema com técnicas específicas de **Prompt Engineering**.

### `/trilha` — Plano de Estudos

| Técnica | Onde aparece |
|---|---|
| **Grounding em dados externos** | "Leia o arquivo `DIO_EXPLORER/DATA/trilhas_dio.json`" |
| **Busca fuzzy e case-insensitive** | "correspondência parcial aceita — 'python' deve encontrar 'Python'" |
| **Fallback explícito** | "Se não encontrar: liste todas em tabela" |
| **Template de saída fechado** | Modelo Markdown com placeholders `{nome}`, `{tecnologia}` |
| **Geração contextual** | "Os títulos devem ser realistas e progressivos com a tecnologia" |
| **CTA (Call to Action)** | Sugere `/desafio` e `/certificado` no final |

### `/desafio` — Geração de Desafio

| Técnica | Onde aparece |
|---|---|
| **Parâmetros nomeados** | `$1` = tecnologia, `$2` = nível |
| **Randomização controlada** | "Escolha aleatoriamente um tema diferente a cada execução" |
| **Tabela de rubrica** | Define explicitamente a complexidade por nível |
| **Estrutura de saída obrigatória** | 7 seções fixas: Descrição, Objetivo, Requisitos, Restrições, Exemplos, Critérios, Dica |
| **Anti-spoiler** | "1 dica útil sem revelar a solução" |

### `/certificado` — Emissão de Certificado

| Técnica | Onde aparece |
|---|---|
| **Leitura condicional de dados** | "Se encontrar, use dados reais; se não, gere valores coerentes" |
| **Data dinâmica real** | "Gere a data de emissão com a data atual real no formato DD/MM/AAAA" |
| **Código único gerado** | "String alfanumérica única de 12 caracteres em maiúsculas" |
| **Resposta exclusiva** | "Responda exclusivamente com o certificado, sem texto antes ou depois" |
| **Arte ASCII** | Moldura visual com caracteres box-drawing para impacto visual |

> **Insight:** Os 3 prompts usam a técnica de **"template de saída fechado"** — o modelo de resposta é especificado no prompt como Markdown com placeholders. Isso garante consistência visual e elimina texto extra indesejado.

---

## 💡 Dicas e Boas Práticas

### Desenvolvimento

**Separação de módulos:** O código em `SRC/` e `MCP/src/` é intencionalmente paralelo. Isso permite testar a lógica isolada sem o protocolo MCP. Em projetos maiores, extraia para um pacote compartilhado (`@dio-explorer/core`).

**Cache do JSON:** O `data.ts` usa um cache em nível de módulo (`let _cache`) que persiste durante toda a vida do processo. Em modo HTTP stateless com atualizações frequentes do JSON, adicione invalidação com TTL.

**Zod para validação:** Todas as tools MCP usam `z.object({...})` para validar entrada. Isso garante erros descritivos sem `try/catch` manual nos parâmetros.

**Tool genérica como fallback:** A tool `executar_slash_command` aceita qualquer string de comando e roteia internamente — útil para clientes que preferem passar o comando completo como texto.

### Prompts

**Argument hint:** O frontmatter `argument-hint` nos `.md` instrui o Bob a sugerir o formato correto ao autocompletar. Use sempre para comandos com parâmetros.

**Caminhos de arquivo:** Mantenha os caminhos relativos ao workspace raiz nos prompts para evitar problemas de resolução pelo Bob.

### Segurança

> ⚠️ **Nunca** suba o arquivo `.env` com `API_KEY` preenchida para o repositório. Use `.env.example` como template e adicione `.env` ao `.gitignore`.

> ⚠️ O padrão `CORS_ORIGINS=*` é adequado apenas para desenvolvimento. Em produção, defina origens específicas: `CORS_ORIGINS=https://meusite.com`

---

## 🔮 Insights para Profissionais

1. **O padrão "dados + prompt + ferramenta"** — Este projeto demonstra a arquitetura fundamental de aplicações de IA: JSON como fonte de verdade, prompts que instruem o modelo a lê-lo, e tools MCP que fazem a ponte. Esse padrão escala para bancos de dados reais substituindo apenas a camada `data.ts`.

2. **MCP como API universal de IA** — O Model Context Protocol é o "HTTP das ferramentas de IA". Uma vez publicado um MCP Server, qualquer cliente compatível (Bob, Claude Desktop, VS Code) pode usar suas tools sem reescrever integrações.

3. **Slash commands como UX de IA** — Enquanto linguagem natural é poderosa, slash commands oferecem **previsibilidade**: o usuário sabe exatamente o que vai receber. A combinação dos dois é a melhor UX para assistentes produtivos.

4. **Template de saída como contrato** — Definir o formato de saída no prompt é equivalente a um contrato de API: o modelo sabe o que produzir, e o cliente sabe o que esperar. Fundamental para integração com sistemas downstream.

5. **Prompts como código (MLOps)** — Cada `.md` em `.bob/commands/` é um prompt isolado, versionável, revisável em PR e documentável. Tratar prompts como código é uma prática de MLOps essencial para projetos com IA.

6. **TypeScript + Zod = MCP Server robusto** — A combinação de TypeScript (tipagem estática) + Zod (validação em runtime) + MCP SDK cria um servidor seguro, documentado e extensível. Os tipos em `data.ts` também servem como documentação viva do schema JSON.

---

## ❓ FAQ

**Como adicionar uma nova trilha ao catálogo?**
Edite `DIO_EXPLORER/DATA/trilhas_dio.json` seguindo o schema existente. Não é necessário recompilar — o JSON é lido em runtime. O cache se reinicia com o processo.

**Como criar um novo slash command?**
1. Crie `.bob/commands/meucomando.md` com frontmatter `description` e `argument-hint`
2. Adicione o handler em `SRC/router.ts` e `MCP/src/tools.ts`
3. Registre no `COMMANDS/slash-commands.json`

**Como expor o MCP Server via HTTPS?**
Use um proxy reverso (Nginx, Caddy ou Traefik) na frente da porta 3100 com certificado SSL. Depois registre no Bob com a URL HTTPS no `mcp.json`.

**Os certificados são válidos de verdade?**
Não — são fictícios e comemorativos, criados para fins de aprendizado. Para certificados oficiais DIO, acesse [dio.me](https://dio.me).

**Qual versão do Node.js é necessária?**
Node.js ≥ 18 e npm ≥ 9. O projeto usa ES Modules (`"type": "module"`) e imports dinâmicos, que requerem Node 18+.

**O que é a tool `executar_slash_command`?**
É uma tool "coringa" que aceita qualquer slash command como string (ex: `/recomendar iniciante web`) e roteia internamente para o handler correto — útil para clientes que preferem passar comandos como texto.

---

<div align="center">

**DIO Explorer** · Projeto Final IBM Bob

Desenvolvido com ❤️ usando [IBM Bob](https://ibm.com) · [DIO](https://dio.me)

</div>
