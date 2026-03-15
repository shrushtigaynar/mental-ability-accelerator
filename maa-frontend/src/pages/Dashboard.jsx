import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, getUser, isLoggedIn, logout } from "../utils/auth.js";
import { getDashboardStats } from "../api/dashboard.js";
import Sidebar from "../components/Sidebar";

const DEFAULT_STATS = {
  streak: 0,
  todayFocus: null,
  avgSessionMinutes: 0,
  totalSessions: 0,
  accuracy: 0,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loadingStats, setLoadingStats] = useState(true);
  const [friendLeaderboard, setFriendLeaderboard] = useState([]);
  
  // Focus state
  const [showFocusPicker, setShowFocusPicker] = useState(false);
  const [todayFocus, setTodayFocus] = useState(null);
  const [focusMinutes, setFocusMinutes] = useState(30);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [focusCompleted, setFocusCompleted] = useState(false);

  const getQuestionCount = (mins) => {
    if (mins <= 15) return 12;
    if (mins <= 30) return 22;
    if (mins <= 45) return 32;
    if (mins <= 60) return 45;
    if (mins <= 90) return 70;
    return 95;
  };

  const ALL_TOPICS = [
  'Percentages',
  'Profit & Loss', 
  'Time & Work',
  'Time, Speed & Distance',
  'Ratio & Proportion',
  'Number Series',
  'Missing Number Pattern',
  'Alphabet Series',
  'Analogy',
  'Odd One Out',
  'Blood Relations',
  'Coding-Decoding',
  'Direction Sense',
  'Syllogisms',
  'Statement & Conclusion'
];

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login", { replace: true });
      return;
    }

    const token = getToken();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let alive = true;
    setLoadingStats(true);

    getDashboardStats(token)
      .then((data) => {
        if (!alive) return;
        setStats({
          streak: data?.streak ?? 0,
          todayFocus: data?.todayFocus ?? null,
          avgSessionMinutes: data?.avgSessionMinutes ?? 0,
          totalSessions: data?.totalSessions ?? 0,
          accuracy: data?.accuracy ?? 0,
        });
      })
      .catch(() => {
        if (!alive) return;
        setStats(DEFAULT_STATS);
      })
      .finally(() => {
        if (!alive) return;
        setLoadingStats(false);
      });

    // Fetch friend leaderboard
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem('maa_token');
        const res = await axios.get(
          'http://localhost:4000/api/friends/list',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (alive) {
          setFriendLeaderboard(res.data.friends || []);
        }
      } catch (err) {
        console.error('Leaderboard fetch failed:', err);
      }
    };

    fetchLeaderboard();

    // Fetch today's focus
    const fetchTodayFocus = async () => {
      try {
        const token = localStorage.getItem('maa_token');
        const res = await axios.get(
          'http://localhost:4000/api/dashboard/focus',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (alive) {
          setTodayFocus(res.data.topic);
          setFocusMinutes(res.data.minutes || 30);
        }
      } catch (err) {
        console.error('Fetch focus failed:', err);
      }
    };

    fetchTodayFocus();

    return () => {
      alive = false;
    };
  }, [navigate]);

  const handleSetFocus = async (topic, minutes = 30) => {
    try {
      const token = localStorage.getItem('maa_token');
      await axios.post(
        'http://localhost:4000/api/dashboard/focus',
        { topic, minutes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodayFocus(topic);
      setFocusMinutes(minutes);
      setShowFocusPicker(false);
    } catch (err) {
      console.error('Set focus error:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="mx-auto max-w-5xl">
          <header className="mb-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Welcome back, {user?.name || "Learner"}
              </h1>
              <p className="mt-2 text-xs text-slate-400 sm:text-sm">
                Keep your streak alive and track how your cognitive performance
                improves over time.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-3 gap-4 mb-8">
  
            {/* Card 1 - Current Streak */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <p className="text-slate-400 text-sm mb-2">Current streak</p>
              <p className="text-4xl font-bold text-cyan-400">{stats?.streak || 0}</p>
              <p className="text-slate-500 text-xs mt-1">days in a row</p>
            </div>

            {/* Card 2 - Today's Focus */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <p className="text-slate-400 text-sm mb-2">Today's focus</p>
              {todayFocus ? (
                <>
              <p className="text-slate-400 text-sm mb-1">Today's focus</p>
              <p className="text-lg font-bold text-cyan-400 mb-1">
                🎯 {todayFocus}
              </p>
              
              {/* Session Preview Stats */}
              <div className="grid grid-cols-3 gap-2 my-3">
                <div className="rounded-xl bg-slate-800/60 p-2 text-center">
                  <p className="text-sm font-bold text-purple-400">⏱️ {focusMinutes}m</p>
                  <p className="text-xs text-slate-500">Duration</p>
                </div>
                <div className="rounded-xl bg-slate-800/60 p-2 text-center">
                  <p className="text-sm font-bold text-cyan-400">
                    ~{getQuestionCount(focusMinutes)}
                  </p>
                  <p className="text-xs text-slate-500">Questions</p>
                </div>
                <div className="rounded-xl bg-slate-800/60 p-2 text-center">
                  <p className="text-sm font-bold text-green-400">1/min</p>
                  <p className="text-xs text-slate-500">Target</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/focus-session', { 
                  state: { 
                    topic: todayFocus, 
                    minutes: focusMinutes,
                    targetQuestions: getQuestionCount(focusMinutes)
                  } 
                })}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 
                  transition text-sm font-semibold mb-2"
              >
                🚀 Start Focus Session
              </button>
              
              <button
                onClick={() => setShowFocusPicker(true)}
                className="w-full text-center text-xs text-slate-500 
                  hover:text-slate-300 transition py-1"
              >
                ✏️ Change focus
              </button>
            </>
              ) : (
                <>
                  <p className="text-lg font-bold text-white">No focus set yet</p>
                  <p className="text-slate-500 text-xs mt-1 mb-3">
                    Start a session to begin tracking
                  </p>
                  <button
                    onClick={() => setShowFocusPicker(true)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition"
                  >
                    Set focus →
                  </button>
                </>
              )}
            </div>

            {/* Card 3 - Average Session */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <p className="text-slate-400 text-sm mb-2">Average session</p>
              <p className="text-4xl font-bold text-purple-400">{stats?.avgSessionMinutes || 0}</p>
              <p className="text-slate-500 text-xs mt-1">minutes per day</p>
            </div>

          </div>

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              Training modules
            </h2>
            <p className="mt-2 text-xs text-slate-400 sm:text-sm">
              Choose a track to start a focused session.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <article className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-50">
                    Memory Training
                  </h3>
                  <p className="mt-2 text-xs text-slate-400">
                    Practice recall with number grids and card patterns designed
                    to stretch your working memory.
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-sky-400 hover:to-blue-500"
                  onClick={() => navigate("/memory")}
                >
                  Start Training
                </button>
              </article>

              <article className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-50">
                    Logical Reasoning
                  </h3>
                  <p className="mt-2 text-xs text-slate-400">
                    Work through quick logic puzzles and pattern questions to
                    sharpen your reasoning skills.
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-400 hover:to-teal-400"
                  onClick={() => navigate("/logic")}
                >
                  Start Training
                </button>
              </article>

              <article className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-50">
                    Speed Challenges
                  </h3>
                  <p className="mt-2 text-xs text-slate-400">
                    Time-based challenges that test how quickly and accurately
                    you can respond under pressure.
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-400 hover:to-fuchsia-400"
                  onClick={() => navigate("/speed-training")}
                >
                  Start Training
                </button>
              </article>
            </div>
          </section>

          {/* Friend Leaderboard */}
<div className="mt-8">
  <h2 className="text-xl font-bold mb-1">Friend Leaderboard</h2>
  <p className="text-slate-400 text-sm mb-4">
    Top performers among your friends this week.
  </p>
  {friendLeaderboard.length === 0 ? (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
      <p className="text-2xl mb-2">👥</p>
      <p className="text-slate-400 text-sm">No friends yet.</p>
      <button
        onClick={() => navigate('/friends')}
        className="mt-3 px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-500 transition text-sm"
      >
        Add Friends →
      </button>
    </div>
  ) : (
    <div className="space-y-3">
      {friendLeaderboard.slice(0, 3).map((friend, i) => (
        <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              i === 0 ? 'bg-yellow-500 text-black' :
              i === 1 ? 'bg-slate-400 text-black' :
              'bg-orange-700 text-white'
            }`}>
              {i + 1}
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center font-bold text-sm">
              {(friend.name || friend.email)?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm">{friend.name || friend.email}</p>
              <p className="text-slate-500 text-xs">
                {friend.streak} day streak · {friend.avg_accuracy}% accuracy
              </p>
            </div>
          </div>
          <span className="text-orange-400 font-bold text-sm">
            {Math.round((friend.streak * 100) + (parseFloat(friend.avg_accuracy) * 10))} pts
          </span>
        </div>
      ))}
      <button
        onClick={() => navigate('/friends')}
        className="text-orange-400 text-sm hover:text-orange-300 transition mt-1"
      >
        View all friends →
      </button>
    </div>
  )}
</div>
        </div>
      </div>

      {/* 2-Step Focus Modal */}
      {showFocusPicker && (
        <div className="fixed inset-0 bg-black/60 flex items-center 
          justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 
            rounded-2xl p-6 w-full max-w-md max-h-[85vh] 
            overflow-y-auto">
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Set Today's Focus</h3>
              <button 
                onClick={() => {
                  setShowFocusPicker(false);
                  setSelectedTopic(null);
                }}
                className="text-slate-400 hover:text-white text-xl"
              >✕</button>
            </div>

            {/* Step 1: Pick Topic */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-300 mb-3">
                Step 1 — Choose a topic 🎯
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ALL_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`text-left px-3 py-2.5 rounded-xl text-xs 
                      font-medium transition ${
                      selectedTopic === topic
                        ? 'bg-cyan-600 text-white border border-cyan-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-transparent'
                    }`}
                  >
                    {selectedTopic === topic ? '✅ ' : ''}{topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Pick Time */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-300 mb-3">
                Step 2 — Set focus time ⏱️
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setFocusMinutes(mins)}
                    className={`py-2.5 rounded-xl text-sm font-bold 
                      transition ${
                      focusMinutes === mins
                        ? 'bg-purple-600 text-white border border-purple-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-transparent'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Selected: {focusMinutes} minutes of focused practice
              </p>
            </div>

            {/* Confirm Button */}
            <button
              onClick={() => {
                if (selectedTopic) {
                  handleSetFocus(selectedTopic, focusMinutes);
                  setSelectedTopic(null);
                }
              }}
              disabled={!selectedTopic}
              className="w-full py-3 rounded-xl bg-cyan-600 
                hover:bg-cyan-500 transition font-semibold text-sm
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {selectedTopic 
                ? `🚀 Set Focus: ${selectedTopic} for ${focusMinutes}m` 
                : 'Select a topic first'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

