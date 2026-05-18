import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useChatWithAssistant, ChatMessage } from '@workspace/api-client-react';

const STARTER_QUESTIONS = [
  "الباراسيتامول والبروفين فرقهم إيه؟",
  "ممكن آخد مضاد حيوي من غير روشتة؟",
  "ايه علامات الحساسية من الدوا؟",
  "الدوا بعد أكله ولا قبله مهم؟"
];

function formatMessage(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-bold mt-2 mb-1">{line.slice(2, -2)}</p>;
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <div key={i} className="flex gap-2 items-start my-0.5">
          <span className="mt-1 shrink-0">•</span>
          <span>{line.slice(2)}</span>
        </div>
      );
    }
    if (line.trim() === '') return <div key={i} className="h-2" />;
    return <p key={i} className="leading-relaxed">{line}</p>;
  });
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: 'أهلاً! أنا فارما، صيدلانيك الآلي على منصة صحتي. اسألني عن أي دوا وأنا هساعدك.'
  }]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatMutation = useChatWithAssistant();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatMutation.isPending]);

  const handleSend = (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');

    chatMutation.mutate({
      data: { messages: newMessages }
    }, {
      onSuccess: (data) => {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      }
    });
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full h-[calc(100vh-64px)] md:h-[calc(100vh-130px)]">
        
        <div className="p-4 border-b bg-primary/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">فارما — الصيدلاني الآلي</h2>
            <p className="text-xs text-muted-foreground">بيجاوب على أسئلتك في الأدوية بالعامية المصرية</p>
          </div>
          <div className="mr-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">متاح</span>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6 pb-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[82%]`}>
                  <div className={`p-3.5 rounded-2xl text-sm md:text-base ${
                    msg.role === 'user' 
                      ? 'bg-muted text-foreground rounded-tr-sm' 
                      : 'bg-primary text-primary-foreground rounded-tl-sm'
                  }`}>
                    <div className="whitespace-pre-wrap leading-relaxed space-y-0.5">
                      {msg.role === 'assistant' ? formatMessage(msg.content) : msg.content}
                    </div>
                  </div>
                  {msg.role === 'assistant' && i === messages.length - 1 && (
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                      رد آلي — مش بديل عن الدكتور أو الصيدلاني
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex gap-3 flex-row">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-sm bg-primary/10 text-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm font-medium">فارما بيفكر...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-background border-t">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {STARTER_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs md:text-sm rounded-full transition-colors border border-border"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex gap-2 relative"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اسألني عن أي دوا..."
              className="h-12 pr-4 pl-12 rounded-full shadow-sm bg-muted/30 focus-visible:bg-background"
              disabled={chatMutation.isPending}
              dir="rtl"
            />
            <Button 
              type="submit" 
              size="icon"
              className="absolute left-1 top-1 h-10 w-10 rounded-full"
              disabled={!input.trim() || chatMutation.isPending}
            >
              <Send className="w-5 h-5 transform rotate-180 ml-1" />
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
