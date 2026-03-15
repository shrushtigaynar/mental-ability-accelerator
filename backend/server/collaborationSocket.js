/**
 * Real-time collaboration WebSocket handler.
 * Syncs: questions, answers, leaderboard updates, chat.
 */
const { getParticipants, updateParticipantScore, getSessionById } = require('../models/collaborationModel');

function attachCollaborationSocket(io) {
  const sessionRooms = new Map();

  io.on('connection', (socket) => {
    socket.on('join-session', async (payload, callback) => {
      const { sessionId, userId, name } = payload || {};
      if (!sessionId || !userId) {
        return callback && callback({ error: 'sessionId and userId required' });
      }
      const room = `session:${sessionId}`;
      await socket.join(room);
      sessionRooms.set(socket.id, { sessionId, userId });
      socket.to(room).emit('participant-joined', { userId, name });
      const participants = await getParticipants(sessionId);
      callback && callback({ ok: true, participants });
    });

    socket.on('leave-session', () => {
      const data = sessionRooms.get(socket.id);
      if (data) {
        socket.to(`session:${data.sessionId}`).emit('participant-left', { userId: data.userId });
        sessionRooms.delete(socket.id);
      }
    });

    socket.on('sync-question', (payload) => {
      const data = sessionRooms.get(socket.id);
      if (data) socket.to(`session:${data.sessionId}`).emit('question-display', payload);
    });

    socket.on('sync-answer', async (payload) => {
      const data = sessionRooms.get(socket.id);
      if (!data) return;
      const { questionId, selectedOption, isCorrect, score, answersCorrect } = payload || {};
      if (score != null && answersCorrect != null) {
        await updateParticipantScore(data.sessionId, data.userId, score, answersCorrect);
      }
      socket.to(`session:${data.sessionId}`).emit('answer-update', { userId: data.userId, ...payload });
      const participants = await getParticipants(data.sessionId);
      io.to(`session:${data.sessionId}`).emit('leaderboard-update', { participants });
    });

    socket.on('leaderboard-request', async () => {
      const data = sessionRooms.get(socket.id);
      if (!data) return;
      const participants = await getParticipants(data.sessionId);
      socket.emit('leaderboard-update', { participants });
    });

    socket.on('chat', (payload) => {
      const data = sessionRooms.get(socket.id);
      if (data) {
        socket.to(`session:${data.sessionId}`).emit('chat-message', {
          userId: data.userId,
          name: payload.name,
          message: payload.message,
          at: new Date().toISOString()
        });
      }
    });

    socket.on('timer-sync', (payload) => {
      const data = sessionRooms.get(socket.id);
      if (data) socket.to(`session:${data.sessionId}`).emit('timer-update', payload);
    });

    socket.on('disconnect', () => {
      const data = sessionRooms.get(socket.id);
      if (data) {
        socket.to(`session:${data.sessionId}`).emit('participant-left', { userId: data.userId });
        sessionRooms.delete(socket.id);
      }
    });
  });

  return io;
}

module.exports = { attachCollaborationSocket };
