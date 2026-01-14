# Contracts: Migração para LangChain.js v1

**Feature**: 001-langchain-v1-migration  
**Created**: 2026-01-13  
**Purpose**: Definir contratos de interface para os componentes

## CLI Contracts

### Comando: Ingestão

```bash
# Entrada
npm run ingest

# Saída esperada (stdout)
Starting PDF ingestion process...
Loading PDF from: ./document.pdf
PDF loaded successfully! Found N sections
Splitting documents into chunks...
Documents split into M chunks
Initializing Google embeddings...
Connecting to PostgreSQL vector store...
Adding documents to vector store...
Generating embeddings for M documents...
PDF ingestion completed successfully!
Total chunks processed: M

# Códigos de saída
0 = Sucesso
1 = Erro (PDF não encontrado, conexão falhou, etc.)
```

### Comando: Chat

```bash
# Entrada
npm run start

# Saída esperada (stdout)
STEP 6: Initializing the RAG Chat CLI Interface
============================================================
RAG CHAT - PDF Question and Answer System
Powered by Google Gemini + LangChain + pgVector
⚡ TypeScript + Node.js Implementation
============================================================
# ... banner e inicialização ...

Make a question: <user input>

Processing your question...
Searching PDF knowledge...

================================================================================
ASK: <user question>
================================================================================
🤖 RESPONSE:
<generated answer>
================================================================================
⚡ Response time: X.XXs

# Códigos de saída
0 = Saída normal (exit/quit)
1 = Erro fatal durante inicialização
```

## TypeScript Interface Contracts

### GoogleEmbeddings

```typescript
// Arquivo: src/google-client.ts
// Contrato: Herda de @langchain/core/embeddings.Embeddings

import { Embeddings } from '@langchain/core/embeddings';

export class GoogleEmbeddings extends Embeddings {
  /**
   * Gera embeddings para múltiplos textos
   * @param texts - Array de strings para embedding
   * @returns Promise com array de vetores (768 dimensões cada)
   */
  embedDocuments(texts: string[]): Promise<number[][]>;
  
  /**
   * Gera embedding para uma única query
   * @param text - String para embedding
   * @returns Promise com vetor de 768 dimensões
   */
  embedQuery(text: string): Promise<number[]>;
}
```

### GoogleClient

```typescript
// Arquivo: src/google-client.ts

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class GoogleClient {
  /**
   * Gera embeddings usando Google Gemini
   * @param texts - Array de textos
   * @returns Array de vetores de embedding
   */
  getEmbeddings(texts: string[]): Promise<number[][]>;
  
  /**
   * Gera resposta de chat usando Google Gemini
   * @param messages - Histórico de mensagens
   * @param temperature - Temperatura para geração (0.0 a 1.0)
   * @returns Resposta gerada
   */
  chatCompletions(messages: ChatMessage[], temperature?: number): Promise<string>;
}

export function getGoogleClient(): GoogleClient;
```

### RAGSearch

```typescript
// Arquivo: src/search.ts

export interface SearchResult {
  content: string;
  metadata: Record<string, unknown>;
  score: number;
}

export interface SystemStatus {
  isReady: boolean;
  chunksCount: number;
}

export class RAGSearch {
  /**
   * Busca documentos semanticamente similares à query
   * @param query - Texto de busca
   * @param k - Número máximo de resultados (default: 10)
   * @returns Array de resultados com score
   */
  searchDocuments(query: string, k?: number): Promise<SearchResult[]>;
  
  /**
   * Executa pipeline RAG completo: Retrieval → Context → Generation
   * @param query - Pergunta do usuário
   * @returns Resposta gerada baseada no contexto
   */
  generateAnswer(query: string): Promise<string>;
  
  /**
   * Verifica status do sistema
   * @returns Status de prontidão e contagem de chunks
   */
  getSystemStatus(): Promise<SystemStatus>;
}

/**
 * Factory function para criar instância RAGSearch
 * Inicializa conexões e valida prontidão
 */
export function searchPrompt(question?: string): Promise<RAGSearch | null>;
```

### PDFLoader (wrapper)

```typescript
// Arquivo: src/ingest.ts

import { Document } from '@langchain/core/documents';

class PDFLoader {
  constructor(filePath: string);
  
  /**
   * Carrega PDF e retorna documentos
   * @returns Array de documentos (um por página)
   */
  load(): Promise<Document[]>;
  
  /**
   * Pipeline completo de ingestão
   * Carrega → Chunking → Embedding → Store
   */
  ingestToVectorStore(): Promise<void>;
}
```

## Novos Contratos v1 (Retriever)

### Retriever Interface

```typescript
// Novo em v1 - usar asRetriever() do VectorStore

import { VectorStoreRetriever } from '@langchain/core/vectorstores';
import { Document } from '@langchain/core/documents';

interface RetrieverConfig {
  k?: number;              // Número de documentos (default: 4)
  searchType?: 'similarity' | 'mmr';  // Tipo de busca
  filter?: Record<string, unknown>;   // Filtro de metadata
}

// Uso:
const retriever: VectorStoreRetriever = vectorStore.asRetriever(config);

// Método principal:
retriever.invoke(query: string): Promise<Document[]>;
```

## Configuração de Ambiente

### Variáveis de Ambiente (.env)

```bash
# Obrigatórias
GOOGLE_API_KEY=<api-key>
DATABASE_URL=postgresql://user:password@host:port/database

# Opcionais
GOOGLE_EMBEDDING_MODEL=embedding-001
GOOGLE_CHAT_MODEL=gemini-1.5-flash
PG_VECTOR_COLLECTION_NAME=pdf_documents
```

## Dependências (package.json)

### Versões Anteriores (0.3.x)

```json
{
  "@langchain/community": "^0.3.55",
  "@langchain/core": "^0.3.75",
  "@langchain/textsplitters": "^0.1.0"
}
```

### Versões Alvo (v1.0)

```json
{
  "langchain": "^1.2.8",
  "@langchain/core": "^1.1.13",
  "@langchain/community": "^0.3.55",
  "@langchain/textsplitters": "^0.1.0"
}
```

**Nota**: `@langchain/community` e `@langchain/textsplitters` podem permanecer nas versões atuais pois são compatíveis com `@langchain/core` v1.
