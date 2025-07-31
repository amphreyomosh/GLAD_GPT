import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || process.env.API_KEY
});

export type AIMode = "fast" | "auto" | "expert" | "heavy";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface FileAnalysis {
  filename: string;
  content: string;
  mimeType: string;
}

export class OpenAIService {
  // List of models to try in order of preference
  private getModelsToTry(mode: AIMode): string[] {
    switch (mode) {
      case "fast":
        return ["gpt-4o-mini", "gpt-3.5-turbo", "gpt-3.5-turbo-0125", "gpt-4", "gpt-4-turbo-preview"];
      case "auto":
      case "expert":
      case "heavy":
        return ["gpt-4o", "gpt-4", "gpt-4-turbo-preview", "gpt-3.5-turbo", "gpt-3.5-turbo-0125"];
      default:
        return ["gpt-4o-mini", "gpt-3.5-turbo", "gpt-3.5-turbo-0125", "gpt-4", "gpt-4-turbo-preview"];
    }
  }

  private getSystemPrompt(mode: AIMode): string {
    const basePrompt = "You are Grok, a helpful AI assistant created by xAI. You are witty, informative, and engaging. Always provide accurate and helpful responses.";
    
    switch (mode) {
      case "fast":
        return `${basePrompt} Provide quick, concise responses.`;
      case "auto":
        return `${basePrompt} Automatically choose the best approach for each query.`;
      case "expert":
        return `${basePrompt} Think carefully and provide detailed, expert-level responses with thorough analysis.`;
      case "heavy":
        return `${basePrompt} Use your full capabilities as a team of experts. Provide comprehensive, multi-faceted analysis with detailed explanations.`;
      default:
        return basePrompt;
    }
  }

  async generateResponse(
    messages: ChatMessage[],
    mode: AIMode = "fast",
    fileAnalyses?: FileAnalysis[]
  ): Promise<string> {
    const modelsToTry = this.getModelsToTry(mode);
    const systemPrompt = this.getSystemPrompt(mode);

    // Prepare messages with system prompt
    const conversationMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    // Add file analysis context if provided
    if (fileAnalyses && fileAnalyses.length > 0) {
      const fileContext = fileAnalyses.map(file => 
        `File: ${file.filename} (${file.mimeType})\nContent: ${file.content.slice(0, 2000)}...`
      ).join("\n\n");
      
      conversationMessages.splice(1, 0, {
        role: "system",
        content: `You have access to the following uploaded files:\n\n${fileContext}\n\nUse this information to provide more accurate and contextual responses.`
      });
    }

    // Try models in order until one works
    for (const model of modelsToTry) {
      try {
        console.log(`Attempting to use model: ${model}`);
        
        const response = await openai.chat.completions.create({
          model,
          messages: conversationMessages,
          temperature: mode === "fast" ? 0.7 : mode === "heavy" ? 0.3 : 0.5,
          max_tokens: mode === "heavy" ? 4000 : mode === "fast" ? 1000 : 2000,
        });

        console.log(`Successfully used model: ${model}`);
        return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
      } catch (error: any) {
        console.log(`Model ${model} failed:`, error.message);
        
        // If this is not a model access error, throw it
        if (!error.message?.includes('does not have access to model') && !error.code?.includes('model_not_found')) {
          console.error("OpenAI API error:", error);
          throw new Error("Failed to generate AI response. Please check your API key and try again.");
        }
        
        // Continue to try the next model
        continue;
      }
    }
    
    // If all models failed
    throw new Error("No available AI models found. Please check your OpenAI API key permissions.");
  }

  async analyzeImage(base64Image: string, prompt?: string): Promise<string> {
    const visionModels = ["gpt-4o", "gpt-4-vision-preview", "gpt-4-turbo"];
    
    for (const model of visionModels) {
      try {
        console.log(`Attempting image analysis with model: ${model}`);
        
        const response = await openai.chat.completions.create({
          model,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt || "Analyze this image in detail and describe its key elements, context, and any notable aspects."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ],
            },
          ],
          max_tokens: 1000,
        });

        console.log(`Successfully analyzed image with model: ${model}`);
        return response.choices[0].message.content || "I couldn't analyze this image. Please try again.";
      } catch (error: any) {
        console.log(`Image analysis model ${model} failed:`, error.message);
        
        if (!error.message?.includes('does not have access to model') && !error.code?.includes('model_not_found')) {
          console.error("Image analysis error:", error);
          throw new Error("Failed to analyze image. Please try again.");
        }
        
        continue;
      }
    }
    
    throw new Error("No vision models available for image analysis. Please check your OpenAI API key permissions.");
  }

  async analyzeDocument(content: string, filename: string, mimeType: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert document analyzer. Provide a comprehensive analysis of the uploaded document."
          },
          {
            role: "user",
            content: `Please analyze this document:
            
Filename: ${filename}
Type: ${mimeType}
Content: ${content.slice(0, 8000)}...

Provide a summary, key points, and any relevant insights.`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      return response.choices[0].message.content || "I couldn't analyze this document. Please try again.";
    } catch (error) {
      console.error("Document analysis error:", error);
      throw new Error("Failed to analyze document. Please try again.");
    }
  }
}

export const openaiService = new OpenAIService();
