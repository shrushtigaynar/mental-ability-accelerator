import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function FocusSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { topic, minutes = 30, targetQuestions = 22 } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [sessionTime, setSessionTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [skipsLeft, setSkipsLeft] = useState(3);
  const [hintsLeft, setHintsLeft] = useState(2);
  const [showHint, setShowHint] = useState(false);
  const [motivationalMsg, setMotivationalMsg] = useState('');
  const [showMotivation, setShowMotivation] = useState(false);
  const [xp, setXp] = useState(0);

  const timerRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const questionTimerRef = useRef(null);
  const autoAdvancePending = useRef(false);
  const token = localStorage.getItem('maa_token');
  const user = JSON.parse(localStorage.getItem('maa_user') || '{}');

  const topicSlugMap = {
    'Percentages': 'speed',
    'Profit & Loss': 'speed',
    'Time & Work': 'speed',
    'Time, Speed & Distance': 'speed',
    'Ratio & Proportion': 'speed',
    'Number Series': 'deep-thinking',
    'Missing Number Pattern': 'deep-thinking',
    'Alphabet Series': 'deep-thinking',
    'Analogy': 'deep-thinking',
    'Odd One Out': 'deep-thinking',
    'Blood Relations': 'interview',
    'Coding-Decoding': 'interview',
    'Direction Sense': 'interview',
    'Syllogisms': 'interview',
    'Statement & Conclusion': 'interview',
  };

  const correctMessages = [
    '🔥 On fire!', '⚡ Lightning fast!', '🎯 Bullseye!',
    '💪 Crushing it!', '🚀 Superb!', '✨ Brilliant!',
    '🏆 Outstanding!', '💡 Smart thinking!'
  ];
  const wrongMessages = [
    '💡 Check the solution!', '📚 Learn from this!',
    '🔄 Almost there!', '👀 Read carefully next time!'
  ];

  useEffect(() => {
    if (!topic) { navigate('/dashboard'); return; }
    fetchQuestions();
    return () => {
      clearInterval(timerRef.current);
      clearInterval(sessionTimerRef.current);
      clearInterval(questionTimerRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup auto-advance timer on unmount
      if (autoAdvancePending.current) {
        clearTimeout(autoAdvancePending.current);
      }
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (sessionComplete) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    sessionTimerRef.current = setInterval(() => {
      setSessionTime(p => p + 1);
    }, 1000);

    questionTimerRef.current = setInterval(() => {
      setQuestionTimer(p => p + 1);
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(sessionTimerRef.current);
      clearInterval(questionTimerRef.current);
    };
  }, [loading]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isAnswered) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        goNext(false);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAnswered, currentIndex]);

  const fetchQuestions = async () => {
    try {
      const slug = topicSlugMap[topic] || 'speed';
      const topicParam = encodeURIComponent(topic.trim());
      const url = `http://localhost:4000/api/practice/modes/${slug}/questions?topic=${topicParam}&limit=50`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });

      let qs = [];
      if (Array.isArray(res.data)) {
        qs = res.data;
      } else if (res.data?.questions && Array.isArray(res.data.questions)) {
        qs = res.data.questions;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        qs = res.data.data;
      } else {
        const values = Object.values(res.data);
        const arr = values.find(v => Array.isArray(v));
        if (arr) qs = arr;
      }

      if (qs.length === 0) {
        const fallbackUrl = `http://localhost:4000/api/practice/modes/${slug}/questions?limit=50`;
        const fallbackRes = await axios.get(fallbackUrl, { headers: { Authorization: `Bearer ${token}` } });
        if (Array.isArray(fallbackRes.data)) qs = fallbackRes.data;
        else if (fallbackRes.data?.questions) qs = fallbackRes.data.questions;
      }

      setQuestions(qs.slice(0, targetQuestions + 5));
      setLoading(false);
    } catch (err) {
      console.error('fetchQuestions error:', err.response?.data || err.message);
      setLoading(false);
    }
  };

  const clearAllTimers = () => {
    clearInterval(timerRef.current);
    clearInterval(sessionTimerRef.current);
    clearInterval(questionTimerRef.current);
  };

  const handlePause = () => {
    if (isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearAllTimers(); handleSessionEnd(); return 0; }
          return prev - 1;
        });
      }, 1000);
      sessionTimerRef.current = setInterval(() => setSessionTime(p => p + 1), 1000);
      questionTimerRef.current = setInterval(() => setQuestionTimer(p => p + 1), 1000);
      setIsPaused(false);
    } else {
      clearAllTimers();
      setIsPaused(true);
    }
  };

  const handleAnswer = (optionIndex) => {
    if (isAnswered || isPaused) return;
    clearInterval(questionTimerRef.current);

    const q = questions[currentIndex];
    const selectedLetter = String.fromCharCode(65 + optionIndex);
    const correctLetter = (q?.correct_answer || q?.correct_option || '').toString().trim().toUpperCase();
    const isCorrect = selectedLetter === correctLetter;

    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const earnedXp = isCorrect ? Math.max(10, 30 - Math.floor(questionTimer / 3)) : 0;
    setXp(p => p + earnedXp);

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
    } else {
      setStreak(0);
    }

    const msg = isCorrect
      ? correctMessages[Math.floor(Math.random() * correctMessages.length)]
      : wrongMessages[Math.floor(Math.random() * wrongMessages.length)];
    setMotivationalMsg(msg);
    setShowMotivation(true);
    setTimeout(() => setShowMotivation(false), 2000);

    setAnswers(prev => [...prev, {
      questionId: q?.id,
      selectedOption: selectedLetter,
      is_correct: isCorrect,
      timeSpent: questionTimer,
      timeTakenSeconds: questionTimer,
      confidenceLevel: null,
      attemptType: 'focus'
    }]);

    // Auto advance after 800ms if user hasn't manually advanced
    autoAdvancePending.current = true;
    setTimeout(() => {
      if (autoAdvancePending.current) {
        goNext(false);
      }
    }, 800);
  };

  const handleSkip = () => {
    if (skipsLeft <= 0 || isAnswered) return;
    setSkipsLeft(p => p - 1);
    setAnswers(prev => [...prev, {
      questionId: questions[currentIndex]?.id,
      selectedOption: 'X',
      is_correct: false,
      timeSpent: questionTimer,
      timeTakenSeconds: questionTimer,
      attemptType: 'skip'
    }]);
    setStreak(0);
    goNext(true);
  };

  const handleHint = () => {
    if (hintsLeft <= 0 || isAnswered) return;
    setHintsLeft(p => p - 1);
    setShowHint(true);
    setTimeLeft(p => Math.max(0, p - 30));
  };

  const goNext = (skipped = false) => {
    autoAdvancePending.current = false;
    if (!skipped && currentIndex + 1 >= questions.length) {
      handleSessionEnd();
      return;
    }
    setCurrentIndex(p => p + 1);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setQuestionTimer(0);
    clearInterval(questionTimerRef.current);
    questionTimerRef.current = setInterval(() => setQuestionTimer(p => p + 1), 1000);
  };

  const handleSessionEnd = async () => {
    clearAllTimers();
    setSessionComplete(true);
    if (answers.length === 0) return;
    try {
      const slug = topicSlugMap[topic] || 'speed';
      const validAnswers = answers
        .filter(a => a.attemptType !== 'skip')
        .map(a => ({
          questionId: a.questionId,
          selectedOption: a.selectedOption,
          timeSpent: a.timeSpent || 0,
          timeTakenSeconds: a.timeTakenSeconds || 0,
          confidenceLevel: null,
          attemptType: 'focus'
        }));
      if (validAnswers.length === 0) return;
      await axios.post(
        'http://localhost:4000/api/tests/diagnostic/submit',
        { userId: user?.id || user?.user_id || 4, mode: slug, answers: validAnswers, totalTime: sessionTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Submit failed:', err.response?.data || err.message);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const correctCount = answers.filter(a => a.is_correct).length;
  const skippedCount = answers.filter(a => a.attemptType === 'skip').length;
  const accuracy = answers.filter(a => a.attemptType !== 'skip').length > 0
    ? Math.round((correctCount / answers.filter(a => a.attemptType !== 'skip').length) * 100)
    : 0;
  const timePercent = Math.round((timeLeft / (minutes * 60)) * 100);
  const progressPercent = Math.round((currentIndex / Math.max(questions.length, 1)) * 100);

  const q = questions[currentIndex];
  const options = q?.options
    ? Object.values(q.options)
    : [q?.option_a, q?.option_b, q?.option_c, q?.option_d].filter(Boolean);
  const correctLetter = (q?.correct_answer || q?.correct_option || '').toString().trim().toUpperCase();
  const correctIndex = correctLetter.charCodeAt(0) - 65;

  const getOptionStyle = (idx) => {
    if (!isAnswered) return 'border-slate-700 bg-slate-800/60 hover:border-cyan-500 hover:bg-slate-700 cursor-pointer';
    if (idx === correctIndex) return 'border-green-500 bg-green-900/30 text-green-200';
    if (idx === selectedOption && idx !== correctIndex) return 'border-red-500 bg-red-900/30 text-red-200';
    return 'border-slate-700 bg-slate-800/30 opacity-40';
  };

  // ── LOADING ──
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-5xl animate-bounce">🧠</div>
        <p className="text-white text-xl font-bold">Preparing Focus Session</p>
        <p className="text-slate-400">{topic} · {minutes} minutes · ~{targetQuestions} questions</p>
        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );

  // ── NO QUESTIONS ──
  if (!loading && questions.length === 0) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white p-8">
      <div className="text-center space-y-4 max-w-md">
        <p className="text-5xl">😕</p>
        <h2 className="text-2xl font-bold">No Questions Found</h2>
        <p className="text-slate-400">Could not load questions for <strong>{topic}</strong>.</p>
        <div className="flex gap-3 justify-center mt-6">
          <button onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-xl border border-slate-600 hover:border-slate-400 transition text-sm">
            Back to Dashboard
          </button>
          <button onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 transition text-sm font-semibold">
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  // ── SESSION COMPLETE ──
  if (sessionComplete) {
    const avgTimePerQ = answers.length > 0 ? Math.round(sessionTime / answers.length) : 0;
    const grade = accuracy >= 80 ? 'A' : accuracy >= 60 ? 'B' : accuracy >= 40 ? 'C' : 'D';
    const gradeColor = accuracy >= 80 ? 'text-green-400' : accuracy >= 60 ? 'text-yellow-400' : accuracy >= 40 ? 'text-orange-400' : 'text-red-400';

    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">
              {accuracy >= 80 ? '🏆' : accuracy >= 60 ? '🎯' : accuracy >= 40 ? '📈' : '💪'}
            </div>
            <h1 className="text-3xl font-bold">Session Complete!</h1>
            <p className="text-slate-400 mt-1">{topic} · {formatTime(sessionTime)} spent</p>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
              <p className={`text-5xl font-black ${gradeColor}`}>{grade}</p>
              <p className="text-slate-400 text-xs mt-1">Grade</p>
            </div>
            <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
              <p className="text-3xl font-bold text-yellow-400">+{xp}</p>
              <p className="text-slate-400 text-xs mt-1">XP Earned</p>
            </div>
            <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
              <p className="text-3xl font-bold text-orange-400">{bestStreak}</p>
              <p className="text-slate-400 text-xs mt-1">Best Streak</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-center">
              <p className="text-lg font-bold text-green-400">{correctCount}</p>
              <p className="text-slate-500 text-xs">Correct</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-center">
              <p className="text-lg font-bold text-red-400">
                {answers.filter(a => !a.is_correct && a.attemptType !== 'skip').length}
              </p>
              <p className="text-slate-500 text-xs">Wrong</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-center">
              <p className="text-lg font-bold text-yellow-400">{skippedCount}</p>
              <p className="text-slate-500 text-xs">Skipped</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-center">
              <p className="text-lg font-bold text-purple-400">{accuracy}%</p>
              <p className="text-slate-500 text-xs">Accuracy</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Avg time per question</span>
              <span className={`text-sm font-bold ${avgTimePerQ <= 60 ? 'text-green-400' : 'text-yellow-400'}`}>
                {avgTimePerQ < 60 ? `${avgTimePerQ}s` : `${Math.floor(avgTimePerQ / 60)}m ${avgTimePerQ % 60}s`}
                {avgTimePerQ <= 60 ? ' ✅ Good pace!' : ' ⚠️ Try to be faster'}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-slate-400">Questions answered</span>
              <span className={`text-sm font-bold ${answers.length >= targetQuestions ? 'text-green-400' : 'text-yellow-400'}`}>
                {answers.length} {answers.length >= targetQuestions ? '✅ Target reached!' : `(target: ${targetQuestions})`}
              </span>
            </div>
          </div>

          <div className={`rounded-2xl border p-4 mb-6 ${accuracy >= 70 ? 'border-green-700 bg-green-900/20' : accuracy >= 40 ? 'border-yellow-700 bg-yellow-900/20' : 'border-red-700 bg-red-900/20'}`}>
            <p className={`text-sm font-medium ${accuracy >= 70 ? 'text-green-400' : accuracy >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {accuracy >= 80 ? `🔥 Exceptional! You are mastering ${topic}!`
                : accuracy >= 60 ? `🎯 Good work! Keep practicing ${topic}!`
                : accuracy >= 40 ? `📈 You are improving! Practice ${topic} daily!`
                : `💡 ${topic} needs more attention. Check AI Recommendations!`}
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 rounded-xl border border-slate-700 hover:border-slate-500 transition text-sm">
              🏠 Dashboard
            </button>
            <button onClick={() => navigate('/recommendations')}
              className="flex-1 py-3 rounded-xl border border-purple-700 hover:bg-purple-900/30 transition text-sm text-purple-400">
              🤖 AI Help
            </button>
            <button onClick={() => window.location.reload()}
              className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 transition text-sm font-semibold">
              🔄 Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN SESSION ──
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">

      {/* TOP BAR */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <button onClick={() => setShowExitConfirm(true)}
            className="text-slate-400 hover:text-white transition text-lg font-bold w-8">✕</button>
          <div className="hidden sm:block">
            <p className="text-xs text-slate-500">Focus</p>
            <p className="text-sm font-bold text-cyan-400">{topic}</p>
          </div>
          <div className={`px-4 py-2 rounded-full border font-mono text-lg font-bold ${timeLeft < 60 ? 'border-red-500 bg-red-900/30 text-red-400 animate-pulse' : timeLeft < 300 ? 'border-yellow-500 bg-yellow-900/20 text-yellow-400' : 'border-slate-700 bg-slate-800 text-cyan-400'}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-yellow-400 font-bold">⚡{xp} XP</span>
            {streak >= 2 && <span className="text-orange-400 font-bold animate-pulse">🔥{streak}</span>}
          </div>
          <button onClick={handlePause}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${isPaused ? 'bg-green-600 text-white' : 'border border-slate-600 text-slate-300 hover:border-white'}`}>
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
        </div>
        <div className="px-4 pb-2 flex items-center gap-3">
          <span className="text-xs text-slate-500 whitespace-nowrap">Q {currentIndex + 1}/{questions.length}</span>
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${timePercent > 50 ? 'bg-green-500' : timePercent > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${timePercent}%` }} />
          </div>
          <span className="text-xs text-green-400 font-bold whitespace-nowrap">
            ✓{correctCount} ✗{answers.filter(a => !a.is_correct && a.attemptType !== 'skip').length}
          </span>
        </div>
      </div>

      {/* Motivational popup */}
      {showMotivation && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30 bg-slate-800 border border-slate-600 rounded-full px-6 py-2 text-sm font-bold animate-bounce shadow-xl">
          {motivationalMsg}
        </div>
      )}

      {/* Pause overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-40">
          <div className="text-center space-y-4">
            <p className="text-5xl">⏸</p>
            <p className="text-2xl font-bold">Paused</p>
            <p className="text-slate-400">Take a break. Your timer is stopped.</p>
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div><p className="text-xl font-bold text-green-400">{correctCount}</p><p className="text-xs text-slate-400">Correct</p></div>
              <div><p className="text-xl font-bold text-yellow-400">{xp}</p><p className="text-xs text-slate-400">XP so far</p></div>
              <div><p className="text-xl font-bold text-orange-400">{bestStreak}</p><p className="text-xs text-slate-400">Best streak</p></div>
            </div>
            <button onClick={handlePause}
              className="px-8 py-3 rounded-full bg-cyan-600 hover:bg-cyan-500 font-semibold mt-4">
              ▶ Resume Session
            </button>
          </div>
        </div>
      )}

      {/* Exit confirm */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-80 text-center">
            <p className="text-xl font-bold mb-2">End Session Early?</p>
            <p className="text-slate-400 text-sm mb-2">You've answered {answers.length} questions with {accuracy}% accuracy.</p>
            <p className="text-yellow-400 text-xs mb-6">Your progress will be saved!</p>
            <div className="flex gap-3">
              <button onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-600 text-sm">Keep Going 💪</button>
              <button onClick={handleSessionEnd}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 transition text-sm">End & Save</button>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION AREA */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">Question {currentIndex + 1}</span>
            <span className="text-xs text-slate-600">·</span>
            <span className="text-xs text-slate-500">⏱ {questionTimer}s</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleHint} disabled={hintsLeft <= 0 || isAnswered}
              className={`text-xs px-2.5 py-1 rounded-full border transition ${hintsLeft > 0 && !isAnswered ? 'border-yellow-600 text-yellow-400 hover:bg-yellow-900/30' : 'border-slate-700 text-slate-600 cursor-not-allowed'}`}>
              💡 Hint ({hintsLeft}) -30s
            </button>
            <button onClick={handleSkip} disabled={skipsLeft <= 0 || isAnswered}
              className={`text-xs px-2.5 py-1 rounded-full border transition ${skipsLeft > 0 && !isAnswered ? 'border-slate-600 text-slate-400 hover:border-slate-400' : 'border-slate-700 text-slate-600 cursor-not-allowed'}`}>
              ⏭ Skip ({skipsLeft})
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 mb-4">
          <p className="text-base leading-relaxed text-slate-100">{q?.question_text}</p>
          {showHint && (
            <div className="mt-3 pt-3 border-t border-slate-700">
              <p className="text-xs text-yellow-400 font-semibold mb-1">💡 Hint</p>
              <p className="text-sm text-slate-300">
                {q?.shortcut_text 
                  ? q.shortcut_text 
                  : q?.solution_text
                  ? q.solution_text
                  : 'Try eliminating wrong options first. Work backwards from the answer choices.'}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2.5 mb-4">
          {options.map((opt, idx) => (
            <button key={idx} onClick={() => handleAnswer(idx)}
              className={`w-full text-left p-4 rounded-xl border transition-all text-sm ${getOptionStyle(idx)}`}>
              <span className="font-bold mr-3 text-slate-400">{String.fromCharCode(65 + idx)}.</span>
              {opt}
              {isAnswered && idx === correctIndex && <span className="float-right text-green-400 font-bold">✓</span>}
              {isAnswered && idx === selectedOption && idx !== correctIndex && <span className="float-right text-red-400 font-bold">✗</span>}
            </button>
          ))}
        </div>

        {isAnswered && (
          <div className="space-y-3">
            {selectedOption !== correctIndex && q?.solution_text && (
              <div className="rounded-xl border border-blue-800 bg-blue-900/20 p-4">
                <p className="text-xs font-bold text-blue-400 mb-1">📖 Solution</p>
                <p className="text-sm text-slate-300">{q.solution_text}</p>
              </div>
            )}
            {q?.shortcut_text && !showHint && (
              <div className="rounded-xl border border-yellow-800 bg-yellow-900/20 p-3">
                <p className="text-xs font-bold text-yellow-400 mb-1">⚡ Shortcut tip</p>
                <p className="text-sm text-slate-300">{q.shortcut_text}</p>
              </div>
            )}
          </div>
        )}

        {/* Arrow navigation - ALWAYS visible */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
          <button
            onClick={() => {
              if (currentIndex > 0) {
                setCurrentIndex(p => p - 1);
                setSelectedOption(null);
                setIsAnswered(false);
                setShowHint(false);
                setQuestionTimer(0);
              }
            }}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-full border border-slate-600 bg-slate-800/90 backdrop-blur flex items-center justify-center text-xl hover:border-slate-400 transition disabled:opacity-30">
            ←
          </button>
          <span className="text-xs text-slate-500">Q {currentIndex + 1}/{questions.length}</span>
          <button onClick={() => goNext(false)}
              className="w-12 h-12 rounded-full bg-cyan-600 hover:bg-cyan-500 flex items-center justify-center text-xl transition">
              →
            </button>
          </div>
      </div>
    </div>
  );
}

