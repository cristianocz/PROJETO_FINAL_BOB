---
description: Gera um certificado fictício em markdown com nome do usuário e trilha concluída
argument-hint: <seu nome> <nome da trilha>
---
Gere um certificado fictício e comemorativo em markdown para o usuário que concluiu uma trilha de estudos da DIO.

- **Nome do concludente:** $1
- **Trilha concluída:** $2

**Antes de gerar**, leia o arquivo `DIO_EXPLORER/DATA/trilhas_dio.json` e procure a trilha cujo campo `nome` ou `tecnologia` corresponda a "$2" (busca parcial e case-insensitive). Se encontrar, use os dados reais da trilha: `nome`, `tecnologia`, `nivel`, `numero_modulos`, `xp_total`, `badges_disponiveis`. Se não encontrar, gere valores fictícios coerentes com o tema informado.

**Gere a data de emissão** com a data atual real no formato DD/MM/AAAA.
**Gere o código do certificado** como uma string alfanumérica única de 12 caracteres em maiúsculas (ex: `A3FX92BKL7QM`).

Responda **exclusivamente** com o certificado em markdown, sem texto antes ou depois:

---

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║              🎓  CERTIFICADO DE CONCLUSÃO  🎓                       ║
║                                                                      ║
║                 ✦  DIO — Digital Innovation One  ✦                  ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

# 🏆 Certificado de Conclusão

> *A Digital Innovation One certifica que*

## $1

> *concluiu com êxito a trilha de formação:*

# 🎓 {nome completo da trilha}

---

| 📌 Campo               | 📋 Informação                        |
|------------------------|--------------------------------------|
| 🏷️ Tecnologia          | {tecnologia}                         |
| 📊 Nível               | {nivel}                              |
| 📦 Módulos Concluídos  | {numero_modulos} módulos             |
| ⭐ XP Conquistado      | {xp_total} XP                        |
| 📅 Data de Emissão     | {data atual DD/MM/AAAA}              |
| 🔐 Código do Cert.     | `{código alfanumérico de 12 chars}`  |

---

## 🏅 Badges Conquistadas

Para cada badge em `badges_disponiveis`, exiba:
🥇 **{nome da badge}** — {1 linha de descrição fictícia mas coerente com o que a badge representa}

---

## 📜 Declaração Oficial

> *Este certificado atesta que **$1** demonstrou dedicação, persistência e domínio dos conhecimentos e habilidades práticas exigidos pela trilha **{nome da trilha}** da plataforma DIO.*
>
> *A conclusão desta formação comprova competência técnica reconhecida pelo mercado, habilitando o(a) profissional para atuar com excelência na área de {tecnologia}.*

---

## ✍️ Assinaturas

| 👤 Cargo                         | ✒️ Responsável           |
|----------------------------------|--------------------------|
| 🎓 Diretor(a) Acadêmico(a)       | Dra. Ana Beatriz Souza   |
| 💻 Coordenador(a) de Tecnologia  | Eng. Rafael Mendonça     |
| 🏢 CEO — DIO                     | Piero Santoro            |

---

```
════════════════════════════════════════════════════════════════
  🌟 Parabéns, $1! Continue evoluindo na sua jornada tech! 🚀
════════════════════════════════════════════════════════════════
```

---

> 💡 **Continue crescendo!** Use `/trilha <tecnologia>` para explorar sua próxima trilha ou `/desafio <tecnologia> <nível>` para um novo desafio de código!
