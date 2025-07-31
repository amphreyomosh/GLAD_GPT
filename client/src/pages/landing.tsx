import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Sparkles, Shield, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-grok-dark text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-grok-blue rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold">Grok</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/api/login'}
              className="text-gray-300 hover:text-white"
            >
              Sign in
            </Button>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-grok-blue hover:bg-blue-600"
            >
              Sign up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-grok-blue rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Bot className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            What do you want to know?
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Grok is your AI assistant that helps with coding, analysis, creative writing, and more. 
            Get intelligent responses with real-time information and file analysis capabilities.
          </p>

          <div className="flex items-center justify-center space-x-4 mb-12">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              className="bg-grok-blue hover:bg-blue-600 text-white px-8 py-3 text-lg"
            >
              Get Started
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-grok-sidebar border-gray-700">
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-grok-blue mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Multiple AI Modes</h3>
                <p className="text-gray-400">
                  Choose from Fast, Auto, Expert, or Heavy modes to match your needs.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-grok-sidebar border-gray-700">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-12 h-12 text-grok-blue mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">File Analysis</h3>
                <p className="text-gray-400">
                  Upload documents, images, and code files for intelligent analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-grok-sidebar border-gray-700">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-grok-blue mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Privacy Controls</h3>
                <p className="text-gray-400">
                  Private chat mode and data controls to keep your conversations secure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center text-sm text-gray-500">
            By using Grok, you agree to our{" "}
            <a href="#" className="text-grok-blue hover:underline mx-1">Terms</a>
            {" "}and{" "}
            <a href="#" className="text-grok-blue hover:underline ml-1">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
