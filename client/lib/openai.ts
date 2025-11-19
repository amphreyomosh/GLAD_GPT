import OpenAI from "openai";

const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY
});

export type AIMode = "fast" | "auto" | "expert" | "heavy" | "code_architect" | "research_assistant" | "academic_writer";

export type CodeLanguage =
 | "html" | "css" | "javascript" | "typescript" | "python" | "java"
 | "cpp" | "csharp" | "php" | "ruby" | "go" | "rust" | "swift"
 | "kotlin" | "sql" | "json" | "xml" | "yaml" | "markdown";

interface ChatMessage {
 role: "system" | "user" | "assistant";
 content: string;
}

interface FileAnalysis {
 filename: string;
 content: string;
 mimeType: string;
}

interface CodeSnippet {
 language: CodeLanguage;
 code: string;
 filename?: string;
 description?: string;
}

interface WebsiteContent {
 url: string;
 title: string;
 content: string;
 metadata: {
   description?: string;
   keywords?: string;
   author?: string;
 };
}

interface DocumentAnalysis {
 classification: string;
 contentAnalysis: string;
 criticalEvaluation: string;
 researchIntegration: string;
 practicalApplication: string;
}

interface ResearchInsights {
 practicalApplications: string[];
 keyFindings: string[];
 methodology: string;
 limitations: string;
}

interface AcademicSupport {
 learningObjectives: string;
 studyMaterials: string;
 pedagogicalSupport: string;
 writingAssistance: string;
 assessmentPrep: string;
}

interface EnhancedResponse {
 mainResponse: string;
 codeSnippets?: CodeSnippet[];
 websiteAnalysis?: WebsiteContent;
 suggestions?: string[];
 relatedTopics?: string[];
 documentAnalysis?: DocumentAnalysis;
 researchInsights?: ResearchInsights;
 academicSupport?: AcademicSupport;
 citationHelp?: string[];
}

export type ResearchField = "computer_science" | "medicine" | "psychology" | "business" | "education" | "general";

