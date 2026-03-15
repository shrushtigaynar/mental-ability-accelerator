import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Sidebar from '../components/Sidebar';

export default function FriendStreak() {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [battleState, setBattleState] = useState(null);
  const [notification, setNotification] = useState(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('maa_token');
  const user = JSON.parse(localStorage.getItem('maa_user') || '{}');

  useEffect(() => {
    fetchFriends();
    fetchRequests();
    setupSocket();
    return () => socketRef.current?.disconnect();
  }, []);

  const setupSocket = () => {
    socketRef.current = io('http://localhost:4000', {
      auth: { token }
    });

    socketRef.current.on('battle_invite', (data) => {
      setNotification({
        type: 'battle_invite',
        message: `${data.fromName} challenged you to a battle!`,
        data
      });
    });

    socketRef.current.on('battle_started', (data) => {
      setBattleState({ ...data, myScore: 0, opponentScore: 0 });
      setActiveTab('battle');
    });

    socketRef.current.on('score_update', (data) => {
      setBattleState(prev => ({
        ...prev,
        opponentScore: data.score
      }));
    });

    socketRef.current.on('battle_ended', (data) => {
      setBattleState(prev => ({ ...prev, result: data }));
    });
  };

  const fetchFriends = async () => {
    try {
      const res = await axios.get(
        'http://localhost:4000/api/friends/list',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFriends(res.data.friends || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        'http://localhost:4000/api/friends/requests',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvite = async () => {
  if (!searchEmail.trim()) return;
  setInviteLoading(true);
  try {
    const token = localStorage.getItem('maa_token');
    const res = await axios.post(
      'http://localhost:4000/api/friends/invite',
      { email: searchEmail },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNotification({ 
      type: 'success', 
      message: `✅ Invite sent to ${searchEmail}! They'll receive an email shortly.` 
    });
    setSearchEmail('');
  } catch (err) {
    // If user already exists in system, send friend request directly
    if (err.response?.data?.existingUser) {
      try {
        const token = localStorage.getItem('maa_token');
        await axios.post(
          'http://localhost:4000/api/friends/request',
          { friendId: err.response.data.existingUser.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotification({ 
          type: 'success', 
          message: `✅ Friend request sent to ${searchEmail}!` 
        });
        setSearchEmail('');
      } catch (err2) {
        setNotification({ type: 'error', message: err2.response?.data?.error || 'Failed to send request' });
      }
    } else {
      setNotification({ 
        type: 'error', 
        message: err.response?.data?.error || 'Failed to send invite' 
      });
    }
  } finally {
    setInviteLoading(false);
  }
};

  const sendRequest = async (friendId) => {
    try {
      await axios.post(
        'http://localhost:4000/api/friends/request',
        { friendId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotification({ type: 'success', message: 'Friend request sent!' });
      setSearchResults([]);
      setSearchEmail('');
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Failed to send request' });
    }
  };

  const handleRequest = async (friendshipId, action) => {
    try {
      await axios.put(
        `http://localhost:4000/api/friends/request/${friendshipId}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFriends();
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const challengeFriend = (friendId, friendName) => {
    socketRef.current?.emit('send_battle_invite', {
      toUserId: friendId,
      fromName: user.name || user.email,
      topic: 'Mixed'
    });
    setNotification({ 
      type: 'success', 
      message: `Battle invite sent to ${friendName}!` 
    });
  };

  const getStreakColor = (streak) => {
    if (streak >= 7) return 'text-orange-400';
    if (streak >= 3) return 'text-yellow-400';
    return 'text-slate-400';
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⚡';
    return '💤';
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-semibold tracking-widest text-orange-400 uppercase mb-1">
                Social
              </p>
              <h1 className="text-3xl font-bold">Friend Streaks</h1>
              <p className="text-slate-400 mt-1">
                Compete with friends and stay motivated
              </p>
            </div>
          </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-4 p-4 rounded-2xl border ${
            notification.type === 'success' ? 'border-green-700 bg-green-900/20 text-green-400' :
            notification.type === 'error' ? 'border-red-700 bg-red-900/20 text-red-400' :
            'border-cyan-700 bg-cyan-900/20 text-cyan-400'
          } flex items-center justify-between`}>
            <p>{notification.message}</p>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white ml-4">✕</button>
          </div>
        )}

        {/* Battle invite notification */}
        {notification?.type === 'battle_invite' && (
          <div className="mb-4 p-4 rounded-2xl border border-orange-700 bg-orange-900/20 flex items-center justify-between">
            <p className="text-orange-300">{notification.message}</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  socketRef.current?.emit('accept_battle', notification.data);
                  setNotification(null);
                }}
                className="px-3 py-1 rounded-full bg-green-600 hover:bg-green-500 text-sm"
              >
                Accept ⚔️
              </button>
              <button
                onClick={() => setNotification(null)}
                className="px-3 py-1 rounded-full border border-slate-600 text-sm"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['friends', 'search', 'requests', 'battle'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition capitalize ${
                activeTab === tab
                  ? 'bg-orange-600 text-white'
                  : 'border border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {tab === 'friends' && `👥 Friends (${friends.length})`}
              {tab === 'search' && '🔍 Add Friend'}
              {tab === 'requests' && `📩 Requests ${requests.length > 0 ? `(${requests.length})` : ''}`}
              {tab === 'battle' && '⚔️ Battle'}
            </button>
          ))}
        </div>

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="space-y-4">
            {loading && (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-slate-800/60 animate-pulse"/>)}
              </div>
            )}
            {!loading && friends.length === 0 && (
              <div className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-900/50">
                <p className="text-4xl mb-3">👥</p>
                <p className="text-slate-300 font-medium">No friends yet!</p>
                <p className="text-slate-500 text-sm mt-1">Search for friends by email to get started.</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="mt-4 px-6 py-2 rounded-full bg-orange-600 hover:bg-orange-500 transition text-sm font-medium"
                >
                  Add Friends
                </button>
              </div>
            )}
            {friends.map((friend, i) => (
              <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-lg font-bold">
                      {(friend.name || friend.email)?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{friend.name || friend.email}</p>
                      <p className="text-slate-400 text-xs">{friend.email}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-sm font-bold ${getStreakColor(friend.streak)}`}>
                          {getStreakEmoji(friend.streak)} {friend.streak} day streak
                        </span>
                        <span className="text-xs text-slate-500">
                          {friend.avg_accuracy}% avg accuracy
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => challengeFriend(friend.id, friend.name || friend.email)}
                    className="px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-500 transition text-sm font-semibold"
                  >
                    ⚔️ Challenge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-lg font-semibold mb-2">Invite a Friend</h3>
              <p className="text-slate-400 text-sm mb-4">
                Enter your friend's email address. They'll receive an invite 
                link to join MAA and connect with you!
              </p>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={e => setSearchEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleInvite()}
                  placeholder="Enter friend's email address..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
                />
                <button
                  onClick={handleInvite}
                  disabled={inviteLoading || !searchEmail.trim()}
                  className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 transition font-medium disabled:opacity-50 whitespace-nowrap"
                >
                  {inviteLoading ? 'Sending...' : '📨 Add Friend'}
                </button>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">How it works</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-orange-400 font-bold text-sm mt-0.5">1</span>
                  <p className="text-slate-400 text-sm">Enter your friend's email and click Add Friend</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-orange-400 font-bold text-sm mt-0.5">2</span>
                  <p className="text-slate-400 text-sm">They receive an email with a link to join MAA</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-orange-400 font-bold text-sm mt-0.5">3</span>
                  <p className="text-slate-400 text-sm">Once they sign up, you're automatically connected</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-orange-400 font-bold text-sm mt-0.5">4</span>
                  <p className="text-slate-400 text-sm">Challenge each other to battles and track streaks!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 && (
              <div className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-900/50">
                <p className="text-4xl mb-3">📩</p>
                <p className="text-slate-300">No pending requests</p>
              </div>
            )}
            {requests.map((req, i) => (
              <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                    {(req.name || req.email)?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{req.name || 'User'}</p>
                    <p className="text-slate-400 text-xs">{req.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequest(req.friendship_id, 'accept')}
                    className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-500 transition text-sm font-medium"
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={() => handleRequest(req.friendship_id, 'reject')}
                    className="px-4 py-2 rounded-full border border-slate-600 hover:border-red-500 transition text-sm"
                  >
                    ✕ Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Battle Tab */}
        {activeTab === 'battle' && (
          <div className="space-y-4">
            {!battleState && (
              <div className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-900/50">
                <p className="text-4xl mb-3">⚔️</p>
                <p className="text-slate-300 font-medium">No active battle</p>
                <p className="text-slate-500 text-sm mt-1">
                  Challenge a friend from the Friends tab to start a battle!
                </p>
              </div>
            )}
            {battleState && !battleState.result && (
              <div className="rounded-2xl border border-orange-700 bg-orange-900/10 p-6">
                <h2 className="text-xl font-bold text-center mb-6">⚔️ Battle in Progress!</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 rounded-xl bg-slate-800/60">
                    <p className="text-slate-400 text-sm">You</p>
                    <p className="text-4xl font-bold text-cyan-400 mt-2">{battleState.myScore}</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-slate-800/60">
                    <p className="text-slate-400 text-sm">Opponent</p>
                    <p className="text-4xl font-bold text-orange-400 mt-2">{battleState.opponentScore}</p>
                  </div>
                </div>
              </div>
            )}
            {battleState?.result && (
              <div className="rounded-2xl border border-yellow-700 bg-yellow-900/10 p-8 text-center">
                <p className="text-5xl mb-4">
                  {battleState.result.winner === user.id ? '🏆' : '😔'}
                </p>
                <h2 className="text-2xl font-bold">
                  {battleState.result.winner === user.id ? 'You Won!' : 'You Lost!'}
                </h2>
                <p className="text-slate-400 mt-2">
                  Final Score: {battleState.myScore} vs {battleState.opponentScore}
                </p>
                <button
                  onClick={() => setBattleState(null)}
                  className="mt-4 px-6 py-2 rounded-full bg-orange-600 hover:bg-orange-500 transition text-sm font-medium"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
