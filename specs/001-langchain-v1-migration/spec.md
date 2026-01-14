# Feature Specification: Migração para LangChain.js v1

**Feature Branch**: `001-langchain-v1-migration`  
**Created**: 2026-01-13  
**Status**: Draft  
**Input**: Migrar o projeto RAG PDF Ingestion & Search para LangChain.js v1, garantindo compatibilidade total com a nova API, mantendo comportamento funcional atual e preparando a base para extensões futuras.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Atualização das Dependências LangChain (Priority: P1)

Como desenvolvedor do projeto, quero que todas as dependências do LangChain.js sejam atualizadas para a versão 1, para que o projeto esteja alinhado com a documentação oficial e possa evoluir sem bloqueios de compatibilidade.

**Why this priority**: Esta é a base para todas as outras mudanças. Sem as dependências atualizadas, nenhuma refatoração de código pode ser validada. É o primeiro passo obrigatório.

**Independent Test**: Pode ser verificado executando `npm install` sem erros e validando que as versões das dependências `@langchain/core`, `@langchain/community` e `@langchain/textsplitters` estão na v1.

**Acceptance Scenarios**:

1. **Given** o arquivo package.json atual com LangChain 0.3.x, **When** as dependências são atualizadas para v1, **Then** `npm install` executa sem erros de compatibilidade
2. **Given** dependências v1 instaladas, **When** o projeto é compilado com `tsc`, **Then** nenhum erro de importação ou tipo é reportado

---

### User Story 2 - Ingestão de PDF Funcional (Priority: P1)

Como usuário do sistema, quero continuar ingerindo documentos PDF para que eles sejam processados, divididos em chunks e armazenados como embeddings no banco vetorial.

**Why this priority**: A ingestão é a funcionalidade central do pipeline RAG. Sem ela funcionando, não há dados para busca.

**Independent Test**: Pode ser testado executando o comando de ingestão com um PDF de teste e verificando que os documentos foram armazenados no PostgreSQL/pgVector.

**Acceptance Scenarios**:

1. **Given** um arquivo PDF válido, **When** o comando de ingestão é executado, **Then** os chunks são criados e armazenados no banco vetorial
2. **Given** o processo de ingestão, **When** o chunking é aplicado, **Then** a estratégia de 400 caracteres sem overlap é preservada
3. **Given** o processo de ingestão, **When** os embeddings são gerados, **Then** o Google Gemini embeddings é utilizado com a interface v1

---

### User Story 3 - Busca Semântica Funcional (Priority: P1)

Como usuário do sistema, quero realizar buscas semânticas que retornem os documentos mais relevantes para minha query, para que eu possa obter informações precisas dos PDFs ingeridos.

**Why this priority**: A busca é a segunda parte essencial do pipeline RAG. Após ingestão, a busca é o que entrega valor ao usuário.

**Independent Test**: Pode ser testado executando o comando de busca com uma query e verificando que retorna os top-K documentos com scores.

**Acceptance Scenarios**:

1. **Given** documentos previamente ingeridos, **When** uma query de busca é executada, **Then** os top-K documentos mais relevantes são retornados
2. **Given** resultados de busca, **When** os resultados são exibidos, **Then** o score de similaridade está disponível para cada documento
3. **Given** a busca semântica, **When** utiliza o VectorStore v1, **Then** usa `PGVectorStore.initialize()` e `vectorStore.asRetriever()` conforme padrão v1

---

### User Story 4 - Geração de Resposta com RAG (Priority: P1)

Como usuário do sistema, quero que as respostas geradas utilizem exclusivamente o contexto recuperado dos documentos, para evitar alucinações e garantir precisão.

**Why this priority**: A geração de resposta completa o pipeline RAG e é o que entrega a resposta final ao usuário.

**Independent Test**: Pode ser testado executando o chat com uma pergunta sobre conteúdo do PDF e validando que a resposta é baseada no contexto recuperado.

**Acceptance Scenarios**:

1. **Given** contexto recuperado de documentos, **When** a resposta é gerada, **Then** o prompt anti-alucinação é aplicado
2. **Given** uma pergunta do usuário, **When** o pipeline RAG é executado, **Then** a resposta usa exclusivamente informações do contexto recuperado
3. **Given** o pipeline de geração, **When** usa o LLM, **Then** continua utilizando Google Gemini

---

### User Story 5 - CLI Funcional sem Regressões (Priority: P2)

Como usuário do sistema, quero que todos os comandos CLI continuem funcionando da mesma forma após a migração, para que minha experiência de uso não seja afetada.

**Why this priority**: A CLI é a interface do usuário. Após garantir que o core funciona, a CLI precisa expor essas funcionalidades sem regressões.

**Independent Test**: Pode ser testado executando cada comando CLI (ingest, search, chat) e validando que produzem os resultados esperados.

**Acceptance Scenarios**:

