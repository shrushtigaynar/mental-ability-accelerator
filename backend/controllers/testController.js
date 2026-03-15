const ApiError = require('../utils/ApiError');
const { getRandomQuestions, getQuestionsByIds } = require('../models/questionModel');
const { createTest, insertUserAnswers, getTopicWiseAccuracyForTest } = require('../models/testModel');
const { getStreak, upsertStreak } = require('../models/leaderboardModel');
const { computeAndSaveCognitiveProfile } = require('../services/cognitiveService');

async function getDiagnosticQuestions(req, res, next) {
  try {
    const questions = await getRandomQuestions(20);

    const sanitized = questions.map((q) => ({
      id: q.id,
      topic_id: q.topic_id,
      topic_name: q.topic_name,
      question_text: q.question_text,
      options: {
        A: q.option_a,
        B: q.option_b,
        C: q.option_c,
        D: q.option_d
      },
      difficulty: q.difficulty
    }));

    return res.json({ questions: sanitized });
  } catch (err) {
    next(err);
  }
}

async function submitDiagnosticTest(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, 'User context missing for test submission');
    }

    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      throw new ApiError(400, 'Answers array is required');
    }

    const questionIds = answers.map((a) => a.questionId);
    const uniqueQuestionIds = [...new Set(questionIds)];

    const questions = await getQuestionsByIds(uniqueQuestionIds);
    if (questions.length !== uniqueQuestionIds.length) {
      throw new ApiError(400, 'Some questions could not be found');
    }

    const questionById = new Map();
    questions.forEach((q) => {
      questionById.set(q.id, q);
    });

    let correctCount = 0;
    let totalTime = 0;

    const processedAnswers = answers.map((a) => {
      const question = questionById.get(a.questionId);

      const selectedOption = String(a.selectedOption || '').toUpperCase();
      const timeSpent = Number.isFinite(a.timeSpent) ? a.timeSpent : 0;
      const timeTakenSeconds = Number.isFinite(a.timeTakenSeconds) ? a.timeTakenSeconds : timeSpent;
      const confidenceLevel = a.confidenceLevel != null ? Math.min(5, Math.max(1, parseInt(a.confidenceLevel, 10))) : null;
      const attemptType = typeof a.attemptType === 'string' ? a.attemptType.slice(0, 50) : null;

      const isCorrect = selectedOption === question.correct_option;

      if (isCorrect) correctCount++;

      totalTime += timeSpent;

      return {
        questionId: a.questionId,
        selectedOption,
        isCorrect,
        timeSpent,
        timeTakenSeconds,
        confidenceLevel,
        attemptType
      };
    });

    const totalQuestions = answers.length;
    const accuracyPercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    const test = await createTest({
      userId: user.id,
      totalScore: correctCount,
      accuracyPercentage,
      totalTime
    });

    await insertUserAnswers(test.id, processedAnswers);

    const topicWise = await getTopicWiseAccuracyForTest(test.id);

    const today = new Date().toISOString().slice(0, 10);
    const streakRow = await getStreak(user.id);
    let newStreak = 1;
    if (streakRow) {
      const last = streakRow.last_activity_date ? new Date(streakRow.last_activity_date).toISOString().slice(0, 10) : null;
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (last === yesterday) newStreak = (streakRow.streak_count || 0) + 1;
      else if (last !== today) newStreak = 1;
      else newStreak = streakRow.streak_count || 1;
    }
    await upsertStreak(user.id, newStreak, today);

    setImmediate(() => {
      computeAndSaveCognitiveProfile(user.id).catch(() => {});
    });

    return res.status(201).json({
      testSummary: {
        test_id: test.id,
        total_score: test.total_score,
        accuracy_percentage: test.accuracy_percentage,
        total_time: test.total_time,
        created_at: test.created_at
      },
      topicWiseAccuracy: topicWise
    });
  } catch (err) {
    next(err);
  }
}

async function getTestResult(req, res, next) {
  try {
    const { testId } = req.params;

    const topicStats = await getTopicWiseAccuracyForTest(testId);

    res.json({
      testId,
      topicStats
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDiagnosticQuestions,
  submitDiagnosticTest,
  getTestResult
};


