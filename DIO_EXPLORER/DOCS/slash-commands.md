# DIO Explorer — Guia de Slash Commands

Este documento descreve todos os slash commands disponíveis no **DIO Explorer**, como usá-los e quais respostas esperar. Todos os comandos são servidos pelo MCP Server e pelo motor de roteamento em `SRC/router.ts`.

---

## Índice

1. [Como funciona](#como-funciona)
2. [Comandos de Trilhas](#comandos-de-trilhas)
3. [Comandos de Desafios](#comandos-de-desafios)
4. [Comandos de Certificados](#comandos-de-certificados)
5. [Comandos de Promoções](#comandos-de-promoções)
6. [Comandos de Lives](#comandos-de-lives)
7. [Comandos de Recomendação](#comandos-de-recomendação)
8. [Comandos Utilitários](#comandos-utilitários)
9. [Aliases disponíveis](#aliases-disponíveis)
10. [Integração com o MCP Server](#integração-com-o-mcp-server)

---

## Como funciona

Todo slash command começa com `/` seguido do nome do comando e opcionalmente de argumentos separados por espaço.

```
/<comando> [arg1] [arg2] ...
```

O sistema aceita tanto o comando principal quanto seus **aliases** (nomes alternativos). Todos os comandos retornam texto em **Markdown** formatado.

---

## Comandos de Trilhas

### `/trilhas`
**Aliases:** `/catalogo`, `/listar`

Lista todas as 30 trilhas disponíveis no catálogo DIO com resumo de tecnologia, nível, módulos e XP.

```
/trilhas
```

**Retorna:**
```
# 📋 Trilhas Disponíveis

**1.** 🟢 **Formação Python Developer**
   _Python_ · Básico ao Avançado · 12 módulos · ⭐ 18.5k XP

**2.** 🟡 **Formação Java Developer**
   _Java_ · Intermediário · 14 módulos · ⭐ 22.0k XP
...
```

---

### `/trilha <id_ou_nome>`
**Aliases:** `/detalhe`, `/info`

Exibe todos os detalhes de uma trilha específica: tecnologia, nível, XP, badges, promoção ativa e lives agendadas.

```
/trilha 5
/trilha Python
/trilha Machine Learning
```

**Retorna:**
```
# 🟢 Formação Cloud AWS

> **Tecnologia:** Amazon Web Services  ·  **Nível:** Básico ao Avançado  ·  **16 módulos**

### ⭐ XP Total: 28.000
`█████████░` (93% do máximo do catálogo)

### 🏅 Badges que você pode conquistar
1. **Cloud Practitioner**
2. **AWS Solutions Architect**
...
```

---

### `/buscar <termo>`
**Aliases:** `/search`, `/filtrar`

Busca trilhas por tecnologia ou nível. A busca é case-insensitive e parcial.

```
/buscar Python
/buscar Avançado
/buscar cloud
/buscar mobile
```

---

## Comandos de Desafios

### `/desafios <trilha_id>`
**Aliases:** `/challenges`, `/projetos`

Lista os desafios práticos de uma trilha. Cada badge da trilha representa um desafio com descrição, XP de recompensa e badge a ser conquistado.

```
/desafios 1
/desafios 7
```

**Retorna:**
```
# ⚔️ Desafios — Formação Python Developer

> Esta trilha possui **4 desafios práticos** para você completar!

## 1. Desafio 1: Python Starter
📝 Conclua os módulos introdutórios de **Python** e entregue um projeto básico...
🏅 Badge: `Python Starter`  ·  ⭐ XP: 4.625

## 2. Desafio 2: Python Pro
📝 Desenvolva um projeto real utilizando recursos avançados de **Python**...
🏅 Badge: `Python Pro`  ·  ⭐ XP: 4.625
...
```

**Lógica dos desafios:**
- Cada badge disponível na trilha corresponde a um desafio
- O XP por desafio é calculado dividindo o XP total da trilha pelo número de badges
- A descrição é gerada automaticamente com base no nome do badge e na tecnologia

---

## Comandos de Certificados

### `/certificado <trilha_id>`
**Aliases:** `/cert`, `/badge`

Exibe os requisitos para obter o certificado de conclusão da trilha, incluindo módulos, badges, XP necessário e informações sobre o tipo de certificado emitido.

```
/certificado 1
/certificado 23
```

**Retorna:**
```
# 🎓 Certificado — Formação Python Developer

## Como obter seu certificado

Para conquistar o **Certificado DIO de Fundamentos em Python**, você precisa:

| Etapa | Requisito |
|-------|-----------|
| ✅ Módulos | Completar todos os **12 módulos** da trilha |
| ✅ Badges | Conquistar os **4 badges** disponíveis |
| ✅ XP | Acumular **18.500 XP** |
| ✅ Projetos | Entregar todos os desafios práticos |

## 🏅 Badges que compõem o certificado

1. 🥇 **Python Starter**
2. 🥇 **Python Pro**
...
```

**Níveis de certificado:**
| Nível da trilha | Tipo de certificado |
|-----------------|---------------------|
| Básico | Fundamentos |
| Intermediário | Profissional |
| Avançado | Especialista |
| Misto (ex: Básico ao Avançado) | Profissional |

---

## Comandos de Promoções

### `/promocoes`
**Aliases:** `/promo`, `/cupons`, `/desconto`

Lista todas as promoções do catálogo, ordenadas por maior desconto. Indica quais estão ativas (dentro da validade) e quais expiraram.

```
/promocoes
```

**Retorna:**
```
# 🎫 Promoções DIO

## ✅ Promoções Ativas (N)

### Formação Machine Learning
- 🏷️ **50% OFF** · Cupom: `ML50`
- Válido até: 15/10/2025
- 🔥 Oferta vitalícia: R$ 399.90 _(era R$ 549.90)_
...
```

---

## Comandos de Lives

### `/lives [data_minima]`
**Aliases:** `/ao-vivo`, `/agenda`, `/eventos`

Mostra as próximas lives ao vivo de todas as trilhas, agrupadas por data. Por padrão lista apenas lives futuras (a partir de hoje).

```
/lives
/lives 2025-09-01
```

**Retorna:**
```
# 📡 Próximas Lives ao Vivo

## 📅 10/08/2025

- **Python para Iniciantes**
  🕐 19:00  ·  Trilha: _Formação Python Developer_ (Python)

## 📅 15/08/2025

- **Spring Boot na Prática**
  🕐 19:30  ·  Trilha: _Formação Java Developer_ (Java)
...
```

---

## Comandos de Recomendação

### `/recomendar <nivel> [area]`
**Aliases:** `/quero`, `/me-indique`

Recomenda até 5 trilhas personalizadas com base no nível do usuário e área de interesse. Ordena por XP total (trilhas mais completas primeiro).

```
/recomendar iniciante
/recomendar iniciante web
/recomendar intermediario cloud
/recomendar avancado dados
/recomendar avancado ia
```

**Níveis válidos:**

| Parâmetro | Trilhas incluídas |
|-----------|-------------------|
| `iniciante` | Básico, Básico ao Intermediário, Básico ao Avançado |
| `intermediario` | Intermediário, Intermediário ao Avançado, Básico ao Avançado |
| `avancado` | Avançado, Intermediário ao Avançado |

**Áreas válidas:**

| Área | Tecnologias cobertas |
|------|---------------------|
| `web` | React, Angular, Vue.js, TypeScript, Node.js, PHP, Ruby, .NET |
| `mobile` | Flutter, Swift, Kotlin, Android, iOS |
| `cloud` | AWS, Azure, GCP, DevOps, Kubernetes |
| `dados` | Python, Spark, Databricks, Power BI, SQL, MongoDB |
| `seguranca` | Cybersecurity, Ethical Hacking |
| `backend` | Python, Java, Node.js, Go, Rust, PHP, .NET, Ruby |
| `ia` | LLMs, LangChain, TensorFlow, Scikit-Learn, Python |
| `blockchain` | Solidity, Ethereum, Web3 |
| `devops` | DevOps, Docker, Kubernetes, CI-CD |
| `fundamentos` | Redes, Sistemas Operacionais, Lógica, Scrum, Kanban |

---

## Comandos Utilitários

### `/ranking [top]`
**Aliases:** `/top`, `/melhores`

Exibe o ranking das trilhas por XP total. O parâmetro `top` limita o resultado.

```
/ranking
/ranking 5
/ranking 3
```

---

### `/stats`
**Aliases:** `/estatisticas`, `/resumo`

Mostra um resumo estatístico do catálogo completo.

```
/stats
```

**Retorna:**
```
# 📊 Estatísticas do Catálogo DIO

| Métrica | Valor |
|---------|-------|
| 📚 Total de trilhas | **30** |
| 🛠️ Tecnologias cobertas | **30** |
| 📦 Módulos totais | **330** |
| ⭐ XP total do catálogo | **584.000** |
| ⭐ XP médio por trilha | **19.467** |
| 📡 Lives agendadas | **52** |
| 🔥 Trilhas com oferta vitalícia | **22** |
```

---

### `/ajuda`
**Aliases:** `/help`, `/?`

Exibe uma tabela resumida com todos os comandos disponíveis.

```
/ajuda
```

---

## Aliases disponíveis

| Alias | Comando principal |
|-------|------------------|
| `/catalogo`, `/listar` | `/trilhas` |
| `/detalhe`, `/info` | `/trilha` |
| `/search`, `/filtrar` | `/buscar` |
| `/quero`, `/me-indique` | `/recomendar` |
| `/challenges`, `/projetos` | `/desafios` |
| `/cert`, `/badge` | `/certificado` |
| `/promo`, `/cupons`, `/desconto` | `/promocoes` |
| `/ao-vivo`, `/agenda`, `/eventos` | `/lives` |
| `/top`, `/melhores` | `/ranking` |
| `/estatisticas`, `/resumo` | `/stats` |
| `/help`, `/?` | `/ajuda` |

---

## Integração com o MCP Server

Cada slash command tem um **tool MCP correspondente**. O MCP Server expõe 12 tools:

| Slash Command | Tool MCP |
|---------------|----------|
| `/trilhas` | `list_trilhas` |
| `/trilha` | `get_trilha` |
| `/buscar` (tecnologia) | `search_trilhas_by_tecnologia` |
| `/buscar` (nível) | `search_trilhas_by_nivel` |
| `/recomendar` | `recomendar_trilhas` |
| `/desafios` | `list_desafios` |
| `/certificado` | `get_certificado_info` |
| `/promocoes` | `list_promocoes` |
| `/lives` | `list_lives` |
| `/ranking` | `ranking_trilhas_xp` |
| `/stats` | `get_estatisticas` |
| _(qualquer comando)_ | `executar_slash_command` |

O tool `executar_slash_command` aceita qualquer string de slash command e roteia para o handler correto, tornando o MCP Server um proxy completo para todos os comandos.

---

## Fonte dos dados

Todos os comandos usam o arquivo [`DATA/trilhas_dio.json`](../DATA/trilhas_dio.json) como única fonte de verdade. O arquivo contém **30 trilhas** com os campos:
- `id`, `nome`, `tecnologia`, `nivel`
- `numero_modulos`, `xp_total`
- `badges_disponiveis` (array — base para desafios e certificados)
- `promocoes` (desconto, validade, cupom)
- `promocao_vitalicia` (disponível, preço original, preço vitalício)
- `lives_ao_vivo` (título, data, horário)
