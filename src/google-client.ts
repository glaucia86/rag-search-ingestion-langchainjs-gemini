import { config } from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Embeddings } from '@langchain/core/embeddings';

config();

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class GoogleClient {
  private googleApiKey: string;
  private embeddingModel: string;
  private chatModel: string;
  private embeddingDims: number;
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.googleApiKey = process.env.GOOGLE_API_KEY || '';
    this.embeddingModel = process.env.GOOGLE_EMBEDDING_MODEL || 'models/gemini-embedding-001';
    this.chatModel = process.env.GOOGLE_CHAT_MODEL || 'models/gemma-3-4b-it';
    this.embeddingDims = Number(process.env.GOOGLE_EMBEDDING_DIMS || '3072');

    if (!this.googleApiKey) {
      throw new Error('Google API key is not set in environment variables.');
    }

    // Initialize GoogleGenerativeAI instance
    this.genAI = new GoogleGenerativeAI(this.googleApiKey);
  }

  async getEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    for(const text of texts) {
      try {
        const model = this.genAI.getGenerativeModel({ model: this.embeddingModel});
        const result = await model.embedContent(text);
        
        if (result.embedding?.values) {
            embeddings.push(result.embedding.values);
        } else {
          embeddings.push(new Array(this.embeddingDims).fill(0));
        }
      } catch (error) {
        console.log(`Error generating embedding for text: ${text}`, error);
        embeddings.push(new Array(this.embeddingDims).fill(0));
      }
    }

    return embeddings;
  }

  async chatCompletions(messages: ChatMessage[], temperature: number = 0.1): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: this.chatModel,
        generationConfig: {
          temperature,
          maxOutputTokens: 1000,
        }
      });

      // Convert messages to a single prompt string
      let prompt = '';

      for (const message of messages) {
        const { role, content  } = message;

        if (role === 'system') {
          prompt += `Instructions: ${content}\n\n`;
        } else if (role === 'user') {
          prompt += `${content}\n`;
        } else if (role === 'assistant') {
          prompt += `Assistant: ${content}\n`;
        }
      }

      // Generate response using the model
      const result = await model.generateContent(prompt);
      const response = result.response;

      return response.text();
    } catch (error) {
      console.log(`Error generating chat completion: ${error}`);
      return 'Sorry, an error occurred while generating the response.';
    }
  }
}

export class GoogleEmbeddings extends Embeddings {
  private client: GoogleClient;

  constructor() {
    super({});
    this.client = new GoogleClient();
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    console.log(`Generating embeddings for ${texts.length} documents...`);

    const batchSize = 10; // Processing 10 texts at a time for a better optimization
    const allEmbeddings: number[][] = [];

    for(let i = 0; i < texts.length; i += batchSize) {
      const batchTexts = texts.slice(i, i + batchSize);
      const batchEmbeddings = await this.client.getEmbeddings(batchTexts);
      allEmbeddings.push(...batchEmbeddings);

      console.log(`Lot ${Math.floor(i / batchSize) + 1}: ${batchTexts.length} processed texts`);  
    }

    return allEmbeddings;
  }

  // Method for embedding a single query
  async embedQuery(text: string): Promise<number[]> {
    const embeddings = await this.client.getEmbeddings([text]);
    return embeddings[0];
  }
}

// Factory function to create a GoogleClient instances
export function getGoogleClient(): GoogleClient {
  return new GoogleClient();
}