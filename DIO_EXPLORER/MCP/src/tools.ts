import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { getTrilhas, getTrilhaByNomeOuId } from "./data.js";
import {
  formatTrilhaLista,
  formatTrilhaDetalhe,
  formatDesafios,
  formatCertificado,
  formatPromocoes,
  formatLives,
  formatRanking,
  formatEstatisticas,
  formatRecomendacao,
} from "./formatters.js";
import { NIVEL_MAP, AREA_MAP } from "./data.js";

// ── Formatadores e dados ficam em MCP/src/ para compilação isolada ──────────

function ok(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function err(msg: string) {
  return { content: [{ type: "text" as const, text: msg }], isError: true as const };
}

export function registerTools(server: McpServer): void {

  // ─── /trilhas ──────────────────────────────────────────────────────────────
  server.registerTool(
    "list_trilhas",
    {
      description: "Lista todas as trilhas do catálogo DIO com resumo de tecnologia, nível, módulos e XP. Corresponde ao slash command /trilhas.",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        return ok(formatTrilhaLista(getTrilhas()));
      } catch (e) {
        return err(`Erro ao listar trilhas: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );

  // ─── /trilha <id|nome> ─────────────────────────────────────────────────────
  server.registerTool(
    "get_trilha",
    {
      description: "Retorna detalhes completos de uma trilha pelo ID numérico ou nome parcial. Corresponde ao slash command /trilha.",
      inputSchema: z.object({
        id_ou_nome: z.union([z.number(), z.string()]).describe("ID numérico ou nome parcial da trilha"),
      }),
    },
    async ({ id_ou_nome }) => {
      try {
        const trilha = getTrilhaByNomeOuId(id_ou_nome);
        if (!trilha) return err(`Trilha não encontrada: "${id_ou_nome}". Use list_trilhas para ver todas.`);
        return ok(formatTrilhaDetalhe(trilha));
      } catch (e) {
        return err(`Erro: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );

  // ─── /buscar <termo> ───────────────────────────────────────────────────────
  server.registerTool(
    "search_trilhas_by_tecnologia",
    {
      description: "Busca trilhas por tecnologia (ex: Python, Java, React). Case-insensitive. Corresponde ao slash command /buscar.",
      inputSchema: z.object({
        tecnologia: z.string().describe("Nome da tecnologia a filtrar"),
      }),
    },
    async ({ tecnologia }) => {
      try {
        const resultados = getTrilhas().filter((t) =>
          t.tecnologia.toLowerCase().includes(tecnologia.toLowerCase()) ||
          t.nome.toLowerCase().includes(tecnologia.toLowerCase())
        );
        if (resultados.length === 0)
          return ok(`Nenhuma trilha encontrada para a tecnologia "${tecnologia}".`);
        return ok(formatTrilhaLista(resultados, `🔍 Trilhas para "${tecnologia}"`));
      } catch (e) {
        return err(`Erro: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );

  // ─── busca por nível ───────────────────────────────────────────────────────
  server.registerTool(
    "search_trilhas_by_nivel",
    {
      description: "Filtra trilhas por nível de dificuldade (ex: Básico, Intermediário, Avançado).",
      inputSchema: z.object({
        nivel: z.string().describe("Nível de dificuldade"),
      }),
    },
    async ({ nivel }) => {
      try {
        const resultados = getTrilhas().filter((t) =>
          t.nivel.toLowerCase().includes(nivel.toLowerCase())
        );
        if (resultados.length === 0)
          return ok(`Nenhuma trilha encontrada para o nível "${nivel}".`);
        return ok(formatTrilhaLista(resultados, `🔍 Trilhas — Nível "${nivel}"`));
      } catch (e) {
        return err(`Erro: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );

  // ─── /recomendar <nivel> [area] ────────────────────────────────────────────
  server.registerTool(
    "recomendar_trilhas",
    {
      description: "Recomenda trilhas personalizadas com base no nível do usuário (iniciante/intermediario/avancado) e área de interesse (web, mobile, cloud, dados, etc). Corresponde ao slash command /recomendar.",
      inputSchema: z.object({
        nivel: z.enum(["iniciante", "intermediario", "avancado"]).describe("Nível de experiência do usuário"),
        area: z.string().optional().describe("Área de interesse: web, mobile, cloud, dados, seguranca, backend, ia, blockchain, devops, fundamentos"),
      }),
    },
    async ({ nivel, area }) => {
      try {
        const niveisAceitos = NIVEL_MAP[nivel];
        let candidatas = getTrilhas().filter((t) =>
          niveisAceitos.some((n) => t.nivel.toLowerCase().includes(n.toLowerCase()))
        );
        if (area && AREA_MAP[area]) {
          const techs = AREA_MAP[area].map((t) => t.toLowerCase());
          candidatas = candidatas.filter((t) =>
            techs.some((tech) => t.tecnologia.toLowerCase().includes(tech))
          );
        }
        if (candidatas.length === 0)
          return ok(`Nenhuma trilha encontrada para o perfil ${nivel}${area ? ` · ${area}` : ""}.`);
        candidatas = candidatas.sort((a, b) => b.xp_total - a.xp_total).slice(0, 5);
        return ok(formatRecomendacao(candidatas, nivel, area));
      } catch (e) {
        return err(`Erro: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );

  // ─── /desafios <id> ────────────────────────────────────────────────────────
  server.registerTool(
    "list_desafios",
    {
      description: "Lista os desafios práticos de uma trilha pelo ID. Cada badge da trilha corresponde a um desafio. Corresponde ao slash command /desafios.",
      inputSchema: z.object({
        trilha_id: z.number().int().positive().describe("ID da trilha"),
      }),
    },
    async ({ trilha_id }) => {
      try {
        const trilha = getTrilhaByNomeOuId(trilha_id);
        if (!trilha) return err(`Trilha com id ${trilha_id} não encontrada.`);
        return ok(formatDesafios(trilha));
      } catch (e) {
        return err(`Erro: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );

  // ─── /certificado <id> ─────────────────────────────────────────────────────
  server.registerTool(
    "get_certificado_info",
    {
      description: "Exibe informações sobre o certificado e os badges de uma trilha, incluindo requisitos para obter o certificado. Corresponde ao slash command /certificado.",
      inputSchema: z.object({
        trilha_id: z.number().int().positive().describe("ID da trilha"),
      }),
    },
    async ({ trilha_id }) => {
      try {
        const trilha = getTrilhaByNomeOuId(trilha_id);
        if (!trilha) return err(`Trilha com id ${trilha_id} não encontrada.`);
        return ok(formatCertificado(trilha));
      } catch (e) {
        return err(`Erro: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );

  // ─── /promocoes ────────────────────────────────────────────────────────────
  server.registerTool(
    "list_promocoes",
    {
      description: "Lista todas as promoções do catálogo, com cupom, desconto e status (ativa/expirada). Corresponde ao slash command /promocoes.",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        return ok(formatPromocoes(getTrilhas()));
      } catch (e) {
        return err(`Erro: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );

  // ─── /lives ────────────────────────────────────────────────────────────────
  server.registerTool(
    "list_lives",
    {
      description: "Lista as próximas lives ao vivo de todas as trilhas, agrupadas por data. Corresponde ao slash command /lives.",
      inputSchema: z.object({
        data_minima: z.string().optional().describe("Data mínima no formato YYYY-MM-DD. Padrão: hoje."),
      }),
    },
    async ({ data_minima }) => {
      try {
        const corte = data_minima ?? new Date().toISOString().split("T")[0];
        const lives: Array<{
          trilha_id: number; trilha_nome: string; tecnologia: string;
          titulo: string; data: string; horario: string;
        }> = [];
        for (const t of getTrilhas()) {
          for (const l of t.lives_ao_vivo) {
            if (l.data >= corte) {
              lives.push({ trilha_id: t.id, trilha_nome: t.nome, tecnologia: t.tecnologia, titulo: l.titulo, data: l.data, horario: l.horario });
            }
          }
        }
        lives.sort((a, b) => a.data.localeCompare(b.data));
        return ok(formatLives(lives));
      } catch (e) {
        return err(`Erro: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );

  // ─── /ranking ──────────────────────────────────────────────────────────────
  server.registerTool(
    "ranking_trilhas_xp",
    {
      description: "Retorna o ranking das trilhas por XP total (maior primeiro). Corresponde ao slash command /ranking.",
      inputSchema: z.object({
        top: z.number().int().positive().optional().describe("Limitar aos N primeiros. Padrão: 10."),
      }),
    },
    async ({ top }) => {
      try {
        const trilhas = getTrilhas().slice().sort((a, b) => b.xp_total - a.xp_total);
        return ok(formatRanking(trilhas, top ?? 10));
      } catch (e) {
        return err(`Erro: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );

  // ─── /stats ────────────────────────────────────────────────────────────────
  server.registerTool(
    "get_estatisticas",
    {
      description: "Retorna estatísticas gerais do catálogo DIO (total de trilhas, tecnologias, XP médio, lives, etc). Corresponde ao slash command /stats.",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        return ok(formatEstatisticas(getTrilhas()));
      } catch (e) {
        return err(`Erro: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );

  // ─── comando genérico (aceita qualquer slash command como string) ──────────
  server.registerTool(
    "executar_slash_command",
    {
      description: "Executa qualquer slash command do DIO Explorer e retorna a resposta formatada. Ex: '/trilhas', '/recomendar iniciante web', '/desafios 1', '/certificado 3'.",
      inputSchema: z.object({
        comando: z.string().describe("O slash command completo incluindo o / e os argumentos. Ex: /recomendar iniciante web"),
      }),
    },
    async ({ comando }) => {
      try {
        return ok(routeSlashCommand(comando));
      } catch (e) {
        return err(`Erro ao executar comando "${comando}": ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Router embutido para o tool genérico
// ────────────────────────────────────────────────────────────────────────────

function routeSlashCommand(input: string): string {
  const parts = input.trim().split(/\s+/);
  const cmd = (parts[0] ?? "").toLowerCase();
  const args = parts.slice(1);

  const aliases: Record<string, string> = {
    "/catalogo": "/trilhas", "/listar": "/trilhas",
    "/detalhe": "/trilha", "/info": "/trilha",
    "/search": "/buscar", "/filtrar": "/buscar",
    "/quero": "/recomendar", "/me-indique": "/recomendar",
    "/challenges": "/desafios", "/projetos": "/desafios",
    "/cert": "/certificado", "/badge": "/certificado",
    "/promo": "/promocoes", "/cupons": "/promocoes", "/desconto": "/promocoes",
    "/ao-vivo": "/lives", "/agenda": "/lives", "/eventos": "/lives",
    "/top": "/ranking", "/melhores": "/ranking",
    "/estatisticas": "/stats", "/resumo": "/stats",
    "/help": "/ajuda", "/?": "/ajuda",
  };

  const resolved = aliases[cmd] ?? cmd;
  const trilhas = getTrilhas();

  switch (resolved) {
    case "/trilhas":
      return formatTrilhaLista(trilhas);
    case "/trilha": {
      if (!args[0]) return `❌ Uso: \`/trilha <id ou nome>\``;
      const t = getTrilhaByNomeOuId(/^\d+$/.test(args[0]) ? Number(args[0]) : args.join(" "));
      return t ? formatTrilhaDetalhe(t) : `❌ Trilha não encontrada: "${args.join(" ")}"`;
    }
    case "/buscar": {
      if (!args[0]) return `❌ Uso: \`/buscar <termo>\``;
      const termo = args.join(" ").toLowerCase();
      const r = trilhas.filter((t) => t.nivel.toLowerCase().includes(termo) || t.tecnologia.toLowerCase().includes(termo) || t.nome.toLowerCase().includes(termo));
      return r.length > 0 ? formatTrilhaLista(r, `🔍 Resultado para "${args.join(" ")}"`) : `Nenhuma trilha encontrada para "${args.join(" ")}"`;
    }
    case "/recomendar": {
      if (!args[0]) return `❌ Uso: \`/recomendar <nivel> [area]\`\nNíveis: iniciante · intermediario · avancado`;
      const nivelInput = args[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const areaInput = args[1]?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const niveisAceitos = NIVEL_MAP[nivelInput];
      if (!niveisAceitos) return `❌ Nível inválido: ${args[0]}. Use: iniciante, intermediario ou avancado`;
      let cands = trilhas.filter((t) => niveisAceitos.some((n) => t.nivel.toLowerCase().includes(n.toLowerCase())));
      if (areaInput && AREA_MAP[areaInput]) {
        const techs = AREA_MAP[areaInput].map((t) => t.toLowerCase());
        cands = cands.filter((t) => techs.some((tech) => t.tecnologia.toLowerCase().includes(tech)));
      }
      if (cands.length === 0) return `Nenhuma trilha para o perfil ${args[0]}${args[1] ? ` · ${args[1]}` : ""}.`;
      return formatRecomendacao(cands.sort((a, b) => b.xp_total - a.xp_total).slice(0, 5), args[0], args[1]);
    }
    case "/desafios": {
      if (!args[0]) return `❌ Uso: \`/desafios <id>\``;
      const t = getTrilhaByNomeOuId(args[0]);
      return t ? formatDesafios(t) : `❌ Trilha não encontrada: "${args[0]}"`;
    }
    case "/certificado": {
      if (!args[0]) return `❌ Uso: \`/certificado <id>\``;
      const t = getTrilhaByNomeOuId(args[0]);
      return t ? formatCertificado(t) : `❌ Trilha não encontrada: "${args[0]}"`;
    }
    case "/promocoes":
      return formatPromocoes(trilhas);
    case "/lives": {
      const corte = args[0] ?? new Date().toISOString().split("T")[0];
      const lives: Array<{ trilha_id: number; trilha_nome: string; tecnologia: string; titulo: string; data: string; horario: string }> = [];
      for (const t of trilhas) for (const l of t.lives_ao_vivo) if (l.data >= corte) lives.push({ trilha_id: t.id, trilha_nome: t.nome, tecnologia: t.tecnologia, titulo: l.titulo, data: l.data, horario: l.horario });
      lives.sort((a, b) => a.data.localeCompare(b.data));
      return formatLives(lives);
    }
    case "/ranking": {
      const top = args[0] ? parseInt(args[0], 10) : 10;
      return formatRanking(trilhas.slice().sort((a, b) => b.xp_total - a.xp_total), isNaN(top) ? 10 : top);
    }
    case "/stats":
      return formatEstatisticas(trilhas);
    default:
      return `❓ Comando não reconhecido: \`${cmd}\`. Use \`/ajuda\` para ver os comandos disponíveis.`;
  }
}
