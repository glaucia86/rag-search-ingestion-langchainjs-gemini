# Research: Migração para LangChain.js v1

**Feature**: 001-langchain-v1-migration  
**Created**: 2026-01-13  
**Purpose**: Consolidar pesquisas técnicas para a migração

## Resumo das Descobertas

### 1. Breaking Changes de 0.3.x para v1.0

| Mudança | Impacto |
|---------|---------|
| **Node.js 18 removido** | Requer Node.js 20+ (Node 18 EOL Março 2025) |
| **Reestruturação de pacotes** | Código legado movido para `@langchain/classic` |
| **Novo build output** | Abordagem baseada em bundler ao invés de TypeScript raw |
| **createAgent** | Renomeado de `createReactAgent`, movido para pacote `langchain` |
| **Prompts** | `prompt` → `systemPrompt`, prompts dinâmicos usam middleware |
| **Hooks** | Pre/post-model hooks substituídos por middleware |
| **APIs deprecated removidas** | Todos os métodos marcados deprecated para 1.0 foram deletados |

### 2. API do PGVectorStore

**DESCOBERTA CRÍTICA: `PGVectorStore.initialize()` NÃO foi deprecated!**

O método `initialize()` continua sendo o **método factory principal** recomendado:

```typescript
// ✅ AINDA VÁLIDO em v1.0 - abordagem recomendada
const vectorStore = await PGVectorStore.initialize(embeddings, {
  postgresConnectionOptions: {
    connectionString: process.env.DATABASE_URL,
  },
  tableName: 'pdf_documents',
  columns: {
    idColumnName: 'id',
    vectorColumnName: 'vector',
    contentColumnName: 'content',
    metadataColumnName: 'metadata',
  },
});
```

**Métodos factory estáticos disponíveis:**

| Método | Caso de Uso |
|--------|-------------|
| `initialize()` | Criar store a partir de config, auto-cria tabelas |
| `fromDocuments()` | Criar store E adicionar documentos em uma chamada |
| `fromTexts()` | Criar store a partir de strings de texto raw |

**⚠️ CORREÇÃO DO SPEC**: Não existe método `fromExistingIndex` no PGVectorStore. O FR-011 precisa ser corrigido.

### 3. Interface de Embeddings

A interface de embeddings permanece **estável e retrocompatível**:

```typescript
// Import path sem mudanças
import { Embeddings } from '@langchain/core/embeddings';

// A implementação atual de GoogleEmbeddings é compatível
interface EmbeddingsInterface<T extends number[] = number[]> {
  embedDocuments(texts: string[]): Promise<T[]>;
  embedQuery(text: string): Promise<T>;
}
```

A classe `GoogleEmbeddings` atual que herda de `Embeddings` continua funcionando.

### 4. Pacotes e Import Paths

| Pacote | Propósito |
|--------|-----------|
| `langchain` | Funcionalidade core de agentes |
| `@langchain/core` | Interfaces base (v1.1.13) |
| `@langchain/community` | Integrações incluindo PGVectorStore |
| `@langchain/textsplitters` | Text splitters (já em uso ✅) |
| **`@langchain/classic`** | **NOVO - chains legados, indexing API** |

**Imports atuais válidos:**
```typescript
// ✅ Tudo correto em v1
import { Document } from '@langchain/core/documents';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
```

### 5. Mudanças em @langchain/community e @langchain/core

**@langchain/core (agora v1.1.13):**
- Reasoning tokens propriamente elevados
- Standard content blocks (`contentBlocks` property em messages)
- Novos tipos TypeScript `ContentBlock`
- Interfaces base permanecem estáveis

**@langchain/community:**
- API do PGVectorStore sem mudanças
- PDFLoader localização sem mudanças
- Vector stores continuam suportando `asRetriever()`

**Movido para @langchain/classic:**
- Chains legados (e.g., `RetrievalQAChain`)
- Indexing API
- Alguns memory vector stores
- Retrievers avançados (`ParentDocumentRetriever`, `MultiVectorRetriever`)

