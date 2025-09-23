# 🤖 RAG Search Ingestion - LangChain.js + Docker + Gemini

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain.js-0.3+-00A86B?style=for-the-badge&logo=chainlink&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-API-4285F4?style=for-the-badge&logo=google&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![pgVector](https://img.shields.io/badge/pgVector-Extension-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

Uma aplicação completa de **Retrieval-Augmented Generation (RAG)** para busca inteligente em documentos PDF, construída com TypeScript, Node.js e tecnologias modernas de IA.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração](#-configuração)
- [Como Executar](#-como-executar)
- [Como Usar](#-como-usar)
- [Exemplos de Perguntas](#-exemplos-de-perguntas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Funcionalidades](#-funcionalidades)
- [Troubleshooting](#-troubleshooting)
- [Tutorial Completo](#-tutorial-completo)

## 🎯 Visão Geral

Este projeto implementa um sistema RAG completo que permite fazer perguntas em linguagem natural sobre o conteúdo de documentos PDF. O sistema processa documentos, cria embeddings vetoriais, armazena em um banco de dados PostgreSQL com pgVector e responde perguntas usando Google Gemini.

### Como Funciona

1. **Ingestão**: O sistema carrega e processa documentos PDF, dividindo-os em chunks
2. **Vetorização**: Cada chunk é convertido em embeddings usando Google Gemini
3. **Armazenamento**: Os embeddings são armazenados no PostgreSQL com extensão pgVector
4. **Busca**: Quando você faz uma pergunta, o sistema encontra os chunks mais relevantes
5. **Geração**: O Google Gemini gera uma resposta baseada no contexto encontrado

## 🛠 Tecnologias Utilizadas

### Backend & Processamento
- **Node.js 22+** - Runtime JavaScript
- **TypeScript** - Linguagem de programação tipada
- **LangChain.js** - Framework para aplicações de IA
- **TSX** - Executor TypeScript para desenvolvimento

### Banco de Dados & Vetores
- **PostgreSQL 15** - Banco de dados relacional
- **pgVector** - Extensão para busca vetorial
- **Docker & Docker Compose** - Containerização

### IA & Machine Learning
- **Google Gemini API** - Modelo de linguagem para embeddings e chat
- **models/embedding-001** - Modelo para criar embeddings
- **gemini-2.0-flash** - Modelo para geração de respostas

### Processamento de Documentos
- **pdf-parse** - Extração de texto de PDFs
- **RecursiveCharacterTextSplitter** - Divisão inteligente de texto

## 🏗 Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   PDF Document  │    │   Text Splitter   │    │   Embeddings    │
│                 │───▶│                  │───▶│   (Gemini)      │
│   document.pdf  │    │   LangChain.js   │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  User Question  │    │   Similarity     │    │   PostgreSQL    │
│                 │───▶│   Search         │◀───│   + pgVector    │
│  "Qual empresa  │    │                  │    │                 │
│   tem maior     │    └──────────────────┘    └─────────────────┘
│   faturamento?" │            │
└─────────────────┘            ▼
        ▲              ┌──────────────────┐
        │              │   Context        │
        │              │   Assembly       │
        │              │                  │
        │              └──────────────────┘
        │                      │
        │                      ▼
        │              ┌──────────────────┐
        │              │   Google Gemini  │
        └──────────────│   Response       │
                       │   Generation     │
                       └──────────────────┘
```

## 📋 Pré-requisitos

- **Node.js 22+** instalado
- **Docker & Docker Compose** instalados
- **Google AI Studio API Key** (gratuita)
- **Git** para clonar o repositório

## ⚙️ Configuração

### 1. Clone o Repositório

```bash
git clone https://github.com/glaucia86/rag-search-ingestion-langchainjs-gemini.git
cd rag-search-ingestion-langchainjs-gemini
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Google AI API Configuration
GOOGLE_API_KEY=sua_api_key_aqui

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rag
DB_USER=postgres
DB_PASSWORD=postgres

# Vector Database Configuration
VECTOR_DIMENSION=768
```

### 4. Obtenha sua Google API Key

1. Acesse [Google AI Studio](https://aistudio.google.com/)
2. Crie uma nova API Key
3. Copie e cole no arquivo `.env`

## 🚀 Como Executar

### Passo 1: Iniciar o Banco de Dados

```bash
docker-compose up -d
```

### Passo 2: Processar o PDF (Ingestão)

```bash
npm run dev:ingest
```

### Passo 3: Iniciar o Chat Interativo

```bash
npm run dev:chat
```

## 💬 Como Usar

Após executar o chat, você verá a interface:

```
============================================================
🤖 RAG CHAT - Sistema de Perguntas e Respostas em PDF
Powered by Google Gemini + LangChain + pgVector
⚡ TypeScript + Node.js Implementation
============================================================

Sistema pronto! Digite sua pergunta ou "help" para ver comandos.

💬 Faça uma pergunta: _
```

### Comandos Especiais

- `help` - Mostra ajuda e comandos disponíveis
- `status` - Verifica o status do sistema
- `clear` - Limpa a tela
- `exit` - Sai do chat

## 🎯 Exemplos de Perguntas

### Perguntas sobre Faturamento
```
Qual empresa teve o maior faturamento?
Qual o faturamento da empresa Aliança Energia?
Liste as 5 empresas com maior receita
Quais empresas faturaram mais de 1 bilhão?
```

### Perguntas sobre Empresas
```
Quantas empresas estão listadas no documento?
Qual empresa foi fundada mais recentemente?
Liste empresas fundadas na década de 1990
Qual empresa tem o menor faturamento?
```

### Perguntas Analíticas
```
Qual setor tem mais empresas?
Compare o faturamento entre diferentes setores
Qual a média de faturamento das empresas?
Quantas empresas foram fundadas em cada década?
```

### Perguntas Específicas
```
Existe alguma empresa de tecnologia na lista?
Quais empresas têm "Sustentável" no nome?
Liste empresas do setor de energia
Qual empresa do setor automotivo tem maior faturamento?
```

## 📁 Estrutura do Projeto

```
rag-search-ingestion-langchainjs-gemini/
├── src/
│   ├── chat.ts              # Interface de chat interativo
│   ├── search.ts            # Pipeline RAG e busca semântica
│   ├── ingest.ts            # Processamento e ingestão de PDFs
│   └── google-client.ts     # Cliente Google Gemini API
├── docker-compose.yml       # Configuração PostgreSQL + pgVector
├── document.pdf            # Documento de exemplo
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configuração TypeScript
├── .env                    # Variáveis de ambiente (criar)
└── README.md              # Esta documentação
```

### Descrição dos Arquivos

- **`chat.ts`** - Interface principal do usuário com readline
- **`search.ts`** - Implementa o pipeline RAG completo (4 etapas)
- **`ingest.ts`** - Processa PDFs e cria embeddings vetoriais
- **`google-client.ts`** - Integração com Google Gemini API

## ✨ Funcionalidades

### 🔍 Busca Semântica Inteligente

- Encontra informações relevantes mesmo com sinônimos
- Busca contextual usando embeddings vetoriais
- Ranking de relevância automático

### 🤖 Respostas Naturais

- Respostas em português natural
- Baseadas exclusivamente no conteúdo do PDF
- Contexto preservado durante a conversa

### ⚡ Performance Otimizada

- Cache de embeddings no PostgreSQL
- Busca vetorial ultrarrápida com pgVector
- Processamento assíncrono

### 🛡️ Tratamento de Erros

- Validação de entrada robusta
- Fallbacks para problemas de API
- Mensagens de erro amigáveis

## 🔧 Troubleshooting

### Problema: "Error connecting to database"
```bash
# Verificar se PostgreSQL está rodando
docker ps

# Reiniciar containers
docker-compose down
docker-compose up -d
```

### Problema: "Google API Key invalid"
1. Verifique se a API Key está correta no `.env`
2. Confirme que a API está ativa no Google AI Studio
3. Verifique se não há espaços ou caracteres extras

### Problema: "No documents found"

```bash
# Executar ingestão novamente
npm run dev:ingest

# Verificar documentos no banco
docker exec postgres_rag_ts psql -U postgres -d rag -c "SELECT COUNT(*) FROM pdf_documents;"
```

### Problema: "429 Too Many Requests"

- Aguarde alguns minutos (limite de quota)
- Verifique seu plano no Google AI Studio
- Consider usar uma nova API Key se disponível

## 📊 Scripts Disponíveis

```bash
npm run build          # Compila TypeScript para JavaScript
npm run start          # Executa versão compilada
npm run dev:chat       # Chat interativo (desenvolvimento)
npm run dev:ingest     # Ingestão de PDF (desenvolvimento)
```

## 📚 Tutorial Completo

Um tutorial detalhado está disponível no arquivo [tutorial/article.md](./tutorial/article.md). Ele cobre desde a configuração inicial até a execução completa do sistema RAG, com explicações passo a passo e capturas de tela.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma feature branch
3. Fazer commit das mudanças
4. Criar um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

- **Twitter** - [@glaucia86](https://twitter.com/glaucia86)
- **LinkedIn** - [Glaucia Lemos](https://www.linkedin.com/in/glaucialemos/)
- **YouTube** - [Glaucia Lemos](https://www.youtube.com/@GlauciaLemos) 

---

⭐ **Se este projeto foi útil, deixe uma estrela no GitHub!**
