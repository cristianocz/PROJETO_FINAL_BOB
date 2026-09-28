---
description: Exibe o plano de estudos formatado de uma trilha DIO pela tecnologia
argument-hint: <tecnologia>
---
Leia o arquivo `DIO_EXPLORER/DATA/trilhas_dio.json` e localize a trilha cujo campo `tecnologia` ou `nome` contenha o texto "$1" (busca case-insensitive, correspondência parcial aceita — por exemplo, "python" deve encontrar "Python", "aws" deve encontrar "Amazon Web Services", "ml" deve encontrar "Machine Learning").

Se nenhuma trilha for encontrada:
- Liste todas as tecnologias disponíveis no JSON em uma tabela markdown com colunas: Nº, Tecnologia, Trilha, Nível
- Informe ao usuário para tentar novamente com um dos nomes listados

Se encontrar a trilha, responda **exclusivamente** com o plano de estudos formatado em markdown, seguindo rigorosamente este modelo — sem texto extra antes ou depois:

---

# 🎓 Trilha: {nome}

**🏷️ Tecnologia:** {tecnologia}
**📊 Nível:** {nivel}
**📦 Total de Módulos:** {numero_modulos}
**⭐ XP Total:** {xp_total} XP

---

## 📚 Plano de Estudos — Módulos

Gere uma lista numerada com exatamente {numero_modulos} módulos. Os títulos devem ser realistas, progressivos e coerentes com a tecnologia e nível da trilha (do básico ao avançado, na sequência esperada de aprendizado). Cada item deve seguir este formato:

**Módulo N — [Título descritivo]**
📹 Videoaulas · 📝 Projeto Prático · 🧪 Desafio de Código

---

## 🏅 Badges Disponíveis

Liste cada badge de `badges_disponiveis` como item com emoji 🥇 na frente.

---

## 🔥 Próximas Lives ao Vivo

Para cada item em `lives_ao_vivo`, exiba:
- **{titulo}** — 📅 {data} às {horario}

---

## 💰 Promoção Ativa

- **Desconto:** {promocoes.desconto_percentual}% OFF — use o cupom `{promocoes.cupom}` (válido até {promocoes.validade})
- Se `promocao_vitalicia.disponivel` for `true`: exiba "✅ Acesso Vitalício disponível por R$ {promocao_vitalicia.preco_vitalicio} (de R$ {promocao_vitalicia.preco_original})"
- Se `promocao_vitalicia.disponivel` for `false`: exiba "❌ Acesso vitalício não disponível para esta trilha"

---

> 💡 **Próximos passos:** Use `/desafio <tecnologia> <nível>` para praticar com um desafio de código, ou `/certificado <seu nome> <nome da trilha>` ao concluir a formação!
