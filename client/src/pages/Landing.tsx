import { SignInButton, useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Mic, FileText } from "lucide-react";

export default function Landing() {
  const { isSignedIn, isLoaded } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Bot className="w-6 h-6" />
            <span className="font-display font-bold text-xl tracking-tight">Co-pilot</span>
          </div>
          <SignInButton mode="modal">
            <Button variant="ghost" className="font-medium">Sign In</Button>
          </SignInButton>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>The new standard for productive meetings</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground max-w-4xl mb-6 leading-[1.1]">
          Your AI Co-pilot for <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
            Better Meetings
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Upload recordings, get instant AI-generated summaries, track action items, and chat with your entire meeting history using natural language.
        </p>

        <SignInButton mode="modal">
          <Button size="lg" className="h-14 px-8 text-lg font-medium shadow-lg hover:shadow-xl transition-all">
            Get Started for Free
          </Button>
        </SignInButton>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
          <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">Record & Upload</h3>
            <p className="text-muted-foreground">Seamlessly import your meeting audio or video. We handle the heavy lifting of processing and transcription.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">Smart Summaries</h3>
            <p className="text-muted-foreground">Get instant, highly accurate meeting minutes and automatically extracted action items assigned to your team.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">Chat with Context</h3>
            <p className="text-muted-foreground">Ask questions about past decisions, discussions, or action items. It's like having perfect memory.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
