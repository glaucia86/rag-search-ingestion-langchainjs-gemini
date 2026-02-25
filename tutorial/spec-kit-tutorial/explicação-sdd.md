# SDD — Spec-Driven Development

> **Visualização do diagrama:**

![Diagrama SDD — Spec-Driven Development](./explicacao-sdd.png)

---

## Descrição textual do diagrama

### O problema central

> *"IA escreve código muito rápido, mas não pensa arquitetura por você."*

Quando você não tem uma arquitetura explícita, você não terá um contrato — e isso causará um verdadeiro caos.

#### Comparação direta

| Cenário | Resultado |
|---|---|
| **IA + Código sem direção** | Caos mais rápido e generalizado no código |
| **IA + Especificações claras** | Software melhor, muito mais rápido e fácil de manter |

---

### As características do SDD

- **SDD vem antes** — a spec é criada antes de qualquer linha de código
- **Não é documentação** — é um contrato vivo e executável
- **A spec define o que pode e o que não pode ser feito** — ela delimita fronteiras claras
- **O código obedece o que você define na spec** — e não o contrário

> *"No modelo tradicional, o código vira a fonte da verdade.*
> *No SDD, o código é apenas uma implementação temporária de uma intenção maior."*

---

### Modelo Antigo vs. Modelo SDD

#### Modelo Antigo

```
[ Código ]  →  [ Tentativa de explicar depois ]
```

O código cresce sem planejamento. A documentação — se existir — tenta reconstruir a intenção original, muitas vezes de forma imprecisa.

#### Modelo SDD

```
[ Spec (especificação) ]  →  [ Código ]  →  [ Validação ]
```

A spec é a fonte da verdade. O código é gerado (ou escrito) para satisfazê-la, e a validação garante que o comportamento real corresponde à intenção definida.

---

### Por que o SDD se torna essencial na era de IA?

```
[ SDD ]  →  [ Ferramenta de IA Assistida (GH Copilot) ]  →  [ Agentes ]
```

> *"Sem spec, a IA vira um estagiário muito rápido: trabalha bastante,*
> *mas erra exatamente onde não pode errar."*

A spec funciona como uma hierarquia de intenção para a IA:

```
Spec
 ├── regras
 ├── limites
 ├── decisões
 └── não-negociáveis
        ↓
     IA / Copilot
```

---

### O problema atual: specs espalhadas e não executáveis

Muitas equipes possuem especificações, mas elas vivem em:
- PDFs em pastas de rede
- Slides de apresentação
- Wikis desatualizados
- Cabeças das pessoas

> *"Se a spec não está versionada junto com o código, ela não é uma spec. É apenas um texto."*

A estrutura recomendada de specs versionadas:

```
/specs
  ├── spec.md
  ├── constraints.md
  ├── decisions.md
```

---

### O que é spec-kit e por que ele resolve isso?

O **spec-kit** é uma abordagem estruturada e ferramental para tornar specs uma parte de primeira-classe do repositório:

- **specs são código** — tratadas com o mesmo rigor de arquivos `.ts`, `.py` etc.
- **specs são versionadas** — vivem no `git`, têm histórico e blame
- **specs guiam humanos e ferramentas** — tanto desenvolvedores quanto agentes de IA leem e obedecem o mesmo contrato

---

## O que é SDD (Spec-Driven Development)?

**SDD** é uma metodologia de desenvolvimento de software onde a **especificação precede e governa** todo o processo de criação de código. Em vez de escrever código e depois documentá-lo, equipes SDD definem contratos formais (specs) antes de qualquer implementação — e esses contratos se tornam a fonte canônica da verdade para humanos e ferramentas automatizadas.

SDD não é TDD nem BDD, embora compartilhe alguns valores:

| Abordagem | Foco principal | Artefato central |
|-----------|---------------|-----------------|
| TDD | Testes guiam a implementação | Arquivo de teste |
| BDD | Comportamento do usuário em linguagem natural | Feature files (Gherkin) |
| **SDD** | **Intenção arquitetural e regras de negócio** | **Spec (especificação estruturada)** |

---

## SDD no contexto da IA generativa (2023–2026)

### A aceleração do problema

Com a chegada massiva de assistentes de código baseados em LLMs — GitHub Copilot, Cursor, ChatGPT, Claude — em 2022–2023, a velocidade de geração de código disparou. O que antes levava horas passou a levar minutos. Essa aceleração expôs uma vulnerabilidade arquitetural crítica: **código gerado sem direção converge para a solução mais estatisticamente provável, não necessariamente para a solução correta para o seu contexto**.

