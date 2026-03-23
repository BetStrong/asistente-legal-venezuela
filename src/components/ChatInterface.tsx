import React, { useState, useRef, useEffect } from 'react';
import { Send, Scale, User, Bot, Info, FileText, Briefcase, Gavel, Users, ShoppingBag, Landmark, ChevronRight } from 'lucide-react';
import Markdown from 'react-markdown';
import { sendMessage } from '../services/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const TOPICS = [
  { name: 'Contratos', icon: <FileText className="w-4 h-4" /> },
  { name: 'Laboral', icon: <Briefcase className="w-4 h-4" /> },
  { name: 'Penal', icon: <Gavel className="w-4 h-4" /> },
  { name: 'Familiar', icon: <Users className="w-4 h-4" /> },
  { name: 'Mercantil', icon: <ShoppingBag className="w-4 h-4" /> },
  { name: 'Tributario', icon: <Landmark className="w-4 h-4" /> },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Saludos. Soy su asistente legal virtual especializado en la legislación venezolana. ¿En qué puedo asesorarle hoy? Por favor, recuerde que esta es una consulta informativa y no sustituye el consejo legal formal.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = textToSend.trim();

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await sendMessage(
        messages.concat({ role: 'user', content: userMessage })
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response || 'Lo siento, no pude procesar su solicitud.'
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Hubo un error al conectar con el servidor legal. Por favor, intente de nuevo.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen max-w-6xl mx-auto bg-[#F8F6F0] shadow-2xl overflow-hidden">
      <aside className="hidden md:flex flex-col w-64 bg-stone-900 text-stone-300 border-r border-stone-800">
        <div className="p-6 border-b border-stone-800">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">Temas Frecuentes</h2>
          <nav className="space-y-1">
            {TOPICS.map((topic) => (
              <button
                key={topic.name}
                onClick={() => handleSend(`Consulta sobre derecho ${topic.name.toLowerCase()}`)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-800 hover:text-white transition-colors text-sm group"
              >
                <span className="text-stone-500 group-hover:text-amber-400 transition-colors">
                  {topic.icon}
                </span>
                {topic.name}
                <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6 text-[10px] text-stone-500 leading-relaxed italic">
          "La justicia es la constante y perpetua voluntad de dar a cada uno su derecho."
          <br />— Ulpiano
        </div>
      </aside>

      <div className="flex-1 flex flex-col bg-transparent relative">
        <header className="p-6 bg-gradient-to-r from-[#001F3F] to-[#0074D9] text-white flex items-center justify-between shadow-lg z-10">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Scale className="w-8 h-8 text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif font-bold tracking-tight">Asistente Legal Venezuela</h1>
                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-tighter rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  En línea
                </span>
              </div>
              <p className="text-xs text-blue-100/60 uppercase tracking-widest font-medium">Consultoría Virtual Especializada</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-blue-100/60 italic">
            <Info className="w-4 h-4" />
            <span>Marco Legal Vigente 2026</span>
          </div>
        </header>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-8"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                  msg.role === 'user' ? "bg-stone-800 text-white" : "bg-white border border-stone-200 text-stone-800"
                )}>
                  {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6 text-[#001F3F]" />}
                </div>
                <div className={cn(
                  "p-5 rounded-2xl",
                  msg.role === 'user'
                    ? "bg-stone-800 text-white rounded-tr-none shadow-lg"
                    : "bg-white border-l-[3px] border-[#FFD700] text-stone-800 rounded-tl-none shadow-md"
                )}>
                  <div className="markdown-body prose prose-stone max-w-none">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 max-w-[85%] mr-auto"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 text-stone-800 flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-6 h-6 text-[#001F3F]" />
              </div>
              <div className="p-5 rounded-2xl bg-white border-l-[3px] border-[#FFD700] rounded-tl-none shadow-md flex items-center gap-3">
                <div className="flex gap-1">
                  <motion.span
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1, times: [0, 0.5, 1] }}
                    className="w-1.5 h-1.5 bg-[#FFD700] rounded-full"
                  />
                  <motion.span
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2, times: [0, 0.5, 1] }}
                    className="w-1.5 h-1.5 bg-[#FFD700] rounded-full"
                  />
                  <motion.span
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4, times: [0, 0.5, 1] }}
                    className="w-1.5 h-1.5 bg-[#FFD700] rounded-full"
                  />
                </div>
                <span className="text-sm text-stone-500 font-medium italic">El abogado está redactando su respuesta...</span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-6 bg-white/50 backdrop-blur-md border-t border-stone-200">
          <div className="relative flex items-center max-w-4xl mx-auto">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Escriba su consulta legal aquí..."
              className="w-full p-5 pr-16 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#FFD700] focus:border-transparent resize-none transition-all shadow-sm"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-3.5 bg-[#FFD700] text-[#001F3F] rounded-xl hover:bg-[#FFC800] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 flex flex-col items-center gap-1">
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">
              Jurisdicción: República Bolivariana de Venezuela
            </p>
            <p className="text-[10px] text-stone-400 max-w-lg text-center leading-tight">
              Este sistema utiliza Inteligencia Artificial para orientación informativa.
              Verifique siempre en Gaceta Oficial. No constituye una relación abogado-cliente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