export class EnhancedOpenAIService {
private getModelsToTry(mode: AIMode): string[] {
 switch (mode) {
   case "fast":
     return ["gpt-4o-mini", "gpt-4o"];
   case "auto":
   case "expert":
     return ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"];
   case "heavy":
   case "code_architect":
     return ["gpt-4o", "gpt-4-turbo"];
   default:
     return ["gpt-4o-mini", "gpt-4o"];
 }
}

private getSystemPrompt(mode: AIMode): string {
 const basePrompt = `You are GLAD GPT, an exceptional AI assistant with deep expertise across multiple domains.
 You are witty, informative, engaging, and provide incredibly detailed and valuable responses.`;

 const codePrompt = `
 CODING GUIDELINES:
 - Always separate code by language (HTML, CSS, JavaScript, etc.)
 - Provide complete, production-ready code snippets
 - Include detailed comments and explanations
 - Follow best practices and modern standards
 - When creating web projects, always provide separate files unless specifically asked for inline code
 - Include error handling and accessibility features
 - Suggest optimizations and alternative approaches
 `;

 const qualityPrompt = `
 RESPONSE QUALITY STANDARDS:
 - Provide comprehensive, detailed explanations
 - Include practical examples and use cases
 - Offer multiple solutions when applicable
 - Explain the reasoning behind recommendations
 - Include potential challenges and how to overcome them
 - Provide step-by-step instructions when relevant
 - Add context about industry best practices
 `;

 switch (mode) {
   case "fast":
     return `${basePrompt} Provide quick but still comprehensive responses with essential details.`;

   case "auto":
     return `${basePrompt} ${qualityPrompt} Automatically choose the best approach for each query.`;

   case "expert":
     return `${basePrompt} ${qualityPrompt} ${codePrompt}
     Think as a senior expert with 10+ years of experience. Provide detailed, expert-level responses
     with thorough analysis, potential edge cases, and professional insights.`;

   case "heavy":
     return `${basePrompt} ${qualityPrompt} ${codePrompt}
     Use your full capabilities as a team of world-class experts. Provide comprehensive,
     multi-faceted analysis with detailed explanations, multiple approaches, and complete solutions.
     Consider scalability, maintainability, security, and performance in all recommendations.`;

   case "code_architect":
     return `${basePrompt} ${codePrompt}
     You are a Senior Software Architect and Full-Stack Developer.
     - Always create modular, scalable, and maintainable code
     - Separate concerns properly (HTML structure, CSS styling, JS logic)
     - Use modern frameworks and libraries when appropriate
     - Implement responsive design and accessibility standards
     - Include comprehensive documentation and comments
     - Consider performance optimization and best practices
     - Provide file structure recommendations for larger projects`;

   default:
     return basePrompt;
 }
}

async generateResponse(
 messages: ChatMessage[],
 mode: AIMode = "auto",
 fileAnalyses?: FileAnalysis[]
): Promise<EnhancedResponse> {
 const modelsToTry = this.getModelsToTry(mode);
 const systemPrompt = this.getSystemPrompt(mode);

 // Prepare conversation messages
 const conversationMessages: ChatMessage[] = [
   { role: "system", content: systemPrompt },
   ...messages
 ];

 // Add file analysis context
 if (fileAnalyses && fileAnalyses.length > 0) {
   const fileContext = fileAnalyses.map(file =>
     `File: ${file.filename} (${file.mimeType})\nContent: ${file.content.slice(0, 3000)}...`
   ).join("\n\n");

   conversationMessages.splice(1, 0, {
     role: "system",
     content: `UPLOADED FILES CONTEXT:\n\n${fileContext}\n\nUse this information to provide more accurate and contextual responses.`
   });
 }

 // Try models in order
 for (const model of modelsToTry) {
   try {
     console.log(`Attempting to use model: ${model}`);

     const response = await openai.chat.completions.create({
       model,
       messages: conversationMessages,
       temperature: this.getTemperature(mode),
       max_tokens: this.getMaxTokens(mode),
       top_p: 0.95,
       frequency_penalty: 0.1,
       presence_penalty: 0.1,
     });

     const mainResponse = response.choices[0].message.content ||
       "I apologize, but I couldn't generate a response. Please try again.";

     console.log(`Successfully used model: ${model}`);

     // Extract code snippets from response
     const codeSnippets = this.extractCodeFromResponse(mainResponse);

     // Generate suggestions and related topics
     const suggestions = this.generateSuggestions(mainResponse, mode);
     const relatedTopics = this.generateRelatedTopics(messages[messages.length - 1].content);

     return {
       mainResponse,
       codeSnippets: codeSnippets.length > 0 ? codeSnippets : undefined,
       suggestions,
       relatedTopics
     };

   } catch (error: any) {
     console.log(`Model ${model} failed:`, error.message);

     if (!this.isModelAccessError(error)) {
       console.error("OpenAI API error:", error);
       throw error;
     }
     continue;
   }
 }

 throw new Error("No available AI models found. Please check your OpenAI API key permissions.");
}

private getTemperature(mode: AIMode): number {
 const temperatures = {
   fast: 0.7,
   auto: 0.6,
   expert: 0.4,
   heavy: 0.3,
   code_architect: 0.2,
   research_assistant: 0.3,
   academic_writer: 0.3
 };
 return temperatures[mode] || 0.5;
}

private getMaxTokens(mode: AIMode): number {
 const maxTokens = {
   fast: 1500,
   auto: 2500,
   expert: 3500,
   heavy: 4000,
   code_architect: 4000,
   research_assistant: 4000,
   academic_writer: 4000
 };
 return maxTokens[mode] || 2000;
}

private isModelAccessError(error: any): boolean {
 return error.message?.includes('does not have access to model') ||
        error.message?.includes('model_not_found') ||
        error.message?.includes('The model') ||
        error.code?.includes('model_not_found');
}

private generateSuggestions(response: string, mode: AIMode): string[] {
 const suggestions: string[] = [];

 if (mode === "code_architect" && response.includes('```')) {
   suggestions.push("Consider implementing unit tests for the provided code");
   suggestions.push("Add error handling and input validation");
   suggestions.push("Optimize for performance and accessibility");
 }

 if (response.includes('http')) {
   suggestions.push("Verify SSL certificates and security headers");
   suggestions.push("Consider implementing caching strategies");
 }

 return suggestions;
}

private generateRelatedTopics(query: string): string[] {
 // Simple keyword-based related topics generation
 const topics: string[] = [];

 if (query.toLowerCase().includes('web')) {
   topics.push("Progressive Web Apps", "Web Performance Optimization", "Web Security Best Practices");
 }

 if (query.toLowerCase().includes('code') || query.toLowerCase().includes('programming')) {
   topics.push("Code Review Best Practices", "Design Patterns", "Clean Code Principles");
 }

 return topics;
}

private extractCodeFromResponse(response: string): CodeSnippet[] {
 const codeSnippets: CodeSnippet[] = [];
 const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
 let match;

 while ((match = codeBlockRegex.exec(response)) !== null) {
   const language = (match[1] as CodeLanguage) || "text";
   const code = match[2].trim();

   if (code) {
     // Generate filename based on language
     const filename = this.generateFilename(language, codeSnippets.length);

     codeSnippets.push({
       language,
       code,
       filename,
       description: this.generateCodeDescription(language, code)
     });
   }
 }

 return codeSnippets;
}

private generateFilename(language: CodeLanguage, index: number): string {
 const extensions: Record<CodeLanguage, string> = {
   html: 'html',
   css: 'css',
   javascript: 'js',
   typescript: 'ts',
   python: 'py',
   java: 'java',
   cpp: 'cpp',
   csharp: 'cs',
   php: 'php',
   ruby: 'rb',
   go: 'go',
   rust: 'rs',
   swift: 'swift',
   kotlin: 'kt',
   sql: 'sql',
   json: 'json',
   xml: 'xml',
   yaml: 'yml',
   markdown: 'md'
 };

 const extension = extensions[language] || 'txt';
 const baseName = language === 'html' ? 'index' :
                 language === 'css' ? 'styles' :
                 language === 'javascript' ? 'script' :
                 `file_${index + 1}`;

 return `${baseName}.${extension}`;
}

private generateCodeDescription(language: CodeLanguage, code: string): string {
 const descriptions: Record<CodeLanguage, string> = {
   html: 'HTML structure and markup',
   css: 'Styling and layout definitions',
   javascript: 'Interactive functionality and logic',
   typescript: 'Type-safe JavaScript implementation',
   python: 'Python implementation',
   java: 'Java implementation',
   cpp: 'C++ implementation',
   csharp: 'C# implementation',
   php: 'PHP server-side logic',
   ruby: 'Ruby implementation',
   go: 'Go implementation',
   rust: 'Rust implementation',
   swift: 'Swift implementation',
   kotlin: 'Kotlin implementation',
   sql: 'Database queries and operations',
   json: 'Configuration or data structure',
   xml: 'XML markup and data',
   yaml: 'Configuration file',
   markdown: 'Documentation'
 };

 return descriptions[language] || `${language} code snippet`;
}
}

export const enhancedOpenAIService = new EnhancedOpenAIService();