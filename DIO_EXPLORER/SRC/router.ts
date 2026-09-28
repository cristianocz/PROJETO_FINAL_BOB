/**
 * Router de slash commands — recebe uma string de input do usuário,
 * identifica o comando e executa o handler correspondente,
 * retornando uma string Markdown pronta para exibição.
 *
 * Pode ser usado tanto pelo bot direto quanto chamado pelos tools MCP.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  getTrilhas,
  getTrilhaByNomeOuId,
  NIVEL_MAP,
  AREA_MAP,
  type Trilha,
} from "./data.js";
import {
  formatTrilhaLista,
  formatTrilhaDetalhe,
  formatDesafios,
  formatCertificado,
  formatPromocoes,
  formatLives,
  formatRanking,
  formatEstatisticas,
  formatAjuda,
  formatRecomendacao,
} from "./formatters.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ────────────────────────────────────────────────────────────────────────────
// Carrega definição dos comandos
// ────────────────────────────────────────────────────────────────────────────

interface CommandDef {
  command: string;
  aliases: string[];
  description: string;
  exemplo: string;
}

function loadCommands(): CommandDef[] {
  try {
    const raw = readFileSync(
      join(__dirname, "../../COMMANDS/slash-commands.json"),
      "utf-8"
    );
    return JSON.parse(raw).commands as CommandDef[];
  } catch {
    return [];
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Parser de input
// ────────────────────────────────────────────────────────────────────────────

interface ParsedInput {
  command: string;
  args: string[];
  raw: string;
}

function parseInput(input: string): ParsedInput {
  const trimmed = input.trim();
  const parts = trimmed.split(/\s+/);
  return {
    command: (parts[0] ?? "").toLowerCase(),
    args: parts.slice(1),
    raw: trimmed,
  };
}

function resolveAlias(command: string, defs: CommandDef[]): string {
  for (const def of defs) {
    if (def.command === command || def.aliases.includes(command)) {
      return def.command;
    }
  }
  return command;
}

// ────────────────────────────────────────────────────────────────────────────
// Handlers individuais
// ────────────────────────────────────────────────────────────────────────────

function handleTrilhas(): string {
  return formatTrilhaLista(getTrilhas());
}

function handleTrilha(args: string[]): string {
  if (args.length === 0) {
    return `❌ Uso: \`/trilha <id ou nome>\`\nEx: \`/trilha 5\` ou \`/trilha Python\``;
  }
  const idOuNome = /^\d+$/.test(args[0]) ? Number(args[0]) : args.join(" ");
  const trilha = getTrilhaByNomeOuId(idOuNome);
  if (!trilha) {
    return `❌ Trilha não encontrada: **${idOuNome}**\nUse \`/trilhas\` para ver todas as disponíveis.`;
  }
  return formatTrilhaDetalhe(trilha);
}

function handleBuscar(args: string[]): string {
  if (args.length === 0) {
    return `❌ Uso: \`/buscar <termo>\`\nEx: \`/buscar Python\` ou \`/buscar Avançado\``;
  }
  const termo = args.join(" ").toLowerCase();
  const trilhas = getTrilhas();

  // Tenta filtrar por nível primeiro, depois por tecnologia
  const porNivel = trilhas.filter((t) => t.nivel.toLowerCase().includes(termo));
  if (porNivel.length > 0) {
    return formatTrilhaLista(porNivel, `🔍 Trilhas com nível "${args.join(" ")}"`);
  }

  const porTech = trilhas.filter(
    (t) =>
      t.tecnologia.toLowerCase().includes(termo) ||
      t.nome.toLowerCase().includes(termo)
  );
  if (porTech.length > 0) {
    return formatTrilhaLista(porTech, `🔍 Trilhas para "${args.join(" ")}"`);
  }

  return `🔍 Nenhuma trilha encontrada para **"${args.join(" ")}"**.\nTente \`/trilhas\` para ver o catálogo completo.`;
}

function handleRecomendar(args: string[]): string {
  if (args.length === 0) {
    return [
      `❌ Uso: \`/recomendar <nivel> [area]\``,
      ``,
      `**Níveis válidos:** iniciante · intermediario · avancado`,
      `**Áreas válidas:** web · mobile · cloud · dados · seguranca · backend · ia · blockchain · devops · fundamentos`,
      ``,
      `Ex: \`/recomendar iniciante web\``,
    ].join("\n");
  }

  const nivelInput = args[0].toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove acentos
  const areaInput = args[1]?.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const niveisAceitos = NIVEL_MAP[nivelInput];
  if (!niveisAceitos) {
    return `❌ Nível inválido: **${args[0]}**\nUse: \`iniciante\`, \`intermediario\` ou \`avancado\``;
  }

  const trilhas = getTrilhas();
  let candidatas = trilhas.filter((t) =>
    niveisAceitos.some((n) => t.nivel.toLowerCase().includes(n.toLowerCase()))
  );

  if (areaInput && AREA_MAP[areaInput]) {
    const techs = AREA_MAP[areaInput].map((t) => t.toLowerCase());
    candidatas = candidatas.filter((t) =>
      techs.some((tech) => t.tecnologia.toLowerCase().includes(tech))
    );
  }

  if (candidatas.length === 0) {
    return `🔍 Nenhuma trilha encontrada para o perfil **${args[0]}${areaInput ? ` · ${areaInput}` : ""}**.\nTente \`/trilhas\` para ver o catálogo completo.`;
  }

  // Ordena por XP (mais rico primeiro) e limita a 5
  candidatas = candidatas.sort((a, b) => b.xp_total - a.xp_total).slice(0, 5);
  return formatRecomendacao(candidatas, args[0], args[1]);
}

function handleDesafios(args: string[]): string {
  if (args.length === 0) {
    return `❌ Uso: \`/desafios <id da trilha>\`\nEx: \`/desafios 1\``;
  }
  const trilha = getTrilhaByNomeOuId(args[0]);
  if (!trilha) {
    return `❌ Trilha não encontrada: **${args[0]}**\nUse \`/trilhas\` para ver os IDs disponíveis.`;
  }
  return formatDesafios(trilha);
}

function handleCertificado(args: string[]): string {
  if (args.length === 0) {
    return `❌ Uso: \`/certificado <id da trilha>\`\nEx: \`/certificado 3\``;
  }
  const trilha = getTrilhaByNomeOuId(args[0]);
  if (!trilha) {
    return `❌ Trilha não encontrada: **${args[0]}**\nUse \`/trilhas\` para ver os IDs disponíveis.`;
  }
  return formatCertificado(trilha);
}

function handlePromocoes(): string {
  return formatPromocoes(getTrilhas());
}

function handleLives(args: string[]): string {
  const dataMinima = args[0] ?? new Date().toISOString().split("T")[0];
  const trilhas = getTrilhas();
  const lives: Array<{
    trilha_id: number;
    trilha_nome: string;
    tecnologia: string;
    titulo: string;
    data: string;
    horario: string;
  }> = [];

  for (const t of trilhas) {
    for (const l of t.lives_ao_vivo) {
      if (l.data >= dataMinima) {
        lives.push({
          trilha_id: t.id,
          trilha_nome: t.nome,
          tecnologia: t.tecnologia,
          titulo: l.titulo,
          data: l.data,
          horario: l.horario,
        });
      }
    }
  }
  lives.sort((a, b) => a.data.localeCompare(b.data));
  return formatLives(lives);
}

function handleRanking(args: string[]): string {
  const top = args[0] ? parseInt(args[0], 10) : 10;
  const trilhas = getTrilhas()
    .slice()
    .sort((a, b) => b.xp_total - a.xp_total);
  return formatRanking(trilhas, isNaN(top) ? 10 : top);
}

function handleStats(): string {
  return formatEstatisticas(getTrilhas());
}

function handleAjuda(): string {
  const defs = loadCommands();
  return formatAjuda(defs.map((d) => ({
    command: d.command,
    description: d.description,
    exemplo: d.exemplo,
  })));
}

function handleNaoEncontrado(command: string): string {
  return [
    `❓ Comando não reconhecido: \`${command}\``,
    ``,
    `Use \`/ajuda\` para ver todos os comandos disponíveis.`,
  ].join("\n");
}

// ────────────────────────────────────────────────────────────────────────────
// Router principal — exportado para uso no MCP e no bot
// ────────────────────────────────────────────────────────────────────────────

export function routeCommand(input: string): string {
  const defs = loadCommands();
  const parsed = parseInput(input);
  const resolved = resolveAlias(parsed.command, defs);

  switch (resolved) {
    case "/trilhas":
      return handleTrilhas();
    case "/trilha":
      return handleTrilha(parsed.args);
    case "/buscar":
      return handleBuscar(parsed.args);
    case "/recomendar":
      return handleRecomendar(parsed.args);
    case "/desafios":
      return handleDesafios(parsed.args);
    case "/certificado":
      return handleCertificado(parsed.args);
    case "/promocoes":
      return handlePromocoes();
    case "/lives":
      return handleLives(parsed.args);
    case "/ranking":
      return handleRanking(parsed.args);
    case "/stats":
      return handleStats();
    case "/ajuda":
      return handleAjuda();
    default:
      return handleNaoEncontrado(parsed.command);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Export de handlers individuais (para uso direto pelos tools MCP)
// ────────────────────────────────────────────────────────────────────────────

export {
  handleTrilhas,
  handleTrilha,
  handleBuscar,
  handleRecomendar,
  handleDesafios,
  handleCertificado,
  handlePromocoes,
  handleLives,
  handleRanking,
  handleStats,
  handleAjuda,
};
