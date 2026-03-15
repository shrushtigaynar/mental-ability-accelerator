const ApiError = require('../utils/ApiError');
const {
  createSession,
  getSessionById,
  getSessionByInviteCode,
  createInvite,
  getInviteByToken,
  addParticipant,
  getParticipants,
  getActiveSessionsForUser
} = require('../models/collaborationModel');
const { getQuestionsByIds } = require('../models/questionModel');

async function createSessionHandler(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Authentication required');
    const { question_ids, time_limit_seconds } = req.body || {};
    const session = await createSession(userId, {
      questionIds: Array.isArray(question_ids) ? question_ids : [],
      timeLimitSeconds: time_limit_seconds || 1800
    });
    return res.status(201).json({
      session_id: session.id,
      invite_code: session.invite_code,
      status: session.status,
      time_limit_seconds: session.time_limit_seconds,
      created_at: session.created_at
    });
  } catch (err) {
    next(err);
  }
}

async function inviteHandler(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Authentication required');
    const { session_id, email } = req.body || {};
    if (!session_id || !email) throw new ApiError(400, 'session_id and email required');
    const session = await getSessionById(session_id);
    if (!session) throw new ApiError(404, 'Session not found');
    if (session.host_user_id !== userId) throw new ApiError(403, 'Only host can invite');
    if (session.status !== 'active') throw new ApiError(400, 'Session is not active');
    const { token, expiresAt } = await createInvite(session_id, email, 60);
    const inviteLink = `${req.protocol}://${req.get('host')}/api/collaboration/join?token=${token}`;
    return res.status(201).json({
      message: 'Invite sent',
      invite_link: inviteLink,
      expires_at: expiresAt
    });
  } catch (err) {
    next(err);
  }
}

async function joinByTokenHandler(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Authentication required');
    const token = req.query.token || req.params.token;
    if (!token) throw new ApiError(400, 'token required');
    const invite = await getInviteByToken(token);
    if (!invite) throw new ApiError(404, 'Invalid or expired invite token');
    if (invite.session_status !== 'active') throw new ApiError(400, 'Session is no longer active');
    const participant = await addParticipant(invite.session_id, userId);
    const session = await getSessionById(invite.session_id);
    const participants = await getParticipants(invite.session_id);
    let questions = [];
    if (session.question_ids && session.question_ids.length > 0) {
      questions = await getQuestionsByIds(session.question_ids);
    }
    return res.json({
      joined: true,
      session_id: session.id,
      invite_code: session.invite_code,
      time_limit_seconds: session.time_limit_seconds,
      participants: participants.map((p) => ({ user_id: p.user_id, name: p.name, score: p.score, answers_correct: p.answers_correct })),
      questions: questions.map((q) => ({
        id: q.id,
        topic_name: q.topic_name,
        question_text: q.question_text,
        options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
        difficulty: q.difficulty
      }))
    });
  } catch (err) {
    next(err);
  }
}

async function joinBySessionIdHandler(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Authentication required');
    const sessionId = parseInt(req.params.sessionId, 10);
    if (!sessionId) throw new ApiError(400, 'sessionId required');
    const session = await getSessionById(sessionId);
    if (!session) throw new ApiError(404, 'Session not found');
    if (session.status !== 'active') throw new ApiError(400, 'Session is not active');
    await addParticipant(sessionId, userId);
    const participants = await getParticipants(sessionId);
    let questions = [];
    if (session.question_ids && session.question_ids.length > 0) {
      questions = await getQuestionsByIds(session.question_ids);
    }
    return res.json({
      joined: true,
      session_id: session.id,
      invite_code: session.invite_code,
      time_limit_seconds: session.time_limit_seconds,
      participants: participants.map((p) => ({ user_id: p.user_id, name: p.name, score: p.score, answers_correct: p.answers_correct })),
      questions: questions.map((q) => ({
        id: q.id,
        topic_name: q.topic_name,
        question_text: q.question_text,
        options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
        difficulty: q.difficulty
      }))
    });
  } catch (err) {
    next(err);
  }
}

async function getMySessionsHandler(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Authentication required');
    const sessions = await getActiveSessionsForUser(userId);
    return res.json({ sessions });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createSessionHandler,
  inviteHandler,
  joinByTokenHandler,
  joinBySessionIdHandler,
  getMySessionsHandler
};
