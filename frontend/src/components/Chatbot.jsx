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
      <h2 className="text-2xl font-bold text-slate-950">Eco AI Coach</h2>
      <p className="mt-1 text-sm text-slate-600">Personalized carbon advice based on your logged activities.</p>

      <div className="mt-5 flex-grow overflow-y-auto rounded-lg border border-slate-200 bg-white p-4" aria-live="polite">
        <div className="flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div key={`${msg.role}-${idx}`} className={`flex max-w-[88%] gap-3 ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md ${msg.role === 'user' ? 'bg-blue-700 text-white' : 'bg-emerald-700 text-white'}`}>
                {msg.role === 'user' ? <User className="h-5 w-5" aria-hidden="true" /> : <Bot className="h-5 w-5" aria-hidden="true" />}
              </div>
              <div className={`rounded-lg p-3 text-sm leading-6 ${msg.role === 'user' ? 'bg-blue-700 text-white' : 'border border-slate-200 bg-slate-50 text-slate-800'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex max-w-[88%] gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-emerald-700 text-white">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm italic text-slate-500">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <label htmlFor="chat-message" className="sr-only">Message Eco AI Coach</label>
        <input
          id="chat-message"
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask for a focused reduction plan..."
          className="min-w-0 flex-grow rounded-md border border-slate-300 p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="flex min-h-12 w-12 items-center justify-center rounded-md bg-emerald-700 text-white transition-colors hover:bg-emerald-800 disabled:bg-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          <Send className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

export default Chatbot;
