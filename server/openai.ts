import OpenAI from "openai";
import dotenv from "dotenv";
import axios from "axios";
import { JSDOM } from "jsdom";

// Load environment variables
dotenv.config();

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
      return ["gpt-4o-mini", "gpt-3.5-turbo"];
    case "auto":
    case "expert":
      return ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"];
    case "heavy":
    case "code_architect":
      return ["gpt-4o", "gpt-4o-mini"];
    default:
      return ["gpt-4o-mini", "gpt-3.5-turbo"];
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

async fetchWebsiteContent(url: string): Promise<WebsiteContent | null> {
  try {
    console.log(`Fetching content from: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Extract meaningful content
    const title = document.querySelector('title')?.textContent || '';
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    const metaAuthor = document.querySelector('meta[name="author"]')?.getAttribute('content') || '';

    // Remove script and style tags
    const scripts = document.querySelectorAll('script');
    const styles = document.querySelectorAll('style');
    scripts.forEach(script => script.remove());
    styles.forEach(style => style.remove());

    // Get main content
    const bodyText = document.body?.textContent || '';
    const cleanContent = bodyText.replace(/\s+/g, ' ').trim().slice(0, 5000);

    return {
      url,
      title,
      content: cleanContent,
      metadata: {
        description: metaDescription,
        keywords: metaKeywords,
        author: metaAuthor
      }
    };
  } catch (error) {
    console.error(`Failed to fetch website content: ${error}`);
    return null;
  }
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
  const firstLine = code.split('\n')[0];
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

private async generateEnhancedPrompt(
  originalPrompt: string, 
  mode: AIMode,
  websiteContent?: WebsiteContent
): Promise<string> {
  let enhancedPrompt = originalPrompt;

  // Add website context if available
  if (websiteContent) {
    enhancedPrompt += `\n\nWEBSITE CONTEXT:
    URL: ${websiteContent.url}
    Title: ${websiteContent.title}
    Description: ${websiteContent.metadata.description || 'N/A'}
    Content Preview: ${websiteContent.content.slice(0, 1000)}...
    
    Please use this website information to provide more contextual and relevant responses.`;
  }

  // Add mode-specific enhancements
  if (mode === "code_architect") {
    enhancedPrompt += `\n\nCODE ARCHITECTURE REQUIREMENTS:
    - Create separate files for HTML, CSS, and JavaScript
    - Use modern ES6+ JavaScript features
    - Implement responsive design with CSS Grid/Flexbox
    - Follow semantic HTML5 standards
    - Include accessibility attributes (ARIA labels, alt text, etc.)
    - Add comprehensive comments and documentation
    - Consider component-based architecture where applicable`;
  }

  if (mode === "heavy" || mode === "expert") {
    enhancedPrompt += `\n\nENHANCED RESPONSE REQUIREMENTS:
    - Provide multiple implementation approaches
    - Include pros and cons for each solution
    - Add performance considerations
    - Suggest testing strategies
    - Include deployment recommendations
    - Consider scalability and maintainability
    - Add relevant industry insights and best practices`;
  }

  return enhancedPrompt;
}

async generateResponse(
  messages: ChatMessage[],
  mode: AIMode = "auto",
  fileAnalyses?: FileAnalysis[]
): Promise<EnhancedResponse> {
  const modelsToTry = this.getModelsToTry(mode);
  const systemPrompt = this.getSystemPrompt(mode);

  // Check for URLs in the latest message
  const latestMessage = messages[messages.length - 1];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = latestMessage.content.match(urlRegex);
  let websiteContent: WebsiteContent | null = null;

  if (urls && urls.length > 0) {
    websiteContent = await this.fetchWebsiteContent(urls[0]);
  }

  // Enhance the prompt with website content and mode-specific requirements
  const enhancedPrompt = await this.generateEnhancedPrompt(
    latestMessage.content,
    mode,
    websiteContent || undefined
  );

  // Update the latest message with enhanced prompt
  const enhancedMessages = [...messages];
  enhancedMessages[enhancedMessages.length - 1] = {
    ...latestMessage,
    content: enhancedPrompt
  };

  // Prepare conversation messages
  const conversationMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...enhancedMessages
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
      const suggestions = await this.generateSuggestions(mainResponse, mode);
      const relatedTopics = await this.generateRelatedTopics(latestMessage.content);

      return {
        mainResponse,
        codeSnippets: codeSnippets.length > 0 ? codeSnippets : undefined,
        websiteAnalysis: websiteContent || undefined,
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

private async generateSuggestions(response: string, mode: AIMode): Promise<string[]> {
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

private async generateRelatedTopics(query: string): Promise<string[]> {
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

private async extractDocumentAnalysis(response: string, mode: AIMode): Promise<DocumentAnalysis> {
  const sections = this.parseResponseSections(response);
  return {
    classification: sections['DOCUMENT CLASSIFICATION & CONTEXT'] || 'Not specified',
    contentAnalysis: sections['CONTENT ANALYSIS'] || 'Not specified',
    criticalEvaluation: sections['CRITICAL EVALUATION'] || 'Not specified',
    researchIntegration: sections['RESEARCH INTEGRATION'] || 'Not specified',
    practicalApplication: sections['PRACTICAL APPLICATION'] || 'Not specified'
  };
}

private async extractResearchInsights(response: string, mode: AIMode): Promise<ResearchInsights> {
  const sections = this.parseResponseSections(response);
  return {
    practicalApplications: this.extractListFromSection(sections['PRACTICAL APPLICATION'] || ''),
    keyFindings: this.extractListFromSection(sections['CONTENT ANALYSIS'] || ''),
    methodology: sections['CONTENT ANALYSIS']?.split('Methodology')[1]?.split('\n')[0]?.trim() || 'Not specified',
    limitations: sections['CRITICAL EVALUATION']?.split('limitations')[1]?.split('\n')[0]?.trim() || 'Not specified'
  };
}

private async extractAcademicSupport(response: string, mode: AIMode): Promise<AcademicSupport> {
  const sections = this.parseResponseSections(response);
  return {
    learningObjectives: sections['LEARNING OBJECTIVES'] || 'Not specified',
    studyMaterials: sections['STUDY MATERIALS CREATION'] || 'Not specified',
    pedagogicalSupport: sections['PEDAGOGICAL SUPPORT'] || 'Not specified',
    writingAssistance: sections['ACADEMIC WRITING ASSISTANCE'] || 'Not specified',
    assessmentPrep: sections['ASSESSMENT PREPARATION'] || 'Not specified'
  };
}

private parseResponseSections(response: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = response.split('\n');
  let currentSection = '';
  let currentContent = '';

  for (const line of lines) {
    if (line.match(/^\d+\.\s+[A-Z\s&]+$/)) {
      if (currentSection) {
        sections[currentSection] = currentContent.trim();
      }
      currentSection = line.replace(/^\d+\.\s+/, '');
      currentContent = '';
    } else {
      currentContent += line + '\n';
    }
  }

  if (currentSection) {
    sections[currentSection] = currentContent.trim();
  }

  return sections;
}

private extractListFromSection(section: string): string[] {
  const lines = section.split('\n');
  const list: string[] = [];
  for (const line of lines) {
    if (line.trim().startsWith('- ')) {
      list.push(line.trim().substring(2));
    }
  }
  return list;
}

// Enhanced image analysis with detailed descriptions
async analyzeImage(base64Image: string, prompt?: string): Promise<EnhancedResponse> {
  const visionModels = ["gpt-4o", "gpt-4o-mini"];
  
  const enhancedPrompt = prompt || `Analyze this image in comprehensive detail:
  - Describe the visual elements, composition, and style
  - Identify any text, objects, or people present
  - Explain the context and potential purpose
  - Suggest improvements or optimizations if applicable
  - Provide technical details about the image quality and format if relevant`;
  
  for (const model of visionModels) {
    try {
      console.log(`Attempting image analysis with model: ${model}`);
      
      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: enhancedPrompt },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64Image}` }
              }
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.4,
      });

      const mainResponse = response.choices[0].message.content || 
        "I couldn't analyze this image. Please try again.";
      
      console.log(`Successfully analyzed image with model: ${model}`);
      
      return {
        mainResponse,
        suggestions: [
          "Consider image optimization for web use",
          "Verify accessibility with alt text descriptions",
          "Check image licensing and usage rights"
        ]
      };
    } catch (error: any) {
      console.log(`Image analysis model ${model} failed:`, error.message);
      
      if (!this.isModelAccessError(error)) {
        console.error("Image analysis error:", error);
        throw new Error("Failed to analyze image. Please try again.");
      }
      continue;
    }
  }
  
  throw new Error("No vision models available for image analysis. Please check your OpenAI API key permissions.");
}

