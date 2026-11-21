import React, { useMemo, useRef, useState } from 'react';
import { AlertCircle, RotateCcw, Send, MessageSquareText } from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import type { ChatMessage } from '../types';
import { formatINR } from '../utils/campusLogic';

const STARTER_PROMPTS = [
  'Suggest Bhilai PGs under ₹7,000 near BIT Durg or Smriti Nagar',
  'What should I check before paying a PG deposit in Bhilai?',
  'Which hackathons and internships have upcoming deadlines?',
  'Where can I find quiet study libraries and thesis printing near Junwani?',
];

export const AssistantPage: React.FC = () => {
  const { accommodations, opportunities, localServices, myPreferences } = useCampus();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am the EzeCampus AI Assistant for Bhilai students. Ask me to compare PGs and hostels, explain roommate compatibility factors, recommend upcoming hackathons or internships, or locate nearby messes, libraries, and printing shops.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const campusContext = useMemo(() => {
    const stayLines = accommodations
      .slice(0, 6)
      .map((a) => `- ${a.title} (${a.locality}, ${a.roomType}, ${a.genderPreference}, ${formatINR(a.rent)}/mo, Demo)`)
      .join('\n');
    const oppLines = opportunities
      .slice(0, 5)
      .map((o) => `- ${o.title} (${o.category}, Deadline: ${o.deadline}, ${o.reward}, Demo)`)
      .join('\n');
    const srvLines = localServices
      .slice(0, 5)
      .map((s) => `- ${s.name} (${s.category}, ${s.locality}, ${s.priceRange}, Demo)`)
      .join('\n');
    return `Student budget target: ${formatINR(myPreferences.budgetMax)}/mo.\nSample Bhilai Accommodations:\n${stayLines}\nSample Opportunities:\n${oppLines}\nSample Services:\n${srvLines}`;
  }, [accommodations, opportunities, localServices, myPreferences.budgetMax]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: nowLabel,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: nextHistory
            .filter((m) => !m.error && m.id !== 'welcome')
            .slice(-8)
            .map((m) => ({ role: m.role, content: m.content })),
          campusContext,
        }),
      });

      const payload = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok || !payload.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content:
              payload.error ||
              'Unable to get a response from the AI assistant right now. Please try again.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            error: true,
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: payload.reply!,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content:
            'Network error while connecting to the EzeCampus AI server. Please check your connection and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
      window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          'Conversation cleared. Ask me anything about Bhilai accommodations, roommate matching, student marketplace listings, or campus opportunities.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Campus Assistant
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Powered by server-side Gemini API with Bhilai housing, opportunity, and local service context.
          </p>
        </div>

        <button
          type="button"
          onClick={resetChat}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          New Chat
        </button>
      </div>

      {/* Starter prompts */}
      <div className="flex flex-wrap gap-2">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={loading}
            onClick={() => void sendMessage(prompt)}
            className="text-left px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-xs text-slate-700 dark:text-slate-300 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Viewport */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col min-h-[460px] max-h-[62vh]">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-700 text-white'
                      : msg.error
                        ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {msg.error && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Assistant Notice
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <p
                    className={`mt-1.5 text-[10px] font-mono tabular-nums ${
                      isUser ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-xl px-4 py-3 bg-slate-100 dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <MessageSquareText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Thinking through Bhilai campus options...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage(input);
          }}
          className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
        >
          <label htmlFor="assistant-input" className="sr-only">
            Ask EzeCampus AI Assistant
          </label>
          <input
            id="assistant-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about PGs in Smriti Nagar, roommate matching, internships, or study cafes..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </section>
    </div>
  );
};