1. **Given** o sistema migrado, **When** o comando de ingestão é executado via CLI, **Then** funciona identicamente ao comportamento anterior
2. **Given** o sistema migrado, **When** o comando de busca é executado via CLI, **Then** retorna resultados no mesmo formato
3. **Given** o sistema migrado, **When** o comando de chat é executado via CLI, **Then** responde corretamente às perguntas

---

### User Story 6 - Atualização do Tutorial (Priority: P3)

Como leitor do tutorial, quero que a documentação reflita as mudanças de código realizadas na migração, para que eu possa aprender com exemplos atualizados e funcionais.

**Why this priority**: O tutorial é material educacional. Deve ser atualizado após as mudanças de código estarem estáveis.

**Independent Test**: Pode ser testado revisando o arquivo `tutorial/article.md` e validando que os exemplos de código correspondem à implementação v1.

**Acceptance Scenarios**:

1. **Given** código migrado para v1, **When** o tutorial é revisado, **Then** todos os exemplos de código refletem as novas APIs
2. **Given** o tutorial atualizado, **When** um desenvolvedor segue os passos, **Then** consegue reproduzir o projeto funcional

---

### Edge Cases

> **Nota**: Os edge cases abaixo mantêm o comportamento existente (pré-migração). Esta migração não altera o tratamento de erros - apenas valida que o comportamento é preservado.

- O que acontece quando o PDF está corrompido ou vazio? → *Comportamento existente mantido*
- Como o sistema lida com falhas de conexão ao banco PostgreSQL? → *Comportamento existente mantido*
- O que acontece quando a query de busca não encontra documentos relevantes? → *Retorna "Não tenho informações" - testado em SC-003*
- Como o sistema se comporta quando o serviço Google Gemini está indisponível? → *Comportamento existente mantido*

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE atualizar dependências `@langchain/core`, `@langchain/community` e `@langchain/textsplitters` para v1
- **FR-002**: Sistema DEVE remover todas as APIs deprecated da versão 0.3.x
- **FR-003**: Sistema DEVE continuar carregando PDFs via loader oficial do LangChain
- **FR-004**: Sistema DEVE preservar estratégia de chunking de 400 caracteres sem overlap
- **FR-005**: Sistema DEVE armazenar embeddings em PostgreSQL + pgVector
- **FR-006**: Sistema DEVE utilizar Google Gemini para geração de embeddings com interface v1
- **FR-007**: Sistema DEVE retornar os top-K documentos mais relevantes na busca
- **FR-008**: Sistema DEVE disponibilizar score de similaridade nos resultados de busca
- **FR-009**: Sistema DEVE preservar o prompt anti-alucinação na geração de respostas
- **FR-010**: Sistema DEVE usar exclusivamente contexto recuperado para gerar respostas
- **FR-011**: Sistema DEVE implementar Retriever explícito usando `vectorStore.asRetriever()` para separar busca de geração
- **FR-012**: Sistema DEVE manter compatibilidade com `PGVectorStore.initialize()` (método não deprecated)
- **FR-013**: Sistema DEVE manter CLI funcional sem regressões
- **FR-014**: Sistema DEVE compilar sem warnings em TypeScript strict mode
- **FR-015**: Sistema DEVE atualizar tutorial em `tutorial/article.md` refletindo mudanças de código

### Key Entities

- **Document**: Representa um chunk de texto extraído do PDF, com conteúdo e metadados
- **Embedding**: Vetor numérico representando semanticamente um documento
- **VectorStore**: Abstração para armazenamento e busca de embeddings (PostgreSQL + pgVector)
- **Retriever**: Componente responsável por recuperar documentos relevantes para uma query
- **LLM**: Modelo de linguagem (Google Gemini) usado para geração de respostas

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Comando de ingestão processa PDF completo sem erros em menos de 2 minutos para documento de até 50 páginas
- **SC-002**: Busca semântica retorna resultados relevantes em menos de 3 segundos
- **SC-003**: Perguntas fora do contexto do PDF resultam na resposta "Não tenho informações necessárias para responder sua pergunta" (verificável com 3 perguntas de teste não relacionadas ao documento)
- **SC-004**: Projeto compila com `tsc` sem nenhum warning ou erro
- **SC-005**: Nenhuma dependência deprecated permanece no package.json
- **SC-006**: 100% dos comandos CLI funcionam identicamente ao comportamento pré-migração
- **SC-007**: Tutorial atualizado permite que desenvolvedor reproduza projeto funcional seguindo os passos

## Assumptions

- O projeto continuará usando Node.js 22+
- O banco PostgreSQL com extensão pgVector já está configurado e disponível
- As credenciais do Google Gemini estão configuradas via variáveis de ambiente
- O Docker Compose existente continuará sendo usado para o banco de dados
- Não haverá mudança na estrutura de arquivos ou organização de pastas do projeto
- A migração não introduzirá novas funcionalidades, apenas adaptará as existentes para a nova API