// Enhanced document analysis with comprehensive research support
async analyzeDocument(
  content: string, 
  filename: string, 
  mimeType: string,
  mode: AIMode = "research_assistant"
): Promise<EnhancedResponse> {
  try {
    const analysisPrompt = this.buildDocumentAnalysisPrompt(content, filename, mimeType, mode);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: this.getSystemPrompt(mode)
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.2,
      max_tokens: 4000,
    });

    const mainResponse = response.choices[0].message.content || 
      "I couldn't analyze this document. Please try again.";

    // Extract comprehensive analysis components
    const documentAnalysis = await this.extractDocumentAnalysis(mainResponse, mode);
    const researchInsights = await this.extractResearchInsights(mainResponse, mode);
    const academicSupport = await this.extractAcademicSupport(mainResponse, mode);

    return {
      mainResponse,
      documentAnalysis,
      researchInsights,
      academicSupport,
      suggestions: [
        "Consider cross-referencing with additional sources",
        "Look for recent updates or revisions to this information",
        "Evaluate the credibility and bias of the source",
        "Connect findings to current research trends",
        "Create annotated bibliography for related sources"
      ],
      relatedTopics: [
        "Document Analysis Techniques",
        "Research Methodology",
        "Critical Thinking Skills",
        "Academic Writing Standards",
        "Source Evaluation Criteria"
      ],
      citationHelp: [
        "Use proper citation format for document type",
        "Include all necessary bibliographic information",
        "Distinguish between primary and secondary sources",
        "Consider the publication context and audience"
      ]
    };
  } catch (error) {
    console.error("Document analysis error:", error);
    throw new Error("Failed to analyze document. Please try again.");
  }
}

