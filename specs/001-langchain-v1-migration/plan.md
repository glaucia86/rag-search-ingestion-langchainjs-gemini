# Implementation Plan: Migração para LangChain.js v1

**Branch**: `001-langchain-v1-migration` | **Date**: 2026-01-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-langchain-v1-migration/spec.md`

## Summary

Migrar o projeto RAG PDF Ingestion & Search de LangChain.js v0.3.x para v1.0, atualizando dependências, implementando Retriever explícito, e mantendo compatibilidade funcional total. A pesquisa revelou que a maioria do código atual já é compatível com v1, com mudanças focadas em atualização de versões e adição de padrão Retriever.

## Technical Context

**Language/Version**: TypeScript 5.9+ / Node.js 22+  
**Primary Dependencies**: LangChain.js v1 (@langchain/core ^1.1.13, langchain ^1.2.8), Google Generative AI  
**Storage**: PostgreSQL 15+ com extensão pgVector  
**Testing**: Validação manual (ingest, search, chat)  
**Target Platform**: Node.js CLI (Linux/macOS/Windows)
**Project Type**: Single project (CLI application)  
**Performance Goals**: Ingestão < 2min para 50 páginas, Busca < 3s  
**Constraints**: Manter comportamento funcional idêntico, TypeScript strict mode  
**Scale/Scope**: Projeto educacional/demo, documentos até ~100 páginas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

O arquivo `.specify/memory/constitution.md` está em estado de template (não configurado). Não há regras específicas de projeto definidas que bloqueiem esta migração.

**Status**: ✅ PASS (sem restrições definidas)

## Project Structure

### Documentation (this feature)

```text
specs/001-langchain-v1-migration/
├── plan.md              # Este arquivo
├── research.md          # ✅ Criado - pesquisa de breaking changes v1
├── data-model.md        # ✅ Criado - entidades e fluxos
├── quickstart.md        # ✅ Criado - guia rápido de implementação
├── contracts/           # ✅ Criado - contratos de interface
│   └── api-contracts.md
├── checklists/
│   └── requirements.md  # ✅ Criado - checklist de qualidade
└── tasks.md             # A ser criado por /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── chat.ts          # CLI principal - sem mudanças necessárias
├── google-client.ts # GoogleEmbeddings + GoogleClient - compatível v1
├── ingest.ts        # Pipeline de ingestão - compatível v1
└── search.ts        # RAGSearch - adicionar Retriever explícito

tutorial/
└── article.md       # Tutorial - atualizar versões e exemplos

package.json         # Atualizar dependências para v1
tsconfig.json        # Sem mudanças necessárias
```

**Structure Decision**: Projeto single (CLI) com código em `src/`. Estrutura atual mantida - não há necessidade de reorganização.

## Complexity Tracking

> Nenhuma violação identificada. Migração de baixa complexidade.

| Área | Complexidade | Justificativa |
|------|--------------|---------------|
| Dependências | Baixa | Atualização de versões, sem breaking changes significativos |
| GoogleEmbeddings | Nenhuma | Já compatível com interface v1 |
| PGVectorStore | Nenhuma | `initialize()` mantido como método oficial |
| Retriever | Baixa | Adicionar `asRetriever()` - método já disponível |
| Tutorial | Baixa | Atualização de versões e exemplos |

## Fases de Implementação

### Fase 1: Atualização de Dependências

**Arquivos afetados**: `package.json`

**Mudanças**:
```json
{
  "dependencies": {
    "langchain": "^1.2.8",           // NOVO
    "@langchain/core": "^1.1.13",    // Atualizado de ^0.3.75
    "@langchain/community": "^0.3.55", // Mantido
    "@langchain/textsplitters": "^0.1.0" // Mantido
  },
  "engines": {
    "node": ">=20.0.0"  // NOVO - requirement v1
  }
}
```

**Validação**: `npm install` sem erros, `npm run build` compila

### Fase 2: Implementar Retriever Explícito

**Arquivos afetados**: `src/search.ts`

**Mudanças**:
- Adicionar propriedade `retriever` na classe `RAGSearch`
- Criar retriever via `vectorStore.asRetriever()`
- Manter `similaritySearchWithScore` para resultados com score
- Opcionalmente usar `retriever.invoke()` para busca padrão

**Código exemplo**:
```typescript
// Na inicialização
this.retriever = this.vectorStore.asRetriever({ k: 10 });

// Para busca com score (manter comportamento atual)
const results = await this.vectorStore.similaritySearchWithScore(query, k);

// Para busca padrão via Retriever (preparação para LCEL)
const docs = await this.retriever.invoke(query);
```

**Validação**: Busca retorna resultados equivalentes

### Fase 3: Validação Funcional

**Testes manuais**:
1. `npm run ingest` - processa PDF sem erros
2. `npm run start` - chat responde perguntas
3. Verificar que respostas são baseadas no contexto

### Fase 4: Atualização do Tutorial

**Arquivos afetados**: `tutorial/article.md`

**Mudanças**:
- Atualizar versões de dependências mencionadas
- Atualizar exemplos de código se necessário
- Mencionar uso de Retriever como best practice v1

## Artefatos Gerados

| Artefato | Status | Caminho |
|----------|--------|---------|
| Pesquisa | ✅ Completo | [research.md](research.md) |
| Modelo de Dados | ✅ Completo | [data-model.md](data-model.md) |
| Contratos | ✅ Completo | [contracts/api-contracts.md](contracts/api-contracts.md) |
| Quickstart | ✅ Completo | [quickstart.md](quickstart.md) |
| Checklist | ✅ Completo | [checklists/requirements.md](checklists/requirements.md) |
| Tasks | ⏳ Pendente | A ser criado por `/speckit.tasks` |

## Próximos Passos

1. Revisar plano e artefatos gerados
2. Executar `/speckit.tasks` para gerar lista de tarefas detalhada
3. Implementar mudanças seguindo as fases definidas
4. Validar funcionalmente cada fase
5. Commitar e criar PR para revisão
