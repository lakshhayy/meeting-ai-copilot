import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";

export function MeetingChat({ meetingId }: { meetingId: string }) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hello! I'm your AI Meeting Assistant. Ask me anything about what was discussed, and I will strictly answer using the transcript." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setIsLoading(true);

    try {
      const token = await getToken();
      const response = await fetch(`/api/chat/${meetingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: "ai", text: data.text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "ai", text: "Sorry, I had trouble retrieving the context. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border/80 rounded-xl shadow-lg flex flex-col h-[500px]">
      <div className="p-4 border-b border-border/60 font-semibold flex items-center bg-gradient-to-r from-primary/10 to-transparent rounded-t-xl">
        <Bot className="w-5 h-5 mr-3 text-primary" />
        Chat with Meeting
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted/70 border border-border/50 text-foreground rounded-tl-sm'}`}>
              <div className="flex items-start">
                <div className="mr-3 mt-0.5 opacity-80 flex-shrink-0">
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl p-4 bg-muted/70 border border-border/50 text-muted-foreground flex items-center rounded-tl-sm">
               <Loader2 className="w-4 h-4 mr-3 animate-spin text-primary" /> Searching transcript & thinking...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border/60 bg-muted/10 rounded-b-xl">
        <form onSubmit={sendMessage} className="flex items-center gap-3">
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="E.g. What was decided about the Q3 budget?" 
            className="flex-1 bg-background border-border/60 h-11"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" className="h-11 w-11 shadow-md" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4 text-white" />
          </Button>
        </form>
      </div>
    </div>
  );
}
