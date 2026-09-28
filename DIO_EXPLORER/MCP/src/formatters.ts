/**
 * Formatadores de resposta — convertem dados brutos em Markdown rico.
 * Este arquivo é usado pelos tools MCP e espelha SRC/formatters.ts.
 */

import type { Trilha } from "./data.js";

// ────────────────────────────────────────────────────────────────────────────
// Helpers internos
// ────────────────────────────────────────────────────────────────────────────

function nivelEmoji(nivel: string): string {
  const n = nivel.toLowerCase();
  if (n.includes("avançado") && !n.includes("básico") && !n.includes("intermediário")) return "🔴";
  if (n.includes("básico") && !n.includes("intermediário") && !n.includes("avançado")) return "🟢";
  return "🟡";
}

function xpBar(xp: number): string {
  const pct = Math.min(Math.round((xp / 30000) * 10), 10);
  return "█".repeat(pct) + "░".repeat(10 - pct);
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function gerarDescricaoDesafio(badge: string, tecnologia: string): string {
  const lower = badge.toLowerCase();
  if (lower.includes("starter") || lower.includes("rookie") || lower.includes("beginner") || lower.includes("aware") || lower.includes("fundamentals"))
    return `Conclua os módulos introdutórios de **${tecnologia}** e entregue um projeto básico demonstrando os fundamentos.`;
  if (lower.includes("pro") || lower.includes("expert") || lower.includes("hero") || lower.includes("master") || lower.includes("specialist"))
    return `Desenvolva um projeto real utilizando recursos avançados de **${tecnologia}**, seguindo boas práticas e padrões de mercado.`;
  if (lower.includes("champion") || lower.includes("ninja") || lower.includes("innovator") || lower.includes("architect"))
    return `Entregue um projeto completo de ponta a ponta com **${tecnologia}**, com documentação, testes e deploy em produção.`;
  return `Complete os exercícios práticos do módulo de **${badge}** aplicando os conceitos de **${tecnologia}** em um projeto real.`;
}

// ────────────────────────────────────────────────────────────────────────────
// Formatadores públicos
// ────────────────────────────────────────────────────────────────────────────

export function formatTrilhaLista(trilhas: Trilha[], titulo = "📋 Trilhas Disponíveis"): string {
  const linhas = [`# ${titulo}`, ``];
  trilhas.forEach((t) => {
    const xpK = (t.xp_total / 1000).toFixed(1);
    linhas.push(
      `**${t.id}.** ${nivelEmoji(t.nivel)} **${t.nome}**`,
      `   _${t.tecnologia}_ · ${t.nivel} · ${t.numero_modulos} módulos · ⭐ ${xpK}k XP`,
      ``
    );
  });
  linhas.push(`> 💡 Use \`/trilha <id>\` para ver os detalhes completos de qualquer trilha.`);
  return linhas.join("\n");
}

export function formatTrilhaDetalhe(t: Trilha): string {
  const hoje = new Date().toISOString().split("T")[0];
  const promoAtiva = t.promocoes.validade >= hoje;

  const linhas: string[] = [
    `# ${nivelEmoji(t.nivel)} ${t.nome}`,
    ``,
    `> **Tecnologia:** ${t.tecnologia}  ·  **Nível:** ${t.nivel}  ·  **${t.numero_modulos} módulos**`,
    ``,
    `### ⭐ XP Total: ${t.xp_total.toLocaleString("pt-BR")}`,
    `\`${xpBar(t.xp_total)}\` (${Math.round((t.xp_total / 30000) * 100)}% do máximo do catálogo)`,
    ``,
    `### 🏅 Badges que você pode conquistar`,
    t.badges_disponiveis.map((b, i) => `${i + 1}. **${b}**`).join("\n"),
    ``,
    `### 🎫 Promoção ${promoAtiva ? "✅ ATIVA" : "❌ Expirada"}`,
    `- Desconto: **${t.promocoes.desconto_percentual}% OFF**`,
    `- Cupom: \`${t.promocoes.cupom}\``,
    `- Válido até: ${formatDate(t.promocoes.validade)}`,
    ``,
  ];

  if (t.promocao_vitalicia.disponivel && t.promocao_vitalicia.preco_vitalicio !== null) {
    linhas.push(
      `### 🔥 Oferta Vitalícia`,
      `- Preço original: ~~R$ ${t.promocao_vitalicia.preco_original.toFixed(2)}~~`,
      `- **Preço vitalício: R$ ${t.promocao_vitalicia.preco_vitalicio.toFixed(2)}**`,
      ``
    );
  }

  if (t.lives_ao_vivo.length > 0) {
    linhas.push(`### 📡 Próximas Lives`, ``);
    t.lives_ao_vivo.forEach((l) => {
      linhas.push(`- **${l.titulo}** — ${formatDate(l.data)} às ${l.horario}`);
    });
    linhas.push(``);
  }

  return linhas.join("\n");
}

export function formatDesafios(t: Trilha): string {
  const desafios = t.badges_disponiveis.map((badge, i) => ({
    numero: i + 1,
    titulo: `Desafio ${i + 1}: ${badge}`,
    descricao: gerarDescricaoDesafio(badge, t.tecnologia),
    xp_reward: Math.round(t.xp_total / t.badges_disponiveis.length),
    badge_recompensa: badge,
  }));

  const linhas = [
    `# ⚔️ Desafios — ${t.nome}`,
    ``,
    `> Esta trilha possui **${desafios.length} desafios práticos** para você completar!`,
    `> Complete todos para conquistar o certificado completo.`,
    ``,
  ];

  desafios.forEach((d) => {
    linhas.push(
      `## ${d.numero}. ${d.titulo}`,
      `📝 ${d.descricao}`,
      `🏅 Badge: \`${d.badge_recompensa}\`  ·  ⭐ XP: ${d.xp_reward.toLocaleString("pt-BR")}`,
      ``
    );
  });

  linhas.push(
    `---`,
    `> 💡 Complete todos os desafios para ganhar o **certificado de ${t.nome}**!`
  );

  return linhas.join("\n");
}

export function formatCertificado(t: Trilha): string {
  const nivelCert = t.nivel.toLowerCase().includes("avançado") && !t.nivel.toLowerCase().includes("básico")
    ? "Especialista"
    : t.nivel.toLowerCase().includes("intermediário")
    ? "Profissional"
    : "Fundamentos";

  return [
    `# 🎓 Certificado — ${t.nome}`,
    ``,
    `## Como obter seu certificado`,
    ``,
    `Para conquistar o **Certificado DIO de ${nivelCert} em ${t.tecnologia}**, você precisa:`,
    ``,
    `| Etapa | Requisito |`,
    `|-------|-----------|`,
    `| ✅ Módulos | Completar todos os **${t.numero_modulos} módulos** da trilha |`,
    `| ✅ Badges | Conquistar os **${t.badges_disponiveis.length} badges** disponíveis |`,
    `| ✅ XP | Acumular **${t.xp_total.toLocaleString("pt-BR")} XP** |`,
    `| ✅ Projetos | Entregar todos os desafios práticos |`,
    ``,
    `## 🏅 Badges que compõem o certificado`,
    ``,
    ...t.badges_disponiveis.map((b, i) => `${i + 1}. 🥇 **${b}**`),
    ``,
    `## 📄 Tipo de certificado emitido`,
    ``,
    `- **Nome:** Certificado de Conclusão — ${t.nome}`,
    `- **Nível:** ${nivelCert}`,
    `- **Tecnologia:** ${t.tecnologia}`,
    `- **XP validado:** ${t.xp_total.toLocaleString("pt-BR")} pontos`,
    `- **Validade:** Vitalícia`,
    ``,
    `> 🔗 Após a conclusão, seu certificado ficará disponível no seu perfil DIO para compartilhar no LinkedIn.`,
  ].join("\n");
}

export function formatPromocoes(trilhas: Trilha[]): string {
  const hoje = new Date().toISOString().split("T")[0];
  const ativas = trilhas.filter((t) => t.promocoes.validade >= hoje);
  const expiradas = trilhas.filter((t) => t.promocoes.validade < hoje);

  const linhas = [
    `# 🎫 Promoções DIO`,
    ``,
    `## ✅ Promoções Ativas (${ativas.length})`,
    ``,
  ];

  ativas
    .sort((a, b) => b.promocoes.desconto_percentual - a.promocoes.desconto_percentual)
    .forEach((t) => {
      linhas.push(
        `### ${t.nome}`,
        `- 🏷️ **${t.promocoes.desconto_percentual}% OFF** · Cupom: \`${t.promocoes.cupom}\``,
        `- Válido até: ${formatDate(t.promocoes.validade)}`,
        t.promocao_vitalicia.disponivel && t.promocao_vitalicia.preco_vitalicio
          ? `- 🔥 Oferta vitalícia: R$ ${t.promocao_vitalicia.preco_vitalicio.toFixed(2)} _(era R$ ${t.promocao_vitalicia.preco_original.toFixed(2)})_`
          : "",
        ``
      );
    });

  if (expiradas.length > 0) {
    linhas.push(
      `---`,
      `## ❌ Promoções Expiradas (${expiradas.length})`,
      ``,
      ...expiradas.map((t) => `- ~~${t.nome}~~ (cupom: \`${t.promocoes.cupom}\`, expirou em ${formatDate(t.promocoes.validade)})`),
      ``
    );
  }

  return linhas.filter((l) => l !== "").join("\n");
}

export function formatLives(lives: Array<{
  trilha_id: number; trilha_nome: string; tecnologia: string;
  titulo: string; data: string; horario: string;
}>): string {
  if (lives.length === 0) {
    return `# 📡 Próximas Lives\n\n> Nenhuma live agendada no período selecionado.`;
  }

  const porData = new Map<string, typeof lives>();
  lives.forEach((l) => {
    if (!porData.has(l.data)) porData.set(l.data, []);
    porData.get(l.data)!.push(l);
  });

  const linhas = [`# 📡 Próximas Lives ao Vivo`, ``];

  porData.forEach((grupo, data) => {
    linhas.push(`## 📅 ${formatDate(data)}`, ``);
    grupo.forEach((l) => {
      linhas.push(
        `- **${l.titulo}**`,
        `  🕐 ${l.horario}  ·  Trilha: _${l.trilha_nome}_ (${l.tecnologia})`,
        ``
      );
    });
  });

  return linhas.join("\n");
}

export function formatRanking(trilhas: Trilha[], top?: number): string {
  const lista = trilhas.slice(0, top ?? trilhas.length);
  const medals = ["🥇", "🥈", "🥉"];

  const linhas = [
    `# 🏆 Ranking de Trilhas por XP`,
    ``,
    `| # | Trilha | Tecnologia | XP Total |`,
    `|---|--------|------------|----------|`,
  ];

  lista.forEach((t, i) => {
    const medal = medals[i] ?? `**${i + 1}.**`;
    linhas.push(`| ${medal} | ${t.nome} | ${t.tecnologia} | ⭐ ${t.xp_total.toLocaleString("pt-BR")} |`);
  });

  return linhas.join("\n");
}

export function formatEstatisticas(trilhas: Trilha[]): string {
  const tecnologias = [...new Set(trilhas.map((t) => t.tecnologia))];
  const xpTotal = trilhas.reduce((acc, t) => acc + t.xp_total, 0);
  const livesTotal = trilhas.reduce((acc, t) => acc + t.lives_ao_vivo.length, 0);
  const modsTotais = trilhas.reduce((acc, t) => acc + t.numero_modulos, 0);
  const comVitalicio = trilhas.filter((t) => t.promocao_vitalicia.disponivel).length;

  return [
    `# 📊 Estatísticas do Catálogo DIO`,
    ``,
    `| Métrica | Valor |`,
    `|---------|-------|`,
    `| 📚 Total de trilhas | **${trilhas.length}** |`,
    `| 🛠️ Tecnologias cobertas | **${tecnologias.length}** |`,
    `| 📦 Módulos totais | **${modsTotais}** |`,
    `| ⭐ XP total do catálogo | **${xpTotal.toLocaleString("pt-BR")}** |`,
    `| ⭐ XP médio por trilha | **${Math.round(xpTotal / trilhas.length).toLocaleString("pt-BR")}** |`,
    `| 📡 Lives agendadas | **${livesTotal}** |`,
    `| 🔥 Trilhas com oferta vitalícia | **${comVitalicio}** |`,
    ``,
    `**Tecnologias disponíveis:**`,
    tecnologias.sort().map((t) => `\`${t}\``).join(", "),
  ].join("\n");
}

export function formatRecomendacao(trilhas: Trilha[], nivel: string, area?: string): string {
  const linhas = [
    `# 🎯 Recomendação Personalizada`,
    ``,
    `> **Perfil:** ${nivel}${area ? ` · Área: ${area}` : ""}`,
    ``,
    `Encontrei **${trilhas.length}** trilha(s) ideais para você:`,
    ``,
  ];

  trilhas.forEach((t, i) => {
    const xpK = (t.xp_total / 1000).toFixed(1);
    const hoje = new Date().toISOString().split("T")[0];
    const promo = t.promocoes.validade >= hoje
      ? `🎫 Cupom \`${t.promocoes.cupom}\` (${t.promocoes.desconto_percentual}% OFF)`
      : "";

    linhas.push(
      `## ${i + 1}. ${t.nome}`,
      `- 🛠️ Tecnologia: **${t.tecnologia}**`,
      `- 📊 Nível: ${t.nivel}`,
      `- ⭐ XP: ${xpK}k · 📦 ${t.numero_modulos} módulos`,
      `- 🏅 Badges: ${t.badges_disponiveis.join(", ")}`,
      promo ? `- ${promo}` : "",
      ``
    );
  });

  linhas.push(`> Use \`/trilha <número>\` para ver todos os detalhes de qualquer trilha acima.`);
  return linhas.filter((l) => l !== "").join("\n");
}

export function formatAjuda(commands: Array<{ command: string; description: string; exemplo: string }>): string {
  const linhas = [
    `# 💬 DIO Explorer — Slash Commands`,
    ``,
    `| Comando | O que faz | Exemplo |`,
    `|---------|-----------|---------|`,
  ];
  commands.forEach((c) => {
    linhas.push(`| \`${c.command}\` | ${c.description} | \`${c.exemplo}\` |`);
  });
  linhas.push(``, `> 💡 Dica: use \`/recomendar iniciante web\` para receber sugestões personalizadas!`);
  return linhas.join("\n");
}
