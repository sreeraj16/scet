import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bot, Send, Sparkles, Database, TrendingUp, CheckCircle } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'assistant';
  response: string;
  database_facts?: string[];
  ml_predictions?: string[];
  recommendations?: string[];
}

export const AIOperationsAssistant: React.FC = () => {
  const { activeOrg } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      response: `Hello Commissioner. I am the WasteLoop AI Operations Assistant for ${activeOrg.name}. Ask me any operational query about waste generation, overflow risks, over-serviced routes, vehicle utilization, or recycling diversion.`,
      database_facts: [`Active Tenant: ${activeOrg.name}`, "Monthly Waste Processed: 48.5 Tons", "Landfill Diversion: 64.2%"],
      ml_predictions: ["Zone 4 IoT Overflow Risk: 84% probability within 6 hours"],
      recommendations: ["Prioritize Vehicle AP-37-T-4912 dispatch to Zone 4 Commercial Hub."]
    }
  ]);

  const presetQuestions = [
    "Which locations are likely to overflow tomorrow?",
    "Which locations may be receiving unnecessary collection?",
    "Which zone generated the most waste this month?",
    "What is our landfill diversion rate?"
  ];

  const handleAsk = (userText: string) => {
    if (!userText.trim()) return;
    const text = userText;
    setQuery('');
    setLoading(true);

    const userMessage: ChatMessage = { sender: 'user', response: text };
    setChatHistory(prev => [...prev, userMessage]);

    setTimeout(() => {
      let botAnswer: ChatMessage;
      const q = text.toLowerCase();

      if (q.includes('overflow') || q.includes('tomorrow') || q.includes('risk')) {
        botAnswer = {
          sender: 'assistant',
          response: "Based on current IoT telemetry and fill rate velocity, Zone 4 Commercial Hub has 2 smart bins with an 84% probability of overflowing within 6 hours.",
          database_facts: ["Zone 4 current average fill level: 86%", "Last pickup: 18 hours ago"],
          ml_predictions: ["Overflow predicted by 16:30 today (84% confidence score)"],
          recommendations: ["Prioritize collection dispatch within 6 hours."]
        };
      } else if (q.includes('unnecessary') || q.includes('frequency') || q.includes('over-serviced')) {
        botAnswer = {
          sender: 'assistant',
          response: "Analysis shows Swarnandhra West Sector receives 7 pickups/week averaging only 3.2 kg per stop.",
          database_facts: ["Scheduled Frequency: 7 pickups/week", "Average weight collected: 3.2 kg/stop"],
          ml_predictions: ["Reducing frequency to 3 pickups/week maintains 100% SLA with zero overflow risk"],
          recommendations: ["Consider reducing collection frequency to 3 times/week to save ~35% transport fuel."]
        };
      } else {
        botAnswer = {
          sender: 'assistant',
          response: `${activeOrg.name} generated 48.5 tons of total waste this month, achieving a 64.2% landfill diversion rate with 31.1 tons coarsely separated and recovered.`,
          database_facts: ["Total Generation: 48.5 tons", "Recovered Dry Recyclables: 18.4 tons", "Composted Organic: 12.7 tons"],
          ml_predictions: ["Projected total next month generation: 51.2 tons (+5.5% seasonal variation)"],
          recommendations: ["Expand MRF plastic sorting shift capacity to reach 70% diversion target."]
        };
      }

      setChatHistory(prev => [...prev, botAnswer]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className={`p-6 rounded-3xl shadow-xl space-y-6 border ${
      isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
    }`}>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-purple-500/10 border border-emerald-200 dark:border-purple-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-emerald-700 dark:text-purple-400" />
          </div>
          <div>
            <h2 className={`text-xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>AI Operations Assistant</h2>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Natural language operational query engine with fact vs prediction breakdown</p>
          </div>
        </div>

        <span className="text-xs font-mono text-emerald-800 dark:text-purple-300 bg-emerald-100 dark:bg-purple-500/10 px-3 py-1 rounded-full border border-emerald-300 dark:border-purple-500/20 font-bold">
          ECO ENGINE ACTIVE
        </span>
      </div>

      {/* Preset Questions */}
      <div className="flex space-x-2 overflow-x-auto pb-1 text-xs">
        {presetQuestions.map((pq, idx) => (
          <button
            key={idx}
            onClick={() => handleAsk(pq)}
            className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition font-semibold ${
              isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            "{pq}"
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="space-y-4 max-h-[440px] overflow-y-auto pr-2">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex flex-col space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-4 rounded-3xl max-w-2xl text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-emerald-600 text-white rounded-br-none shadow-md font-bold'
                : isLight ? 'bg-slate-50 text-slate-900 border border-slate-200 rounded-bl-none shadow-sm space-y-3' : 'bg-slate-850 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-lg space-y-3'
            }`}>
              <p className="text-sm font-extrabold">{msg.response}</p>

              {msg.sender === 'assistant' && (
                <div className={`space-y-2.5 pt-2 border-t text-[11px] ${isLight ? 'border-slate-200' : 'border-slate-700/80'}`}>
                  
                  {/* Database Facts */}
                  {msg.database_facts && msg.database_facts.length > 0 && (
                    <div className={`p-2.5 rounded-xl border space-y-1 ${isLight ? 'bg-white border-emerald-200' : 'bg-slate-900/90 border-slate-700/60'}`}>
                      <span className="font-extrabold text-emerald-700 dark:text-cyan-400 flex items-center uppercase tracking-wider">
                        <Database className="w-3.5 h-3.5 mr-1" />
                        Database Facts
                      </span>
                      {msg.database_facts.map((fact, fIdx) => (
                        <div key={fIdx} className={isLight ? 'text-slate-700 pl-4 font-semibold' : 'text-slate-300 pl-4'}>• {fact}</div>
                      ))}
                    </div>
                  )}

                  {/* ML Predictions */}
                  {msg.ml_predictions && msg.ml_predictions.length > 0 && (
                    <div className={`p-2.5 rounded-xl border space-y-1 ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-900/90 border-purple-500/30'}`}>
                      <span className="font-extrabold text-emerald-800 dark:text-purple-400 flex items-center uppercase tracking-wider">
                        <TrendingUp className="w-3.5 h-3.5 mr-1" />
                        ML Predictions
                      </span>
                      {msg.ml_predictions.map((pred, pIdx) => (
                        <div key={pIdx} className={isLight ? 'text-emerald-900 pl-4 font-semibold' : 'text-purple-300 pl-4'}>• {pred}</div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className={`p-2.5 rounded-xl border space-y-1 ${isLight ? 'bg-emerald-100/60 border-emerald-300' : 'bg-slate-900/90 border-emerald-500/30'}`}>
                      <span className="font-extrabold text-emerald-900 dark:text-emerald-400 flex items-center uppercase tracking-wider">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Actionable Recommendations
                      </span>
                      {msg.recommendations.map((rec, rIdx) => (
                        <div key={rIdx} className={isLight ? 'text-emerald-950 pl-4 font-bold' : 'text-emerald-300 pl-4'}>• {rec}</div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-bold animate-pulse flex items-center space-x-2">
            <Sparkles className="w-4 h-4 animate-spin text-emerald-600" />
            <span>AI Assistant is analyzing database facts & ML predictions...</span>
          </div>
        )}
      </div>

      {/* Query Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleAsk(query); }} className="relative">
        <input
          type="text"
          placeholder="Ask AI Assistant (e.g., 'Which locations are likely to overflow tomorrow?')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`w-full border rounded-2xl pl-4 pr-12 py-3.5 text-sm font-semibold focus:outline-none focus:border-emerald-500 ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
          }`}
        />
        <button
          type="submit"
          className="absolute right-2 top-2 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition shadow-md shadow-emerald-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
