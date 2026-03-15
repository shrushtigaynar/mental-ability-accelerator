import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendAIChatMessage, getRecommendations } from "../api/practice.js";
import { getToken, getUser } from "../utils/auth.js";
import Sidebar from "../components/Sidebar";

function getDifficultyBadgeClasses(level) {
  const normalized = String(level || "").toLowerCase();

  if (normalized === "easy") {
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
  }

  if (normalized === "medium") {
    return "bg-amber-500/20 text-amber-300 border-amber-500/50";
  }

  if (normalized === "hard") {
    return "bg-rose-500/20 text-rose-300 border-rose-500/50";
  }

  return "bg-slate-700/40 text-slate-200 border-slate-600";
}

function normalizeOptions(rawOptions) {
  if (!rawOptions) return [];
  if (Array.isArray(rawOptions)) return rawOptions.slice(0, 4);

  if (typeof rawOptions === "object") {
    const asArray = [rawOptions.A, rawOptions.B, rawOptions.C, rawOptions.D];
    return asArray.filter((v) => v !== undefined).slice(0, 4);
  }

  return [];
}

export default function Recommendations() {
  const navigate = useNavigate();
  const token = useMemo(() => getToken(), []);
  const user = useMemo(() => getUser(), []);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const chatContainerRef = useRef(null);
  
  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  // Load recommendations on mount
  useEffect(() => {
    if (!token || !user?.id) return;
    
    loadRecommendations();
  }, [token, user?.id]);

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const loadRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      const data = await getRecommendations(token, user.id);
      setRecommendations(Array.isArray(data) ? data : data?.recommendations || []);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoadingChat) return;
    
    const userMessage = currentMessage.trim();
    setCurrentMessage("");
    setIsLoadingChat(true);
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    
    try {
      const response = await sendAIChatMessage(token, user.id, userMessage);
      const aiResponse = response.response || response.message || "I'm here to help! Try asking about specific aptitude topics.";
      
      // Add AI response to chat
      setChatMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setChatMessages(prev => [...prev, { 
        type: 'ai', 
        text: "I'm having trouble connecting right now. Please try again or ask me about specific aptitude topics like number series, logical reasoning, or blood relations." 
      }]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleQuestionExpansion = (questionId) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="mx-auto max-w-5xl space-y-8">
          
          {/* AI Study Assistant Chat */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.8)] backdrop-blur">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                AI Study Assistant
              </h1>
              <p className="mt-2 text-xs text-slate-400 sm:text-sm">
                Ask me how to study any topic
              </p>
            </div>
            
            {/* Chat History */}
            <div 
              ref={chatContainerRef}
              className="mb-4 h-96 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4"
            >
              {chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400 text-center">
                    Ask me anything about aptitude preparation!<br />
                    <span className="text-sm">e.g., How do I improve in Blood Relations?</span>
                  </p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
              
              {/* Typing Indicator */}
              {isLoadingChat && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 rounded-2xl px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask e.g. How do I improve in Blood Relations?"
                className="flex-1 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-400 transition focus:border-sky-500 focus:outline-none"
                disabled={isLoadingChat}
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={isLoadingChat || !currentMessage.trim()}
                className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </section>

          {/* Recommended Practice Questions */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.8)] backdrop-blur">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">
                Recommended Practice Questions
              </h2>
              <p className="mt-2 text-xs text-slate-400 sm:text-sm">
                Based on your weak topics
              </p>
            </div>
            
            {loadingRecommendations ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800/80 mb-2"></div>
                    <div className="h-3 w-1/2 animate-pulse rounded bg-slate-800/80"></div>
                  </div>
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
                <p className="text-slate-400">
                  Complete a training session to get personalized recommendations
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((question, idx) => {
                  const options = normalizeOptions(question.options);
                  const isExpanded = expandedQuestions.has(question.id || idx);
                  
                  return (
                    <div key={question.id || idx} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-slate-100 mb-3">
                            {question.question_text || "Question text unavailable"}
                          </p>
                          
                          <div className="flex gap-2 mb-3">
                            {question.topic && (
                              <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-300">
                                {question.topic}
                              </span>
                            )}
                            {question.difficulty && (
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getDifficultyBadgeClasses(question.difficulty)}`}>
                                {question.difficulty}
                              </span>
                            )}
                          </div>
                          
                          {isExpanded && options.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {options.map((option, optIdx) => (
                                <div
                                  key={optIdx}
                                  className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-300"
                                >
                                  <span className="mr-2 text-xs font-semibold text-slate-400">
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  {String(option)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => toggleQuestionExpansion(question.id || idx)}
                          className="rounded-full border border-slate-700 bg-slate-800/60 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-700"
                        >
                          {isExpanded ? 'Hide' : 'Practice'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