### 6. Padrão Recomendado para Retriever em v1

**Opção A: Usar `asRetriever()` (Mais Simples - Recomendado)**

```typescript
const vectorStore = await PGVectorStore.initialize(embeddings, config);

// Converter para retriever com configuração
const retriever = vectorStore.asRetriever({
  k: 10,                    // Número de documentos
  searchType: 'similarity', // ou 'mmr' para diversidade
});

// Usar retriever
const docs = await retriever.invoke("What is the main topic?");
```

**Opção B: Retriever Customizado (Para necessidades avançadas)**

```typescript
import { BaseRetriever } from '@langchain/core/retrievers';
import { Document } from '@langchain/core/documents';

class CustomPDFRetriever extends BaseRetriever {
  lc_namespace = ['custom', 'retrievers'];
  
  constructor(private vectorStore: PGVectorStore, private k: number = 10) {
    super();
  }

  async _getRelevantDocuments(query: string): Promise<Document[]> {
    const results = await this.vectorStore.similaritySearchWithScore(query, this.k);
    return results
      .filter(([_, score]) => score < 0.5)
      .map(([doc]) => doc);
  }
}
```

### 7. PDFLoader e RecursiveCharacterTextSplitter

**PDFLoader - Sem mudanças necessárias:**
```typescript
// ✅ Import path sem mudanças
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
```

**RecursiveCharacterTextSplitter - Já correto:**
```typescript
// ✅ Import atual correto
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
```

## Decisões de Design

### Decisão 1: Manter PGVectorStore.initialize()

- **Escolha**: Continuar usando `PGVectorStore.initialize()`
- **Rationale**: Método não foi deprecated, permanece como API oficial
- **Alternativas rejeitadas**: `fromExistingIndex` não existe

### Decisão 2: Adicionar Retriever Explícito

- **Escolha**: Usar `vectorStore.asRetriever()` para criar retriever
- **Rationale**: Segue padrões v1, separa busca de geração, preparado para LCEL
- **Alternativas rejeitadas**: Retriever customizado desnecessário para caso atual

### Decisão 3: Atualização de Dependências

- **Escolha**: Atualizar para versões específicas v1
- **Rationale**: Garantir compatibilidade e aproveitar melhorias
- **Versões alvo**:
  - `langchain`: ^1.2.8
  - `@langchain/core`: ^1.1.13
  - `@langchain/community`: latest compatível
  - `@langchain/textsplitters`: ^0.1.0

### Decisão 4: Código Atual Compatível

A maioria do código atual já é compatível com v1:
- ✅ `GoogleEmbeddings` herda de `Embeddings` corretamente
- ✅ `PGVectorStore.initialize()` é o método correto
- ✅ Imports do PDFLoader e TextSplitter corretos
- ⚠️ Falta separação explícita Retriever/Generator

## Correções Necessárias no Spec

O FR-011 original afirma:
> "Sistema DEVE substituir `PGVectorStore.initialize` por `fromExistingIndex` ou `fromDocuments`"

**Esta afirmação está incorreta.** `initialize()` não foi deprecated e `fromExistingIndex` não existe.

**Correção**: FR-011 deve ser alterado para:
> "Sistema DEVE implementar Retriever explícito usando `vectorStore.asRetriever()` para separar busca de geração"

## Impacto Real da Migração

| Área | Nível de Mudança | Detalhes |
|------|------------------|----------|
| package.json | **Médio** | Atualizar versões das dependências |
| google-client.ts | **Baixo** | GoogleEmbeddings já compatível |
| ingest.ts | **Baixo** | PGVectorStore.initialize() mantido |
| search.ts | **Médio** | Adicionar Retriever explícito |
| chat.ts | **Nenhum** | Apenas consome search.ts |
| tutorial/article.md | **Baixo** | Atualizar versões mencionadas |