private buildDocumentAnalysisPrompt(
  content: string, 
  filename: string, 
  mimeType: string, 
  mode: AIMode
): string {
  const basePrompt = `Analyze this document comprehensively for academic and research purposes:

DOCUMENT INFORMATION:
- Filename: ${filename}
- Type: ${mimeType}
- Content Length: ${content.length} characters

DOCUMENT CONTENT:
${content.slice(0, 12000)}${content.length > 12000 ? '...[TRUNCATED]' : ''}

ANALYSIS REQUIREMENTS:`;

  const analysisRequirements = {
    research_assistant: `
1. DOCUMENT CLASSIFICATION & CONTEXT
 - Identify document type and academic field
 - Determine publication context and intended audience
 - Assess credibility and authority of source

2. CONTENT ANALYSIS
 - Extract main thesis/research question
 - Identify key arguments and supporting evidence
 - Analyze methodology (if applicable)
 - Evaluate logical structure and coherence

3. CRITICAL EVALUATION
 - Assess strengths and limitations of arguments
 - Identify potential biases or gaps
 - Evaluate quality and relevance of evidence
 - Consider alternative perspectives or counterarguments

4. RESEARCH INTEGRATION
 - Suggest related research areas and sources
 - Identify citation opportunities
 - Recommend follow-up research questions
 - Connect to broader academic discourse

5. PRACTICAL APPLICATION
 - Outline key takeaways for students/researchers
 - Suggest ways to apply findings
 - Identify implications for practice or policy
 - Recommend further reading`,

    academic_writer: `
1. LEARNING OBJECTIVES
 - Identify key concepts and learning outcomes
 - Break down complex ideas into manageable parts
 - Create hierarchical understanding structure

2. STUDY MATERIALS CREATION
 - Generate comprehensive study guide
 - Extract and define key terminology
 - Create practice questions and assessments
 - Develop concept maps and visual aids

3. PEDAGOGICAL SUPPORT
 - Suggest multiple learning approaches
 - Provide examples and analogies
 - Create memory aids and mnemonics
 - Design active learning activities

4. ACADEMIC WRITING ASSISTANCE
 - Identify proper citation requirements
 - Suggest paragraph structure and organization
 - Provide transition phrases and academic language
 - Offer revision and editing guidance

5. ASSESSMENT PREPARATION
 - Create potential exam questions
 - Design essay prompts and rubrics
 - Suggest group discussion topics
 - Develop presentation guidelines`,

    expert: `Provide expert-level analysis with deep insights, methodological critique, and professional recommendations for advanced users.`,

    heavy: `Conduct the most comprehensive analysis possible, covering all aspects from multiple expert perspectives including content analysis, methodological evaluation, historical context, and future implications.`
  };

  return basePrompt + (analysisRequirements[mode as keyof typeof analysisRequirements] || analysisRequirements.expert);
}

// Research paper analysis for students
async analyzeResearchPaper(
  content: string,
  researchField: ResearchField = "general"
): Promise<EnhancedResponse> {
  const response = await this.analyzeDocument(content, "research_paper.pdf", "application/pdf", "research_assistant");
  
  // Add field-specific insights
  if (response.researchInsights) {
    response.researchInsights.practicalApplications.push(
      ...this.getFieldSpecificApplications(researchField)
    );
  }

  return response;
}

private getFieldSpecificApplications(field: ResearchField): string[] {
  const applications: Record<ResearchField, string[]> = {
    computer_science: ["Software development practices", "Algorithm optimization", "System design patterns"],
    medicine: ["Clinical practice guidelines", "Treatment protocols", "Patient care improvements"],
    psychology: ["Therapeutic interventions", "Behavioral assessments", "Counseling techniques"],
    business: ["Strategic planning", "Marketing strategies", "Operational improvements"],
    education: ["Curriculum development", "Teaching methodologies", "Assessment strategies"],
    general: ["Policy development", "Best practices", "Implementation strategies"]
  };

  return applications[field] || applications.general;
}
}

export const enhancedOpenAIService = new EnhancedOpenAIService();