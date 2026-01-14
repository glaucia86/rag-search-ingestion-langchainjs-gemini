# Data Model: Migração para LangChain.js v1

**Feature**: 001-langchain-v1-migration  
**Created**: 2026-01-13  
**Purpose**: Definir entidades e relacionamentos do sistema

## Entidades

### Document

Representa um chunk de texto extraído do PDF após processamento.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| pageContent | string | Conteúdo textual do chunk |
| metadata | DocumentMetadata | Metadados associados ao documento |

### DocumentMetadata

Metadados associados a cada documento/chunk.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| source | string | Caminho do arquivo PDF de origem |
| page | number | Número da página no PDF |
| loc | object | Localização no documento (linhas) |

### SearchResult

Resultado de uma busca semântica com score.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| content | string | Conteúdo textual do chunk encontrado |
| metadata | DocumentMetadata | Metadados do documento |
| score | number | Score de similaridade (menor = mais similar) |

### ChatMessage

Mensagem para comunicação com o LLM.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| role | 'system' \| 'user' \| 'assistant' | Papel do remetente |
| content | string | Conteúdo da mensagem |

### SystemStatus

Status do sistema RAG para verificação de saúde.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| isReady | boolean | Sistema pronto para uso |
| chunksCount | number | Quantidade de chunks disponíveis |

## Interfaces de Serviço

### EmbeddingsInterface (LangChain Core)

Interface padrão do LangChain para embeddings.

```typescript
interface EmbeddingsInterface {
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}
```

### RetrieverInterface (LangChain Core)

Interface padrão do LangChain v1 para retrievers.

```typescript
interface RetrieverInterface {
  invoke(query: string): Promise<Document[]>;
}
```

## Fluxos de Dados

### Pipeline de Ingestão

```
PDF File
    │
    ▼
┌──────────────┐
│  PDFLoader   │
└──────┬───────┘
       │ Document[]
       ▼
┌──────────────────────────────┐
│ RecursiveCharacterTextSplitter│
└──────────────┬───────────────┘
               │ Document[] (chunks)
               ▼
┌──────────────────────┐
│   GoogleEmbeddings   │
│   embedDocuments()   │
└──────────┬───────────┘
           │ number[][] (vectors)
           ▼
┌──────────────────────┐
│    PGVectorStore     │
│    addDocuments()    │
└──────────────────────┘
           │
           ▼
    PostgreSQL + pgVector
```

### Pipeline de Busca (RAG)

```
User Query (string)
       │
       ▼
┌──────────────────────┐
│      Retriever       │  ← NOVO em v1
│      invoke()        │
└──────────┬───────────┘
           │ Document[]
           ▼
┌──────────────────────┐
│   Context Assembly   │
│   (join contents)    │
└──────────┬───────────┘
           │ string (context)
           ▼
┌──────────────────────┐
│   Prompt Template    │
│  (anti-hallucination)│
└──────────┬───────────┘
           │ string (full prompt)
           ▼
┌──────────────────────┐
│    Google Gemini     │
│   chatCompletions()  │
└──────────┬───────────┘
           │
           ▼
    Response (string)
```

## Relacionamentos

```
┌─────────────┐      1:N      ┌─────────────┐
│    PDF      │──────────────▶│   Document  │
│   (File)    │               │   (Chunk)   │
└─────────────┘               └──────┬──────┘
                                     │
                                     │ 1:1
                                     ▼
                              ┌─────────────┐
                              │  Embedding  │
                              │  (Vector)   │
                              └──────┬──────┘
                                     │
                                     │ N:1
                                     ▼
                              ┌─────────────┐
                              │ VectorStore │
                              │ (pgVector)  │
                              └─────────────┘
```

## Estado do Sistema

### Antes da Migração (v0.3.x)

- `PGVectorStore.initialize()` usado diretamente
- Busca via `similaritySearchWithScore()` diretamente no store
- Sem abstração de Retriever
- Pipeline RAG manual

### Após da Migração (v1.0)

- `PGVectorStore.initialize()` mantido (não deprecated)
- Retriever criado via `vectorStore.asRetriever()`
- Busca via `retriever.invoke()`
- Pipeline RAG preparado para LCEL
- Separação clara entre Retrieval e Generation
