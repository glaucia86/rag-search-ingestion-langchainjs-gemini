# PRD — Migração do RAG PDF Ingestion & Search para LangChain.js v1

## 1. Visão Geral

### 1.1 Contexto

O projeto atual implementa um pipeline completo de **RAG (Retrieval-Augmented Generation)** para ingestão de PDFs e busca semântica utilizando:

* TypeScript + Node.js
* Google Gemini (embeddings + generation)
* PostgreSQL + pgVector
* Docker
* LangChain.js **v0.3.55 (outdated)**

O time do LangChain.js lançou a **versão 1**, que introduz:

* Quebra de compatibilidade (breaking changes)
* Nova organização de pacotes
* APIs mais explícitas e tipadas
* Melhor separação entre **core**, **providers**, **retrievers** e **chains**
* Melhor alinhamento com arquiteturas modernas (RAG, Agents, LCEL)

A permanência na versão 0.3.x **bloqueia evolução futura**, dificulta adoção de novos exemplos oficiais e aumenta o risco de obsolescência.

---

## 2. Objetivo do Produto

### Objetivo Primário

Migrar o projeto para **LangChain.js v1**, garantindo:

* Compatibilidade total com a nova API
* Manutenção do comportamento funcional atual
* Código mais explícito, tipado e alinhado às boas práticas oficiais
* Base preparada para extensões futuras (ex: retrievers customizados, chains declarativas, agentes)

### Objetivos Secundários

* Reduzir acoplamento com APIs internas instáveis
* Tornar o projeto referência educacional para RAG moderno em TypeScript
* Facilitar manutenção e upgrades futuros do LangChain
* Atualização do tutorial que está na pasta `tutorial/article.md` de acordo com as mudanças realizadas no código

---

## 3. Escopo

### 3.1 Dentro do Escopo

* Atualização de dependências LangChain para v1
* Refatoração de:

  * Ingestão (PDF → chunks → embeddings → pgVector)
  * Busca semântica
  * Pipeline RAG
* Adequação às novas abstrações do LangChain v1
* Atualização de imports, tipos e contratos
* Validação funcional completa (ingest + search + chat)

### 3.2 Fora do Escopo

* Troca de banco vetorial (continua pgVector)
* Troca de LLM (continua Google Gemini)
* UI/Web (continua CLI)
* Introdução de Agents ou LangGraph (pode ser futuro)

---

## 4. Arquitetura Atual (Baseline)

### 4.1 Pipeline Atual

**Ingestão**

```
PDF → LangChain PDFLoader → RecursiveCharacterTextSplitter
→ GoogleEmbeddings → PGVectorStore
```

**Busca**

```
Query → Embedding → similaritySearchWithScore
→ Context Assembly → Prompt Template → Gemini
```

### 4.2 Pontos Críticos Atuais

* Uso de APIs que mudaram no v1 (`PGVectorStore.initialize`)
* Dependência implícita de side-effects (init no constructor)
* Embeddings customizados herdando de `Embeddings` (contrato alterado)
* Ausência de separação clara entre Retriever e Generator
* Pipeline RAG implementado manualmente (não composável)

---

## 5. Mudanças-Chave no LangChain.js v1 (Impacto)

### 5.1 Estruturais

| Área        | Antes (0.3.x)   | Depois (v1)                           |
| ----------- | --------------- | ------------------------------------- |
| Imports     | Mistos          | Modularizados e explícitos            |
| VectorStore | `.initialize()` | `fromExistingIndex` / `fromDocuments` |
| Embeddings  | Herança frouxa  | Contratos explícitos                  |
| RAG         | Manual          | Retriever-first                       |
| Pipelines   | Imperativos     | Componíveis (LCEL-ready)              |

### 5.2 Filosofia

* Menos “magic”
* Mais contratos explícitos
* Maior previsibilidade
* Melhor tipagem

---

## 6. Requisitos Funcionais

### RF-01 — Ingestão de PDF

* O sistema **deve** continuar carregando PDFs via loader oficial
* O chunking **deve** preservar a estratégia atual (400 chars, no overlap)
* O armazenamento **deve** permanecer em PostgreSQL + pgVector

### RF-02 — Embeddings

* O sistema **deve** continuar usando Google Gemini embeddings
* O adapter de embeddings **deve** respeitar a interface v1
* analisar se as dependencias do GoogleEmbeddings foram atualizadas para corresponder a versao v1 do LangChain.js. Não somente o GoogleEmbeddings deve ser atualizado, mas tambem todas as dependencias relacionadas a ele.

### RF-03 — Busca Semântica

* O sistema **deve** retornar os top-K documentos mais relevantes
* O score **deve** continuar disponível para debug/inspeção

### RF-04 — Geração de Resposta

* O prompt anti-hallucinação **deve** ser preservado
* A resposta **deve** usar exclusivamente o contexto recuperado

### RF-05 — CLI

* A interface CLI **não deve** sofrer regressões funcionais
* Comandos existentes devem continuar funcionando

---

## 7. Requisitos Não Funcionais

* **Compatibilidade:** Node.js 22+
* **Tipagem:** TypeScript strict
* **Observabilidade:** logs preservados
* **Manutenibilidade:** código modular, sem side-effects ocultos
* **Reprodutibilidade:** ingest e search idempotentes

---

## 8. Estratégia de Migração (Fases)

### Fase 1 — Dependências

* Atualizar:

  * `@langchain/core`
  * `@langchain/community`
  * `@langchain/textsplitters`
* Remover APIs deprecated

### Fase 2 — Embeddings

* Refatorar `GoogleEmbeddings` para:

  * Implementar contrato v1 corretamente
  * Eliminar herança frágil

### Fase 3 — Vector Store

* Substituir:

  * `PGVectorStore.initialize`
* Utilizar:

  * `fromExistingIndex` ou `fromDocuments`
* Separar claramente:

  * **Index lifecycle**
  * **Query lifecycle**

### Fase 4 — Retriever

* Introduzir Retriever explícito
* Isolar lógica de busca do pipeline de geração

### Fase 5 — RAG Pipeline

* Refatorar `generateAnswer` para:

  * Retrieval → Context Assembly → Generation
* Preparar código para LCEL (mesmo sem adotar agora)

### Fase 6 — Validação

* Testar:

  * Ingestão end-to-end
  * Busca semântica
  * CLI
* Comparar respostas antes/depois

---

## 9. Riscos e Mitigações

| Risco                        | Mitigação                   |
| ---------------------------- | --------------------------- |
| Breaking changes silenciosos | Migração faseada            |
| Diferença de scores          | Ajustar K e normalização    |
| Erros de tipagem             | Strict TS + build fail      |
| Regressão funcional          | Testes manuais comparativos |

---

## 10. Critérios de Aceitação

* Ingestão executa sem erros
* Busca retorna resultados coerentes
* CLI responde corretamente
* Código compila sem warnings
* Nenhuma dependência deprecated
* Projeto alinhado à documentação oficial do LangChain v1

---

## 11. Resultados Esperados

* Projeto **future-proof**
* Código mais claro e didático
* Base sólida para:

  * Chains declarativas
  * Agents
  * Observabilidade
  * Multi-doc ingestion
* Repositório alinhado ao estado da arte em RAG com TypeScript

---

## 12. Próximos Passos (Pós-Migração)

* Introduzir Retriever customizado
* Avaliar LCEL
* Separar ingest/search como serviços
* Preparar versão educacional (blog / workshop)