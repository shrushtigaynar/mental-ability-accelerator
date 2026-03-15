import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CognitiveProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('maa_token');
      const user = JSON.parse(localStorage.getItem('maa_user') || '{}');
      const userId = user?.id || 4;
      const response = await axios.get(
        `http://localhost:4000/api/analytics/cognitive/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Cognitive profile:', response.data);
      setProfile(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (score) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStrengthLabel = (score) => {
    if (score >= 70) return { label: 'Strong', color: 'text-green-400' };
    if (score >= 40) return { label: 'Average', color: 'text-yellow-400' };
    return { label: 'Weak', color: 'text-red-400' };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold tracking-widest text-purple-400 uppercase mb-1">Analytics</p>
            <h1 className="text-3xl font-bold">Cognitive Profile</h1>
            <p className="text-slate-400 mt-1">Your mental ability breakdown</p>
          </div>
          <button onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-500 transition text-sm">
            Back to dashboard
          </button>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-20 rounded-2xl bg-slate-800/60 animate-pulse"/>)}
          </div>
        )}

        {!loading && !profile && (
          <div className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-900/50">
            <p className="text-4xl mb-3">🧠</p>
            <p className="text-slate-300 font-medium">No profile data yet!</p>
            <p className="text-slate-500 text-sm mt-1">Complete at least 3 training sessions to generate your profile.</p>
            <button onClick={() => navigate('/dashboard')}
              className="mt-4 px-6 py-2 rounded-full bg-purple-600 hover:bg-purple-500 transition text-sm font-medium">
              Start Training
            </button>
          </div>
        )}

        {!loading && profile && (
          <div className="space-y-6">
            
            {/* Overall Score */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold mb-4">Overall Performance</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-slate-800/60">
                  <p className="text-3xl font-bold text-purple-400">
                    {Math.round(profile.overall_accuracy || 0)}%
                  </p>
                  <p className="text-slate-400 text-xs mt-1">Overall Accuracy</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-slate-800/60">
                  <p className="text-3xl font-bold text-cyan-400">
                    {profile.total_sessions || 0}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">Total Sessions</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-slate-800/60">
                  <p className="text-3xl font-bold text-green-400">
                    {profile.total_questions_attempted || 0}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">Questions Attempted</p>
                </div>
              </div>
            </div>

            {/* Topic breakdown */}
            {profile.topic_breakdown && profile.topic_breakdown.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <h2 className="text-lg font-semibold mb-4">Topic Performance</h2>
                <div className="space-y-4">
                  {profile.topic_breakdown.map((topic, i) => {
                    const strength = getStrengthLabel(topic.accuracy_percentage);
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-300">{topic.topic_name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${strength.color}`}>
                              {strength.label}
                            </span>
                            <span className="text-sm font-semibold text-white">
                              {Math.round(topic.accuracy_percentage)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getStrengthColor(topic.accuracy_percentage)}`}
                            style={{width: `${topic.accuracy_percentage}%`}}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {topic.correct_answers}/{topic.total_attempts} correct
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="rounded-2xl border border-purple-900/40 bg-purple-900/10 p-6">
              <h2 className="text-lg font-semibold mb-3 text-purple-300">💡 Personalized Recommendations</h2>
              <ul className="space-y-2 text-sm text-slate-300">
                {profile.topic_breakdown?.filter(t => t.accuracy_percentage < 50).slice(0,3).map((t,i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">→</span>
                    Focus more on <strong className="text-white">{t.topic_name}</strong> 
                    — currently at {Math.round(t.accuracy_percentage)}% accuracy
                  </li>
                ))}
                {(!profile.topic_breakdown || profile.topic_breakdown.filter(t => t.accuracy_percentage < 50).length === 0) && (
                  <li className="text-green-400">🎉 Great job! You are performing well across all topics!</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
