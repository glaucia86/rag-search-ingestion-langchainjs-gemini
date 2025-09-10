import { config } from 'dotenv';
import { Document } from '@langchain/core/documents';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { GoogleEmbeddings } from './google-client';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PDFLoader as LangChainPDFLoader } from '@langchain/community/document_loaders/fs/pdf';

config();

class PDFLoader {

  constructor(private filePath: string) {}

  async load(): Promise<Document[]> {
    try {
      console.log(`Reading PDF file: ${this.filePath}`);
      
      // Use LangChain PDF loader instead of pdf-parse
      const langChainLoader = new LangChainPDFLoader(this.filePath);
      const documents = await langChainLoader.load();
      
      console.log(`PDF loaded successfully! Found ${documents.length} pages`);
      
      return documents;
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw error;
    }
  }

  async ingestToVectorStore(): Promise<void> {
    try {
      console.log('Starting PDF ingestion process...');
      
      // Step 1: Load PDF
      console.log(`Loading PDF from: ${this.filePath}`);
      const rawDocuments = await this.load();
      console.log(`PDF loaded successfully! Found ${rawDocuments.length} sections`);

      // Step 2: Split documents into chunks
      console.log('Splitting documents into chunks...');
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const splitDocuments = await textSplitter.splitDocuments(rawDocuments);
      console.log(`Documents split into ${splitDocuments.length} chunks`);

      // Step 3: Initialize embeddings
      console.log('Initializing Google embeddings...');
      const embeddings = new GoogleEmbeddings();

      // Step 4: Initialize vector store
      console.log('Connecting to PostgreSQL vector store...');
      const vectorStore = await PGVectorStore.initialize(embeddings, {
        postgresConnectionOptions: {
          connectionString: process.env.DATABASE_URL,
        },
        tableName: process.env.PG_VECTOR_COLLECTION_NAME || 'pdf_documents',
        columns: {
          idColumnName: 'id',
          vectorColumnName: 'vector',
          contentColumnName: 'content',
          metadataColumnName: 'metadata',
        },
      });

      // Step 5: Add documents to vector store
      console.log('Adding documents to vector store...');
      await vectorStore.addDocuments(splitDocuments);

      console.log('PDF ingestion completed successfully!');
      console.log(`Total chunks processed: ${splitDocuments.length}`);
      
      // Close the connection
      await vectorStore.end();
      
    } catch (error) {
      console.error('Error during PDF ingestion:', error);
      process.exit(1);
    }
  }
}

// Main execution function
async function main() {
  const pdfPath = './document.pdf';
  const loader = new PDFLoader(pdfPath);
  await loader.ingestToVectorStore();
}

// Run ingestion
main();