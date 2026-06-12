import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send } from 'lucide-react';
import api from '../api';

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi. I am EcoTrack AI. Ask about your score, monthly goal, or how to reduce transport, energy, diet, or waste emissions.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    const nextMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/chat', {
        message: userMessage,
        history: nextMessages.slice(-8).map((message) => ({
          role: message.role,
          content: message.content,
        })),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'I could not reach the EcoTrack API. Please try again after the server is available.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-150px)] min-h-[560px] flex-col">
      <h2 className="text-3xl font-bold text-white">Eco AI Coach</h2>
      <p className="mt-1 text-sm text-slate-400">Personalized carbon advice based on your logged activities.</p>

      <div className="mt-5 flex-grow overflow-y-auto rounded-3xl glass-panel border border-slate-700/50 p-6" aria-live="polite">
        <div className="flex flex-col gap-6">
          {messages.map((msg, idx) => (
            <div key={`${msg.role}-${idx}`} className={`flex max-w-[88%] gap-4 ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-lg ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'}`}>
                {msg.role === 'user' ? <User className="h-5 w-5" aria-hidden="true" /> : <Bot className="h-5 w-5" aria-hidden="true" />}
              </div>
              <div className={`rounded-2xl p-4 text-sm leading-6 shadow-md ${msg.role === 'user' ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-tr-sm' : 'glass-panel border border-slate-600/50 bg-slate-800/80 text-slate-200 rounded-tl-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex max-w-[88%] gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="rounded-2xl glass-panel border border-slate-600/50 bg-slate-800/80 p-4 text-sm italic text-slate-400 rounded-tl-sm">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSend} className="mt-6 flex gap-3">
        <label htmlFor="chat-message" className="sr-only">Message Eco AI Coach</label>
        <input
          id="chat-message"
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask for a focused reduction plan..."
          className="min-w-0 flex-grow rounded-xl border border-slate-600 bg-slate-800/50 p-4 text-white placeholder-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="flex min-h-12 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          <Send className="h-6 w-6" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

export default Chatbot;