Em 2025, Andrej Karpathy popularizou o termo **"vibe coding"** para descrever o padrão de desenvolvimento onde o desenvolvedor delega completamente as decisões de implementação à IA sem estabelecer restrições claras. SDD surge como a contra-resposta metodológica: **voce define a intenção, a IA executa dentro dos limites.**

### A explosão dos agentes (2025–2026)

Com o surgimento de **agentes autônomos de código** — como GitHub Copilot Agent Mode, Claude Code, Devin e ferramentas similares — o problema se amplificou ainda mais. Agentes podem escrever centenas de arquivos em uma única sessão. Sem uma spec clara:

- O agente toma decisões arquiteturais por conta própria
- Cada execução pode levar a resultados diferentes
- Reverter mudanças torna-se custoso
- O time perde controle sobre a base de código

O SDD, nesse contexto, funciona como o **sistema de constraints** que mantém o agente dentro dos limites desejados — similar ao conceito de "guardrails" em sistemas de IA.

### Formatos de spec para ferramentas de IA (2024–2026)

A indústria convergiu para alguns padrões de spec consumíveis por ferramentas de IA:

| Formato | Uso | Exemplo |
|---------|-----|---------|
| `.github/copilot-instructions.md` | Contexto global para GitHub Copilot | Regras de projeto, stack, convenções |
| `.cursor/rules/*.mdc` | Cursor rules por escopo | Regras de pasta ou tipo de arquivo |
| `AGENTS.md` | Instruções para agentes autônomos | Fluxo de trabalho, restrições, comandos |
| `.instructions.md` (VS Code) | Instruções scoped para VS Code Copilot | Convenções de código, padrões |
| `openapi.yaml` / `asyncapi.yaml` | Spec de APIs | Contratos de interface |
| `SPEC.md` / `specs/` | Spec de domínio e regras de negócio | Decisões de arquitetura, ADRs |

### Princípios SDD consolidados (até fev/2026)

1. **Spec-First**: A spec é escrita antes do código. Nenhuma linha de código deve existir sem uma intenção correspondente na spec.

2. **Spec como contrato executável**: A spec define pré-condições, pós-condições e invariantes que podem ser verificados — seja por testes, por linters ou por validação de agentes.

3. **Versionamento junto ao código**: A spec vive no mesmo repositório Git que o código. Mudanças de spec passam por pull request, code review e CI/CD.

4. **Legibilidade dupla**: A spec deve ser legível tanto por humanos quanto por LLMs. Markdown estruturado com seções claras e exemplos concretos é o formato preferido.

5. **Hierarquia de intenção**: A spec estabelece uma hierarquia clara:
   - **Objetivos** (o quê e por quê)
   - **Restrições** (o que não pode ser feito)
   - **Decisões** (o que foi escolhido e por quê não as alternativas)
   - **Não-negociáveis** (segurança, compliance, SLAs)

6. **Spec viva**: A spec é atualizada continuamente. Quando o código muda de forma que contradiz a spec anterior, a spec deve ser atualizada explicitamente — não silenciosamente ignorada.

---

## SDD e o ciclo de desenvolvimento moderno

```
┌─────────────────────────────────────────────────────────────────┐
│                     CICLO SDD + IA (2025-2026)                  │
├──────────┬──────────────┬──────────────┬───────────┬────────────┤
│  Define  │   Escreve    │    IA gera   │  Valida   │  Atualiza  │
│  a spec  │  constraints │   o código   │ vs. spec  │  a spec    │
│  (human) │  e decisões  │  (Copilot /  │ (CI + AI  │  (human +  │
│          │   na spec    │   Agente)    │ reviewer) │   review)  │
└──────────┴──────────────┴──────────────┴───────────┴────────────┘
```

O papel do humano no SDD com IA não é escrever código — é **definir intenção, estabelecer limites e validar resultados**.

---

## Referências e recursos

- [GitHub Copilot Customization — Custom Instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)
- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
- [VS Code — Copilot Instructions](https://code.visualstudio.com/docs/copilot/copilot-customization)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Architecture Decision Records (ADRs)](https://adr.github.io/)
- Karpathy, A. — "Software is Changing (Again)" [2025]
