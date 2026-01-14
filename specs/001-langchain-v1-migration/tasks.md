# Tasks: Migração para LangChain.js v1

**Input**: Design documents from `/specs/001-langchain-v1-migration/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Não solicitados explicitamente - validação manual conforme spec.md

**Organization**: Tasks agrupadas por user story para permitir implementação e teste independentes.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: User story relacionada (US1, US2, etc.)
- Caminhos absolutos incluídos nas descrições

---

## Phase 1: Setup (Atualização de Dependências)

**Purpose**: Atualizar dependências LangChain para v1 e preparar ambiente

- [X] T001 Atualizar versão do `@langchain/core` de ^0.3.75 para ^1.1.13 em package.json
- [X] T002 Adicionar dependência `langchain` ^1.2.8 em package.json
- [X] T003 Adicionar campo `engines` com `node` >= 20.0.0 em package.json
- [X] T004 Executar `npm install` para instalar dependências atualizadas
- [X] T005 Executar `npm run build` para validar compilação TypeScript

**Checkpoint**: ✅ Dependências v1 instaladas e projeto compila sem erros

---

## Phase 2: Foundational (Compatibilidade de Base)

**Purpose**: Validar que código existente é compatível com v1 sem modificações

**⚠️ CRITICAL**: Verificar compatibilidade antes de qualquer refatoração

- [X] T006 Verificar que imports em src/google-client.ts são compatíveis com v1
- [X] T007 Verificar que imports em src/ingest.ts são compatíveis com v1
- [X] T008 Verificar que imports em src/search.ts são compatíveis com v1
- [X] T009 Verificar que imports em src/chat.ts são compatíveis com v1
- [X] T010 Executar `npm run build` para confirmar zero erros de tipo após verificações

**Checkpoint**: ✅ Código existente compila com v1 - refatorações podem começar

---

## Phase 3: User Story 1 - Atualização das Dependências LangChain (Priority: P1) 🎯 MVP

**Goal**: Garantir que todas as dependências estão na v1 e projeto compila

**Independent Test**: `npm install` sem erros + `npm run build` compila sem warnings

### Implementation for User Story 1

- [X] T011 [US1] Remover quaisquer imports deprecated identificados em src/google-client.ts
- [X] T012 [US1] Remover quaisquer imports deprecated identificados em src/ingest.ts
- [X] T013 [US1] Remover quaisquer imports deprecated identificados em src/search.ts
- [X] T014 [US1] Validar que `Embeddings` de `@langchain/core/embeddings` funciona em src/google-client.ts
- [X] T015 [US1] Executar `npm run build` final para confirmar compilação limpa

**Checkpoint**: ✅ User Story 1 completa - dependências v1 funcionais

---

## Phase 4: User Story 2 - Ingestão de PDF Funcional (Priority: P1)

**Goal**: Pipeline de ingestão continua funcionando com v1

**Independent Test**: `npm run ingest` processa PDF e armazena chunks no banco

### Implementation for User Story 2

- [X] T016 [US2] Validar que `PDFLoader` de `@langchain/community/document_loaders/fs/pdf` funciona em src/ingest.ts
- [X] T017 [US2] Validar que `RecursiveCharacterTextSplitter` de `@langchain/textsplitters` funciona em src/ingest.ts
- [X] T018 [US2] Validar que `PGVectorStore.initialize()` funciona com v1 em src/ingest.ts
- [X] T019 [US2] Validar que `GoogleEmbeddings` gera embeddings corretamente em src/google-client.ts
- [ ] T020 [US2] Testar ingestão end-to-end: `docker compose up -d && npm run ingest`

**Checkpoint**: User Story 2 completa - ingestão funcional

---

## Phase 5: User Story 3 - Busca Semântica Funcional (Priority: P1)

**Goal**: Busca semântica retorna documentos relevantes com scores

**Independent Test**: Executar busca e verificar que retorna top-K com scores

### Implementation for User Story 3

- [X] T021 [US3] Adicionar propriedade `retriever` do tipo `VectorStoreRetriever` na classe `RAGSearch` em src/search.ts
- [X] T022 [US3] Inicializar retriever via `this.vectorStore.asRetriever({ k: 10 })` no método `_initializeVectorStore` em src/search.ts
- [X] T023 [US3] Manter método `searchDocuments` usando `similaritySearchWithScore` para resultados com score em src/search.ts
- [X] T024 [US3] Adicionar import de `VectorStoreRetriever` de `@langchain/core/vectorstores` em src/search.ts
- [ ] T025 [US3] Testar busca: iniciar chat e fazer uma pergunta sobre o PDF

**Checkpoint**: User Story 3 completa - busca funcional com Retriever

---

## Phase 6: User Story 4 - Geração de Resposta com RAG (Priority: P1)

**Goal**: Respostas geradas usam exclusivamente contexto recuperado

**Independent Test**: Fazer pergunta sobre PDF e validar resposta baseada no contexto

### Implementation for User Story 4

- [X] T026 [US4] Validar que `PROMPT_TEMPLATE` anti-alucinação está preservado em src/search.ts
- [X] T027 [US4] Validar que método `generateAnswer` usa contexto dos documentos recuperados em src/search.ts
- [X] T028 [US4] Validar que `GoogleClient.chatCompletions` continua funcionando em src/google-client.ts
- [ ] T029 [US4] Testar geração: fazer pergunta fora do contexto e verificar resposta "não tenho informações"

**Checkpoint**: User Story 4 completa - geração anti-alucinação funcional

---

## Phase 7: User Story 5 - CLI Funcional sem Regressões (Priority: P2)

**Goal**: Todos os comandos CLI funcionam identicamente ao comportamento anterior

**Independent Test**: Executar cada comando CLI e validar output esperado

### Implementation for User Story 5

- [ ] T030 [US5] Testar comando `npm run ingest` e validar output conforme contracts/api-contracts.md
- [ ] T031 [US5] Testar comando `npm run start` e validar banner e prompts conforme contracts/api-contracts.md
- [ ] T032 [US5] Testar comandos especiais do chat: `help`, `status`, `clear`, `exit`
- [ ] T033 [US5] Validar que tempo de resposta é exibido corretamente
- [ ] T034 [US5] Validar que erros são tratados e mensagens informativas são exibidas

**Checkpoint**: User Story 5 completa - CLI sem regressões (requer teste manual com Docker/PDF)

---

## Phase 8: User Story 6 - Atualização do Tutorial (Priority: P3)

**Goal**: Tutorial reflete as mudanças de código da migração v1

**Independent Test**: Revisar tutorial e validar que exemplos correspondem ao código

### Implementation for User Story 6

- [X] T035 [P] [US6] Atualizar versões de dependências mencionadas em tutorial/article.md
- [X] T036 [P] [US6] Atualizar versões de dependências mencionadas em tutorial/article-en.md (se existir)
- [X] T037 [US6] Revisar exemplos de código no tutorial e atualizar para padrões v1
- [X] T038 [US6] Adicionar menção ao uso de `asRetriever()` como best practice v1
- [ ] T039 [US6] Validar que desenvolvedor pode reproduzir projeto seguindo o tutorial

**Checkpoint**: User Story 6 completa - tutorial atualizado

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Limpeza final e validação completa

- [X] T040 [P] Executar `npm run build` final e confirmar zero warnings
- [X] T041 [P] Revisar package.json e confirmar nenhuma dependência deprecated
- [ ] T042 Executar validação completa: ingest → search → chat end-to-end
- [X] T043 Atualizar README.md com versões v1 se mencionadas
- [ ] T044 Criar commit com mensagem: "feat: migrate to LangChain.js v1"

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Nenhuma dependência - iniciar imediatamente
- **Phase 2 (Foundational)**: Depende de Phase 1 - BLOQUEIA todas as user stories
- **User Stories (Phase 3-8)**: Dependem de Phase 2
  - User Stories P1 (US1-US4) devem ser executadas em sequência
  - User Story P2 (US5) pode começar após P1 estar estável
  - User Story P3 (US6) pode começar após P2 estar estável
- **Phase 9 (Polish)**: Depende de todas as user stories estarem completas

### User Story Dependencies

- **User Story 1 (P1)**: Inicia após Phase 2 - Base para todas as outras
- **User Story 2 (P1)**: Depende de US1 - Ingestão precisa de dependências v1
- **User Story 3 (P1)**: Depende de US2 - Busca precisa de dados ingeridos
- **User Story 4 (P1)**: Depende de US3 - Geração precisa de busca funcional
- **User Story 5 (P2)**: Depende de US1-US4 - CLI valida todas as funcionalidades
- **User Story 6 (P3)**: Depende de US5 - Tutorial documenta código estável

### Parallel Opportunities

- Tasks T006-T009 (verificação de imports) podem rodar em paralelo
- Tasks T011-T013 (remoção de deprecated) podem rodar em paralelo
- Tasks T035-T036 (atualização de tutoriais) podem rodar em paralelo
- Tasks T040-T041 (validação final) podem rodar em paralelo

---

## Parallel Example: Phase 2

```bash
# Verificar imports em paralelo:
Task T006: "Verificar imports em src/google-client.ts"
Task T007: "Verificar imports em src/ingest.ts"
Task T008: "Verificar imports em src/search.ts"
Task T009: "Verificar imports em src/chat.ts"
```

---

## Implementation Strategy

### MVP First (User Stories P1)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T010)
3. Complete Phase 3-6: User Stories P1 (T011-T029)
4. **STOP and VALIDATE**: Testar ingest + search + chat
5. Deploy/demo se pronto

### Incremental Delivery

1. Setup + Foundational → Base pronta
2. US1 (Dependências) → Compilação OK → Checkpoint
3. US2 (Ingestão) → `npm run ingest` OK → Checkpoint
4. US3 (Busca) → Retriever funcional → Checkpoint
5. US4 (RAG) → Geração anti-alucinação → Checkpoint
6. US5 (CLI) → Sem regressões → Checkpoint
7. US6 (Tutorial) → Documentação atualizada → Checkpoint

---

## Notes

- Migração de baixa complexidade - maioria do código já compatível
- `PGVectorStore.initialize()` NÃO foi deprecated - manter uso atual
- Principal mudança: adicionar `asRetriever()` para padrão v1
- Testes são manuais conforme especificação
- Validar cada checkpoint antes de prosseguir
- Commit após cada user story ou grupo lógico de tasks

---

## Summary

| Métrica | Valor |
|---------|-------|
| **Total de Tasks** | 44 |
| **User Stories** | 6 (4 P1, 1 P2, 1 P3) |
| **Tasks por Story** | US1: 5, US2: 5, US3: 5, US4: 4, US5: 5, US6: 5 |
| **Tasks Parallelizáveis** | 15 |
| **MVP Scope** | US1-US4 (19 tasks) |
| **Fases** | 9 |
