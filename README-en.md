# 🤖 RAG Search Ingestion - LangChain.js + Docker + Gemini

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain.js-1.x+-00A86B?style=for-the-badge&logo=chainlink&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-API-4285F4?style=for-the-badge&logo=google&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![pgVector](https://img.shields.io/badge/pgVector-Extension-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A complete **Retrieval-Augmented Generation (RAG)** application for intelligent PDF document search, built with TypeScript, Node.js, and modern AI technologies.

## 📋 Table of Contents

- [Overview](#-overview)
- [Technologies Used](#-technologies-used)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Setup](#-setup)
- [How to Run](#-how-to-run)
- [How to Use](#-how-to-use)
- [Example Questions](#-example-questions)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Troubleshooting](#-troubleshooting)
- [Complete Tutorial](#-complete-tutorial)

## 🎯 Overview

This project implements a complete RAG system that allows natural language questions about PDF document content. The system processes documents, creates vector embeddings, stores them in a PostgreSQL database with pgVector, and answers questions using Google Gemini.

### How It Works

1. **Ingestion**: The system loads and processes PDF documents, splitting them into chunks
2. **Vectorization**: Each chunk is converted into embeddings using Google Gemini
3. **Storage**: Embeddings are stored in PostgreSQL with pgVector extension
4. **Search**: When you ask a question, the system finds the most relevant chunks
5. **Generation**: Google Gemini generates an answer based on the found context

## 🛠 Technologies Used

### Backend & Processing
- **Node.js 22+** - JavaScript runtime
- **TypeScript** - Typed programming language
- **LangChain.js** - Framework for AI applications
- **TSX** - TypeScript executor for development

### Database & Vectors
- **PostgreSQL 15** - Relational database
- **pgVector** - Extension for vector search
- **Docker & Docker Compose** - Containerization

### AI & Machine Learning
- **Google Gemini API** - Language model for embeddings and chat
- **models/gemini-embedding-001** - Model for creating embeddings
- **models/gemma-3-4b-it** - Model for response generation

### Document Processing
- **@langchain/community/document_loaders** - PDF text extraction via LangChain PDFLoader
- **@langchain/textsplitters** - Intelligent text splitting with RecursiveCharacterTextSplitter

## 🏗 Architecture

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
│  "Which company │    │                  │    │                 │
│   has the       │    └──────────────────┘    └─────────────────┘
│   highest       │            │
│   revenue?"     │            ▼
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

## 📋 Prerequisites

- **Node.js 22+** installed
- **Docker & Docker Compose** installed
- **Google AI Studio API Key** (free)
- **Git** to clone the repository

## ⚙️ Setup

### 1. Clone the Repository

```bash
git clone https://github.com/glaucia86/rag-search-ingestion-langchainjs-gemini.git
cd rag-search-ingestion-langchainjs-gemini
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Google AI Studio API Key (REQUIRED)
# Get it at: https://aistudio.google.com/apikey
GOOGLE_API_KEY=your_google_api_key_here

# Embeddings (you can choose your preferred model)
GOOGLE_EMBEDDING_MODEL=models/gemini-embedding-001
GOOGLE_EMBEDDING_DIMS=3072

# Chat / generation (you can choose your preferred model)
GOOGLE_CHAT_MODEL=models/gemma-3-4b-it

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rag
PG_VECTOR_COLLECTION_NAME=pdf_documents
PDF_PATH=./document.pdf
```

### 4. Get your Google API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API Key
3. Copy and paste it into the `.env` file

## 🚀 How to Run

### Step 1: Start the Database

```bash
docker-compose up -d
```

### Step 2: Process the PDF (Ingestion)

```bash
npm run dev:ingest
```

### Step 3: Start the Interactive Chat

```bash
npm run dev:chat
```

## 💬 How to Use

After running the chat, you'll see the interface:

```
============================================================
🤖 RAG CHAT - PDF Question and Answer System
Powered by Google Gemini + LangChain + pgVector
⚡ TypeScript + Node.js Implementation
============================================================

System ready! Type your question or "help" to see commands.

💬 Ask a question: _
```

### Special Commands

- `help` - Shows help and available commands
- `status` - Checks system status
- `clear` - Clears the screen
- `exit` - Exits the chat

## 🎯 Example Questions

### Revenue Questions
```
Which company had the highest revenue?
What is Aliança Energia's revenue?
List the top 5 companies by revenue
Which companies earned more than 1 billion?
```

### Company Questions
```
How many companies are listed in the document?
Which company was founded most recently?
List companies founded in the 1990s
Which company has the lowest revenue?
```

### Analytical Questions
```
Which sector has the most companies?
Compare revenue between different sectors
What is the average revenue of companies?
How many companies were founded in each decade?
```

### Specific Questions
```
Are there any technology companies in the list?
Which companies have "Sustainable" in their name?
List energy sector companies
Which automotive company has the highest revenue?
```

## 📁 Project Structure

```
rag-search-ingestion-langchainjs-gemini/
├── src/
│   ├── chat.ts              # Interactive chat interface
│   ├── search.ts            # RAG pipeline and semantic search
│   ├── ingest.ts            # PDF processing and ingestion
│   └── google-client.ts     # Google Gemini API client
├── docker-compose.yml       # PostgreSQL + pgVector configuration
├── document.pdf            # Sample document
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── .env                    # Environment variables (create)
└── README.md              # This documentation
```

### File Descriptions

- **`chat.ts`** - Interactive chat interface with readline
- **`search.ts`** - Implements complete RAG pipeline (4 stages)
- **`ingest.ts`** - PDF processing and ingestion
- **`google-client.ts`** - Google Gemini API client

## ✨ Features

### 🔍 Intelligent Semantic Search
- Finds relevant information even with synonyms
- Contextual search using vector embeddings
- Automatic relevance ranking

### 🤖 Natural Responses
- Responses in natural language
- Based exclusively on PDF content
- Context preserved during conversation

### ⚡ Optimized Performance
- Embedding cache in PostgreSQL
- Ultra-fast vector search with pgVector
- Asynchronous processing

### 🛡️ Error Handling
- Robust input validation
- Fallbacks for API issues
- User-friendly error messages

## 🔧 Troubleshooting

### Problem: "Error connecting to database"
```bash
# Check if PostgreSQL is running
docker ps

# Restart containers
docker-compose down
docker-compose up -d
```

### Problem: "Google API Key invalid"
1. Check if the API Key is correct in `.env`
2. Confirm the API is active in Google AI Studio
3. Check for extra spaces or characters

### Problem: "No documents found"
```bash
# Run ingestion again
npm run dev:ingest

# Check documents in database
docker exec postgres_rag_ts psql -U postgres -d rag -c "SELECT COUNT(*) FROM pdf_documents;"
```

### Problem: "429 Too Many Requests"
- Wait a few minutes (quota limit)
- Check your plan in Google AI Studio
- Consider using a new API Key if available

## 📊 Available Scripts

```bash
npm run build          # Compiles TypeScript to JavaScript
npm run start          # Runs compiled version
npm run dev:chat       # Interactive chat (development)
npm run dev:ingest     # PDF ingestion (development)
```

## 📚 Complete Tutorial

A detailed tutorial is available in the [tutorial/article-en.md](./tutorial/article-en.md) file. It covers everything from initial setup to complete execution of the RAG system, with step-by-step explanations and screenshots.

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Create a Pull Request

## 📝 License

This project is under the MIT license. See the `LICENSE` file for more details.

## 👨‍💻 Author

- **Twitter** - [@glaucia86](https://twitter.com/glaucia86)
- **LinkedIn** - [Glaucia Lemos](https://www.linkedin.com/in/glaucialemos/)
- **YouTube** - [Glaucia Lemos](https://www.youtube.com/@GlauciaLemos)

---

⭐ **If this project was helpful, leave a star on GitHub!**