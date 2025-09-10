import { config } from 'dotenv';
import { getGoogleClient, GoogleEmbeddings, ChatMessage } from './google-client';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';

config();

const PROMPT_TEMPLATE = `
  CONTEXTO FORNECIDO:
  {contexto}

  INSTRUÇÕES CRÍTICAS:
  - Responda EXCLUSIVAMENTE com base no CONTEXTO FORNECIDO acima.
  - Se a informação não estiver EXPLICITAMENTE no contexto, responda exatamente:
    "Não tenho informações necessárias para responder sua pergunta."
  - NUNCA use conhecimento externo ou invente informações.
  - NUNCA expresse opiniões pessoais ou interpretações além do texto fornecido.

  EXEMPLOS DE RESPOSTAS CORRETAS PARA PERGUNTAS SEM CONTEXTO:
  - "Qual é a capital da França?" -> "Nao tenho informações necessárias para responder sua pergunta."
  - "Quantos funcionários a empresa tem?" -> "Não tenho informações necessárias para responder sua pergunta."
  - "Você recomenda investir nisso?" -> "Não tenho informações necessárias para responder sua pergunta."

  PERGUNTA DO USUÁRIO:
  {pergunta}

  RESPOSTA (baseada apenas no contexto fornecido):
`;

export interface SearchResult {
  content: string;
  metadata: any;
  score: number;
}

export class RAGSearch {
  private databaseUrl: string;
  private collectionName: string;
  private embeddings: GoogleEmbeddings;
  private googleClient: any;
  private vectorStore: PGVectorStore | null = null;

  constructor() {
    // Load environment variables
    this.databaseUrl = process.env.DATABASE_URL || '';
    this.collectionName = process.env.PG_VECTOR_COLLECTION_NAME || 'pdf_documents';

    // Initialize main components
    this.embeddings = new GoogleEmbeddings();
    this.googleClient = getGoogleClient();
    this.vectorStore = null;

    this._initializeVectorStore();
  }

  private async _initializeVectorStore(): Promise<void> {
    try {
      // Connect to PostgreSQL vector store
      this.vectorStore = await PGVectorStore.initialize(this.embeddings, {
        postgresConnectionOptions: {
          connectionString: this.databaseUrl,
        },
        tableName: this.collectionName,
        columns: {
          idColumnName: 'id',
          vectorColumnName: 'vector',
          contentColumnName: 'content',
          metadataColumnName: 'metadata',
        },
      });

      console.log('RAG System: Connection to vector database established ')
    } catch (error) {
      console.log(`Error initializing vector database: ${error}`);
      throw error;
    }
  }

  async searchDocuments(query: string, k: number = 10): Promise<SearchResult[]> {
    if (!this.vectorStore) {
      throw new Error('Vector bank has not been initialized. Run ingestion first.');   
    }

    try {
      console.log(`Performing semantic search for: "${query}"`);
      console.log(`Searching for the ${k} most relevant chunks...`);

      // PHASE 1: SIMILARITY SEARCH WITH SCORES
      // Use similaritySearchWithScore to get both documents and scores
      const results = await this.vectorStore.similaritySearchWithScore(query, k);

      // PHASE 2: FORMAT RESULTS
      const formattedResults: SearchResult[] = [];

      for(const [document, score] of results) {
        formattedResults.push({
          content: document.pageContent, // Chunk text
          metadata: document.metadata, // Info about page, source, etc.
          score: score // Similarity score (lower is more similar)
        });
      }

      console.log(`Find ${formattedResults.length} relevant chunks.`);
      if (formattedResults.length > 0) {
        console.log(` Best score result: ${formattedResults[0].score.toFixed(4)}`);
      }

      return formattedResults;
    } catch (error) {
      console.log(`Error during semantic search: ${error}`);
      return []; // return empty array on error
    }
  }

  async generateAnswer(query: string): Promise<string> {
    try {
      console.log('STARTING COMPLETE RAG PIPELINE...');
      console.log('=' .repeat(50));

      // STEP 1: RETRIEVAL
      console.log('STEP 1: Retrieving relevant context');
      const documents = await this.searchDocuments(query, 10);

      if (!documents.length) {
        console.log('No relevant documents found in the database.');
        return 'I don\'t have the information necessary to answer your question.';
      }

      // STEP 2: CONTEXT ASSEMBLY
      console.log('STEP 2: Building context from the chunks found');
      const context = documents.map((doc, index) => {
        console.log(`   Chunk ${index + 1}: Score ${doc.score.toFixed(4)} - "${doc.content.substring(0, 80)}..."`);
        return doc.content;
      })
      .join('\n\n');

      console.log(`Context assembled: ${context.length} characters total`);

      console.log('STEP 3: Structuring prompts for the LLM');
      const fullPrompt = PROMPT_TEMPLATE
        .replace('{contexto}', context)
        .replace('{pergunta}', query);

      // STEP 4: GENERATION USING LLM
      console.log('STEP 4: Generating a response via Google Gemini');
      const messages: ChatMessage[] = [
        { role: 'user', content: fullPrompt }
      ];

      const response = await this.googleClient.chatCompletions(
        messages,
        0.1
      );

      console.log('PIPELINE RAG SUCCESSFULLY COMPLETED');
      console.log('=' .repeat(50));

      return response.trim();
    } catch (error) {
      console.log(`Error in RAG pipeline: ${error}`);
      return 'Internal error: Unable to process your query. Please check if ingestion has been performed.';
    }
  }

  // Utility method for checking system status
  async getSystemStatus(): Promise<{ isReady: boolean; chunksCount: number}> {
    try {
      if (!this.vectorStore) {
        return { isReady: false, chunksCount: 0 };
      }

      const testResults = await this.vectorStore.similaritySearch("test", 1);
      return {
        isReady: true,
        chunksCount: testResults.length > 0 ? -1 : 0 // -1 means "there are documents, but we don't know how many
      }
    } catch (error) {
      return { isReady: false, chunksCount: 0 };
    }
  }
}

// Factory function to create RAG instance
export async function searchPrompt(question?: string): Promise<RAGSearch | null> {
  try {
    console.log('Initializing RAG Search system...');
    const ragSearch = new RAGSearch();

    await new Promise(resolve => setTimeout(resolve, 1000));

    const status = await ragSearch.getSystemStatus();
    if (!status.isReady) {
      console.log('System is not ready. Run ingestion first.');
      return null;
    }

    console.log('RAG system initialized and ready for use.');
    return ragSearch;
  } catch (error) {
    console.log(`Error initializing RAG Search system: ${error}`);
    return null;
  }
}

// Test execution
(async () => {
  console.log('TEST MODE: Testing the RAG system');
  
  const searchSystem = await searchPrompt();
  if (searchSystem) {
    const testQueries = [
      'Qual o faturamento da empresa?',
      'Quantos funcionários trabalham na empresa?', 
      'Qual é a capital da França?' // This should return "I have no information.""
    ];
    
    for (const testQuery of testQueries) {
      console.log(`\nTeste: ${testQuery}`);
      const result = await searchSystem.generateAnswer(testQuery);
      console.log(`Resposta: ${result}`);
      console.log('-'.repeat(80));
    }
  } else {
    console.log('Failure to initialize the RAG system');
  }
})();