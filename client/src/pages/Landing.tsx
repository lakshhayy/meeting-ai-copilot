import { SignInButton, useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Mic, Chrome, Zap, BrainCircuit } from "lucide-react";

export default function Landing() {
  const { isSignedIn, isLoaded } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-black text-slate-50 flex flex-col selection:bg-white/20">
      {/* Dynamic Futuristic Background - Monochrome Edition */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-slate-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-500/10 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-slate-400/5 blur-[100px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
        {/* Minimal Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <nav className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <Bot className="w-6 h-6" />
            <span className="font-display font-bold text-xl tracking-tight text-white">Co-pilot</span>
          </div>
          <SignInButton mode="modal">
            <Button variant="ghost" className="font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors">Sign In</Button>
          </SignInButton>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center pt-20 pb-24">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8 backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <Sparkles className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300">The next generation of meeting intelligence</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight max-w-5xl mb-8 leading-[1.1]">
          Your AI Co-pilot for <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-400 to-slate-500 drop-shadow-sm">
            Limitless Meetings
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mb-12 leading-relaxed font-light">
          Upload recordings, get instant neural-powered summaries, track action items, and chat with your entire meeting history via our <span className="text-slate-200 font-medium border-b border-slate-500/50">new Chrome Extension</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-24">
          <SignInButton mode="modal">
            <Button size="lg" className="h-14 px-8 text-lg font-medium shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] bg-white hover:bg-slate-200 text-black transition-all rounded-full border border-white/50">
              Get Started for Free
            </Button>
          </SignInButton>
          <a href="#features" className="inline-flex items-center justify-center h-14 px-8 text-lg font-medium rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-slate-300 backdrop-blur-sm">
            Explore Features
          </a>
        </div>

        <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full text-left">
          
          {/* Card 1 */}
          <div className="group p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 hover:bg-[#111] hover:border-slate-500/50 transition-all duration-300 backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-slate-300 mb-4 ring-1 ring-white/20">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2 text-slate-100">Record & Upload</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Seamlessly import your meeting audio or video. We handle the heavy lifting of processing and deep transcription.</p>
          </div>

          {/* Card 2 */}
          <div className="group p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 hover:bg-[#111] hover:border-slate-500/50 transition-all duration-300 backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-slate-300 mb-4 ring-1 ring-white/20">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2 text-slate-100">Smart Summaries</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Get instant, highly accurate meeting minutes and automatically extracted action items assigned to your team.</p>
          </div>

          {/* Card 3 */}
          <div className="group p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 hover:bg-[#111] hover:border-slate-500/50 transition-all duration-300 backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-slate-300 mb-4 ring-1 ring-white/20">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2 text-slate-100">Chat with Context</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Ask questions about past decisions, discussions, or action items. It's like having perfect memory.</p>
          </div>

          {/* Card 4 - Chrome Extension */}
          <div className="group p-6 rounded-2xl bg-gradient-to-b from-white/10 to-[#0a0a0a] border border-slate-500/30 hover:border-slate-400 transition-all duration-300 backdrop-blur-md relative overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <div className="absolute top-0 right-0 px-2 py-1 bg-white/10 text-slate-200 text-[10px] font-bold tracking-wider uppercase rounded-bl-lg border-b border-l border-white/20">New Feature</div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-slate-200 mb-4 ring-1 ring-white/30 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              <Chrome className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2 text-slate-100">Browser Extension</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Record directly from Google Meet, Zoom web, and Teams. Inject AI insights seamlessly into your browser workflow.</p>
          </div>

        </div>
      </main>
    </div>
  );
}
