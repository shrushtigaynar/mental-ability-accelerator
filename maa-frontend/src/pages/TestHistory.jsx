import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function TestHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('maa_token');
      const userStr = localStorage.getItem('maa_user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || user?.user_id || 4;

      const response = await axios.get(
        `http://localhost:4000/api/tests/history/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Test history response:', response.data);
      const tests = response.data.tests || response.data || [];
      setHistory(tests);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Failed to load test history');
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 70) return 'text-green-400';
    if (accuracy >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getModeLabel = (mode) => {
    if (!mode) return 'Practice';
    if (mode.includes('speed')) return '⚡ Speed';
    if (mode.includes('memory') || mode.includes('deep')) return '🧠 Memory';
    if (mode.includes('logic') || mode.includes('interview')) return '💡 Logic';
    return '📝 Practice';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0m 0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold tracking-widest text-cyan-400 uppercase mb-1">
              History
            </p>
            <h1 className="text-3xl font-bold">Test History</h1>
            <p className="text-slate-400 mt-1">
              All your past training sessions
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-500 transition text-sm"
          >
            Back to dashboard
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center text-red-400 py-16 rounded-2xl border border-red-900/40 bg-red-900/10">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && history.length === 0 && (
          <div className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-900/50">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-slate-300 font-medium">No test history yet!</p>
            <p className="text-slate-500 text-sm mt-1">Complete a training session to see it here.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-6 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 transition text-sm font-medium"
            >
              Start Training
            </button>
          </div>
        )}

        {/* History list */}
        {!loading && history.length > 0 && (
          <div className="space-y-4">
            <p className="text-slate-400 text-sm">{history.length} sessions completed</p>
            {history.map((test, index) => (
              <div
                key={test.id || index}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-slate-300">
                        {getModeLabel(test.mode || test.attempt_type)}
                      </span>
                      {test.topic_name && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                          {test.topic_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs">Score</p>
                        <p className="font-semibold text-white">
                          {test.total_score || 0}/{test.total_questions || '?'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Accuracy</p>
                        <p className={`font-semibold ${getAccuracyColor(test.accuracy_percentage)}`}>
                          {Math.round(test.accuracy_percentage || 0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Time</p>
                        <p className="font-semibold text-slate-300">
                          {formatTime(test.total_time)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      {formatDate(test.created_at)}
                    </p>
                    <div className={`mt-2 inline-block w-2 h-2 rounded-full ${
                      test.accuracy_percentage >= 70 ? 'bg-green-400' :
                      test.accuracy_percentage >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      test.accuracy_percentage >= 70 ? 'bg-green-500' :
                      test.accuracy_percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${test.accuracy_percentage || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
