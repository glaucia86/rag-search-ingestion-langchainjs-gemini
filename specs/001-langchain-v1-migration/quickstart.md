# Quickstart: Migração para LangChain.js v1

**Feature**: 001-langchain-v1-migration  
**Created**: 2026-01-13  
**Purpose**: Guia rápido para desenvolvedores implementarem a migração

## Pré-requisitos

- Node.js 22+ instalado
- Docker e Docker Compose instalados
- Credenciais Google Gemini API configuradas
- Repositório clonado e na branch `001-langchain-v1-migration`

## Setup Rápido

### 1. Iniciar banco de dados

```bash
docker compose up -d
```

### 2. Instalar dependências atualizadas

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.sample .env
# Editar .env com suas credenciais
```

### 4. Executar ingestão

```bash
npm run ingest
```

### 5. Testar chat

```bash
npm run start
```

## Mudanças Principais

### package.json

```diff
 {
   "dependencies": {
+    "langchain": "^1.2.8",
-    "@langchain/core": "^0.3.75",
+    "@langchain/core": "^1.1.13",
     "@langchain/community": "^0.3.55",
     "@langchain/textsplitters": "^0.1.0"
   }
 }
```

### search.ts - Adicionar Retriever

```typescript
// ANTES (v0.3.x) - busca direta no VectorStore
const results = await this.vectorStore.similaritySearchWithScore(query, k);

// DEPOIS (v1.0) - usar Retriever explícito
const retriever = this.vectorStore.asRetriever({ k: 10 });
const docs = await retriever.invoke(query);

// Para manter scores, usar método auxiliar
const resultsWithScore = await this.vectorStore.similaritySearchWithScore(query, k);
```

### Imports - Sem mudanças necessárias

```typescript
// Todos os imports atuais permanecem válidos ✅
import { Document } from '@langchain/core/documents';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { Embeddings } from '@langchain/core/embeddings';
```

## Verificação da Migração

### Checklist de Validação

- [ ] `npm install` executa sem erros
- [ ] `npm run build` compila sem warnings
- [ ] `npm run ingest` processa PDF com sucesso
- [ ] `npm run start` inicia chat funcional
- [ ] Respostas do chat são baseadas no contexto do PDF

### Comandos de Teste

```bash
# Verificar versões instaladas
npm ls @langchain/core langchain

# Compilar projeto
npm run build

# Testar ingestão
npm run ingest

# Testar chat interativo
npm run start
```

## Arquitetura Após Migração

```
┌─────────────────────────────────────────────────────────┐
│                      CLI (chat.ts)                       │
└─────────────────────────────┬───────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   RAGSearch (search.ts)                  │
│  ┌─────────────────┐    ┌────────────────────────────┐ │
│  │    Retriever    │───▶│  Context Assembly + LLM    │ │
│  │  asRetriever()  │    │      generateAnswer()      │ │
│  └────────┬────────┘    └────────────────────────────┘ │
└───────────┼─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│              PGVectorStore (v1 compatible)               │
│                   initialize()                           │
└─────────────────────────────┬───────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│               PostgreSQL + pgVector                      │
└─────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Erro: "Cannot find module 'langchain'"

```bash
npm install langchain@^1.2.8
```

### Erro: "Type 'X' is not assignable to type 'Y'"

Verifique se todas as dependências @langchain/* estão na mesma versão major:
```bash
npm ls | grep langchain
```

### Erro: "PGVectorStore.initialize is not a function"

`initialize()` NÃO foi deprecated. Verifique se o import está correto:
```typescript
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
```

### Erro de conexão com PostgreSQL

```bash
# Verificar se container está rodando
docker ps

# Reiniciar se necessário
docker compose down && docker compose up -d
```
