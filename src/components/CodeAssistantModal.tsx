import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, X, Bot, User } from 'lucide-react';
import { MarkdownView } from './MarkdownView';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface CodeAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
  language: string;
}

export const CodeAssistantModal: React.FC<CodeAssistantModalProps> = ({
  isOpen,
  onClose,
  currentCode,
  language,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Hei! Jeg er din norske kode-assistent. Still meg gjerne spørsmål om denne koden, be om endringer, eller få forklart spesifikke deler!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userQuestion = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userQuestion }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ask-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQuestion,
          currentCode,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error('Kunne ikke hente svar fra assistenten.');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `⚠️ Beklager, det oppstod en feil: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'Hvordan kan jeg legge til tester for denne koden?',
    'Er det noen sikkerhetsutfordringer her?',
    'Hvordan deployer jeg denne koden til produksjon?',
    'Optimaliser denne koden for bedre hastighet',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl h-[650px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">KodeMester Norsk Assistent</h3>
              <p className="text-xs text-zinc-400">Still spørsmål eller be om utvidelser på norsk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message list */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 rounded-tl-xs'
                }`}
              >
                {m.role === 'assistant' ? (
                  <MarkdownView content={m.text} />
                ) : (
                  <p className="whitespace-pre-wrap">{m.text}</p>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-1">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-indigo-400 text-xs italic pl-10">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Tenker og analyserer koden...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-zinc-950/40 border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(q);
              }}
              className="text-[11px] text-zinc-400 hover:text-indigo-300 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Still et spørsmål om koden..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
