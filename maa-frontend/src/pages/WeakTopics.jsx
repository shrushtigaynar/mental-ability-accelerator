import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function WeakTopics() {
  const [weakTopics, setWeakTopics] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [overallStats, setOverallStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('maa_token');
      const user = JSON.parse(localStorage.getItem('maa_user') || '{}');
      const userId = user?.id || 4;

      // Fetch weak topics
      const weakRes = await axios.get(
        `http://localhost:4000/api/analytics/weak-topics/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const weak = weakRes.data.weak_topics || [];
      setWeakTopics(weak);

      // Fetch dashboard stats for overall numbers
      const statsRes = await axios.get(
        `http://localhost:4000/api/dashboard/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOverallStats(statsRes.data);

      // Fetch all topic performance from analytics
      const cogRes = await axios.get(
        `http://localhost:4000/api/analytics/cognitive/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const topicBreakdown = cogRes.data?.topic_breakdown || [];
      setAllTopics(topicBreakdown);

    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const strongTopics = allTopics.filter(t => t.accuracy_percentage >= 60);
  const weakTopicsList = allTopics.filter(t => t.accuracy_percentage < 60);

  const getBarColor = (accuracy) => {
    if (accuracy >= 70) return 'bg-green-500';
    if (accuracy >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBadgeStyle = (accuracy) => {
    if (accuracy >= 70) return 'bg-green-900/40 text-green-400 border border-green-700';
    if (accuracy >= 40) return 'bg-yellow-900/40 text-yellow-400 border border-yellow-700';
    return 'bg-red-900/40 text-red-400 border border-red-700';
  };

  const getLabel = (accuracy) => {
    if (accuracy >= 70) return '💪 Strong';
    if (accuracy >= 40) return '📈 Average';
    return '⚠️ Needs Work';
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-semibold tracking-widest text-cyan-400 uppercase mb-1">
                Analytics
              </p>
              <h1 className="text-3xl font-bold">Performance Analytics</h1>
              <p className="text-slate-400 mt-1">
                Your complete aptitude performance breakdown
              </p>
            </div>
          </div>

        {loading && (
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-slate-800/60 animate-pulse"/>
            ))}
          </div>
        )}

        {!loading && (
          <>
            {/* Overall Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center">
                <p className="text-3xl font-bold text-cyan-400">
                  {overallStats?.totalSessions || 0}
                </p>
                <p className="text-slate-400 text-sm mt-1">Sessions Done</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center">
                <p className="text-3xl font-bold text-purple-400">
                  {overallStats?.accuracy || 0}%
                </p>
                <p className="text-slate-400 text-sm mt-1">Avg Accuracy</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center">
                <p className="text-3xl font-bold text-green-400">
                  {strongTopics.length}
                </p>
                <p className="text-slate-400 text-sm mt-1">Strong Topics</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {['overview', 'weak', 'strong'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition capitalize ${
                    activeTab === tab
                      ? 'bg-cyan-600 text-white'
                      : 'border border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {tab === 'overview' && '📊 Overview'}
                  {tab === 'weak' && `⚠️ Needs Work (${weakTopicsList.length})`}
                  {tab === 'strong' && `💪 Strong (${strongTopics.length})`}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                {(() => {
                  const displayTopics = allTopics.length > 0 
                    ? [...allTopics].sort((a, b) => b.accuracy_percentage - a.accuracy_percentage)
                    : weakTopics.length > 0 
                      ? weakTopics 
                      : [];
                  
                  if (displayTopics.length === 0) {
                    return (
                      <div className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-900/50">
                        <p className="text-4xl mb-3">📊</p>
                        <p className="text-slate-300 font-medium">No data yet!</p>
                        <p className="text-slate-500 text-sm mt-1">
                          Complete training sessions to see your breakdown.
                        </p>
                        <button
                          onClick={() => navigate('/dashboard')}
                          className="mt-4 px-6 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 transition text-sm"
                        >
                          Start Training
                        </button>
                      </div>
                    );
                  }

                  return displayTopics.map((topic, i) => (
                    <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-200">
                          {topic.topic_name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getBadgeStyle(topic.accuracy_percentage)}`}>
                            {getLabel(topic.accuracy_percentage)}
                          </span>
                          <span className="text-sm font-bold text-white">
                            {Math.round(topic.accuracy_percentage)}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getBarColor(topic.accuracy_percentage)}`}
                          style={{ width: `${topic.accuracy_percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {topic.correct_answers || (topic.total_attempts - topic.mistake_count) || 0} correct 
                        out of {topic.total_attempts || 0} attempts
                      </p>
                    </div>
                  ));
                })()}
              </div>
            )}

            {/* Weak Tab */}
            {activeTab === 'weak' && (
              <div className="space-y-4">
                {weakTopicsList.length === 0 && weakTopics.length === 0 && (
                  <div className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-900/50">
                    <p className="text-4xl mb-3">🎉</p>
                    <p className="text-green-400 font-medium">No weak topics!</p>
                    <p className="text-slate-500 text-sm mt-1">You are performing well everywhere.</p>
                  </div>
                )}
                {(weakTopicsList.length > 0 ? weakTopicsList : weakTopics).map((topic, i) => (
                  <div key={i} className="rounded-2xl border border-red-900/40 bg-red-900/10 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">{topic.topic_name}</h3>
                      <span className="text-sm font-bold px-3 py-1 rounded-full bg-red-900/40 text-red-400 border border-red-700">
                        {Math.round(topic.accuracy_percentage)}% accuracy
                      </span>
                    </div>
                    <div className="flex gap-6 text-sm text-slate-400 mb-3">
                      <span>❌ {topic.mistake_count || (topic.total_attempts - topic.correct_answers)} mistakes</span>
                      <span>📝 {topic.total_attempts} attempts</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div className="h-2 rounded-full bg-red-500"
                        style={{ width: `${topic.accuracy_percentage}%` }}/>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-red-400">⚠️ Practice this topic daily</p>
                      <button
                        onClick={() => navigate('/recommendations')}
                        className="text-xs px-3 py-1 rounded-full bg-red-900/40 border border-red-700 text-red-300 hover:bg-red-900/60 transition"
                      >
                        Get AI Help →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Strong Tab */}
            {activeTab === 'strong' && (
              <div className="space-y-4">
                {strongTopics.length === 0 && (
                  <div className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-900/50">
                    <p className="text-4xl mb-3">💪</p>
                    <p className="text-slate-300 font-medium">No strong topics yet!</p>
                    <p className="text-slate-500 text-sm mt-1">
                      Keep practicing to build your strengths.
                    </p>
                  </div>
                )}
                {strongTopics.map((topic, i) => (
                  <div key={i} className="rounded-2xl border border-green-900/40 bg-green-900/10 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">{topic.topic_name}</h3>
                      <span className="text-sm font-bold px-3 py-1 rounded-full bg-green-900/40 text-green-400 border border-green-700">
                        {Math.round(topic.accuracy_percentage)}% accuracy
                      </span>
                    </div>
                    <div className="flex gap-6 text-sm text-slate-400 mb-3">
                      <span>✅ {topic.correct_answers} correct</span>
                      <span>📝 {topic.total_attempts} attempts</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div className="h-2 rounded-full bg-green-500"
                        style={{ width: `${topic.accuracy_percentage}%` }}/>
                    </div>
                    <p className="text-xs text-green-400 mt-2">
                      🏆 Keep it up — maintain this performance!
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
