import { config } from 'dotenv';
import { readFileSync } from 'fs';
import PdfParse from 'pdf-parse';
import { Document } from '@langchain/core/documents';

config();

class PDFLoader {

  constructor(private filePath: string) {}

  async load(): Promise<Document[]> {
    // Read the PDF file
    const pdfBuffer = readFileSync(this.filePath);

    // Parse PDF content using pdf-parse
    const pdfData = await PdfParse(pdfBuffer);

    const documents: Document[] = [];

    // Divide text into pages
    const pages = pdfData.text.split('\n\n').filter(page => page.trim().length > 0);

    // Create Document objects with metadata
    for (let i = 0; i < pages.length; i++) {
      documents.push(new Document({
        pageContent: pages[i].trim(),
        metadata: {
          page: i + 1,
          source: this.filePath,
          totalPages: pages.length
        }
      }));
    }

    return documents;
  }
}