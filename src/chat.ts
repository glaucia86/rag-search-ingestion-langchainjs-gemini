import { createInterface } from "readline";
import { searchPrompt, RAGSearch } from "./search";

// Function to print initial banner with system informations
function printBanner(): void {
  console.log('='.repeat(60));
  console.log('RAG CHAT - PDF Question and Answer System');
  console.log('Powered by Google Gemini + LangChain + pgVector');
  console.log('⚡ TypeScript + Node.js Implementation');
  console.log('='.repeat(60));
  console.log("Special commands:");
  console.log("   • 'exit, quit, exit' - Closes the program");
  console.log("   • 'help' - Shows available commands");
  console.log("   • 'clear' - Clears the screen");
  console.log("   • 'status' - Checks system status");
  console.log('='.repeat(60));
}

// Function to print help instructions
function printHelp(): void {
  console.log('\n AVAILABLE COMMANDS:');
  console.log('   exit, quit, exit    - Closes the program');
  console.log('   help                 - Shows available commands');
  console.log('   clear               - Clears the screen');
  console.log('   status              - Checks system status');
  console.log('   [any text]         - Asks a question about the PDF');
  console.log('\n TIPS FOR USE:');
  console.log('   • Ask specific questions about the PDF content');
  console.log('   • The system responds only based on the document');
  console.log('   • Out-of-context questions return "I don\'t have information"');
  console.log();
}

// Function to clear the console screen
function clearScreen(): void {
  console.clear();
}

async function checkStatus(searchSystem: RAGSearch | null): Promise<void> {
  console.log('\n RAG SYSTEM STATUS:');
  console.log('='.repeat(40));
  
  if (!searchSystem) {
    console.log('System: NOT INITIALIZED');
    console.log('\n TROUBLESHOOTING CHECKLIST:');
    console.log('   1. Is PostgreSQL running?');
    console.log('      → Command: docker compose up -d');
    console.log('   2. Has ingestion been executed?'); 
    console.log('      → Command: npm run ingest');
    console.log('   3. Is the API Key configured?');
    console.log('      → File: .env (GOOGLE_API_KEY)');
    console.log('   4. Are dependencies installed?');
    console.log('      → Command: npm install');
    return;
  }

  try {
    const systemStatus = await searchSystem.getSystemStatus();

    console.log('RAG System: OPERATIONAL');
    console.log('PostgreSQL Connection: OK');
    console.log('pgVector Extension: OK'); 
    console.log('Google Gemini API: OK');
    console.log(`Vector Database: ${systemStatus.isReady ? 'READY' : 'NOT READY'}`);

    if (systemStatus.chunksCount > 0) {
      console.log(`Available chunks: ${systemStatus.chunksCount}`);
    }

    console.log('\n System ready to answer questions!');
  } catch (error) {
    console.log('Status: PARTIALLY OPERATIONAL');
    console.log(`Error checking system status: ${error}`);
  }

  console.log('='.repeat(40));
}

// Main function to initialize RAG system and handle user input
async function main(): Promise<void> {
  console.log('STEP 6: Initializing the RAG Chat CLI Interface');

  printBanner();

  console.log('\n PHASE 1: INITIALIZING RAG SYSTEM');
  const searchSystem = await searchPrompt();

  if (!searchSystem) {
    console.log('\n CRITICAL ERROR: RAG system could not be initialized!');
    console.log('\n POSSIBLE CAUSES AND SOLUTIONS:');
    console.log('   1. PostgreSQL is not running');
    console.log('      → Solution: docker compose up -d');
    console.log('   2. Ingestion process has not been executed');
    console.log('      → Solution: npm run ingest');
    console.log('   3. GOOGLE_API_KEY is not configured or invalid');
    console.log('      → Solution: Configure in the .env file');
    console.log('   4. Node.js dependencies are not installed');
    console.log('      → Solution: npm install');
    console.log('   5. pgVector extension has not been created');
    console.log('      → Solution: Check Docker logs');

    process.exit(1);
  }

  console.log('PHASE 1: RAG system initialized successfully!\n');

  // PHASE 2: SETUP COMMAND LINE INTERFACE
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\n Make a question: '
  });

  // Helper function to capture user input asynchronously
  const askQuestion = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  console.log('System ready! Type your question or “help” to see commands.');

  // PHASE 3: MAIN CHAT LOOP
  while(true) {
    try {
      // Capture user input
      const userInput = (await askQuestion('\n Make a question: ')).trim();

      // PROCESSING COMMAND: Analyze whether it is a special command or a question
      const command = userInput.toLowerCase();

      // Output commands
      if (['exit', 'quit', 'sair', 'q'].includes(command)) {
        console.log('\n Thank you for using RAG Chat. Goodbye!\n');
        console.log('System shutting down...');
        break;
      }

      // Help command
      if (['ajuda', 'help', 'h', '?'].includes(command)) {
        printHelp();
        continue;
      }

      // Clear screen command
      if (['limpar', 'clear', 'cls'].includes(command)) {
        clearScreen();
        printBanner();
        continue;
      }

      // Status command
      if (['status', 'info', 's'].includes(command)) {
        await checkStatus(searchSystem);
        continue;
      }

      // Validate empty input
      if (!userInput) {
        console.log('Empty input. Type a question or “help” to see commands.');
        continue;
      }

      // PROCESSING QUESTION: Forward the question to the RAG system
      console.log('\n Processing your question...');
      console.log('Searching PDF knowledge...');

      const startTime = Date.now();

      // Call the complete RAG pipeline
      const answer = await searchSystem.generateAnswer(userInput);

      const endTime = Date.now();
      const responseTime = ((endTime - startTime) / 1000).toFixed(2);

      // FORMATTED DISPLAY OF THE RESPONSE
      console.log('\n' + '='.repeat(80));
      console.log(`ASK: ${userInput}`);
      console.log('='.repeat(80));
      console.log(`🤖 RESPONSE:`);
      console.log(answer);
      console.log('='.repeat(80));
      console.log(`⚡ Response time: ${responseTime}s`);
    } catch (error) {
      // TRATAMENTO DE ERROS
      if (error instanceof Error && error.message.includes('SIGINT')) {
        // Ctrl+C foi pressionado
        console.log('\n\n Interruption detected (Ctrl+C)');
        console.log('👋 Chat closed by user. See you next time!');
        break;
      } else {
        // Outros erros
        console.log(`\n Unexpected error during processing:`);
        console.log(`   ${error}`);
        console.log('\n You can:');
        console.log('   • Try again with another question');
        console.log('   • Type "status" to check the system');
        console.log('   • Type "exit" to quit');
      }
    }
  }

  rl.close();
}

// EVENT HANDLERS: Operating system signal management

// Handler for Ctrl+C (SIGINT)
process.on('SIGINT', () => {
  console.log('\n\n Interrupt signal received (Ctrl+C)');
  console.log('Cleaning up resources...');
  console.log('RAG Chat closed. See you later!');
  process.exit(0);
});

// Handler for uncaught errors
process.on('uncaughtException', (error) => {
  console.error('\n Uncaught FATAL ERROR:', error);
  console.error('Restart the application: npm run start');
  process.exit(1);
});

// Handler for rejected promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n Unhandled rejected promise:', reason);
  console.error('Promise:', promise);
});

// ENTRY POINT: Run if file called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('\n FATAL ERROR in main application:', error);
    console.error('Try restarting: npm run start');
    process.exit(1);
  });
}