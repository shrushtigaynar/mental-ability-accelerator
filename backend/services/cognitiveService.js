const { getAnswerStatsForUser, upsertCognitiveProfile, getCognitiveProfile } = require('../models/cognitiveModel');

/** Thresholds: time in seconds */
const VERY_FAST = 15;   // under this = possible guess
const VERY_SLOW = 180;  // over this = possible overthinking

/**
 * Compute guessing index: proportion of answers that are very fast + wrong.
 */
function computeGuessingIndex(stats) {
  if (!stats.length) return 0;
  const fastWrong = stats.filter((s) => (s.time_seconds || 0) <= VERY_FAST && !s.is_correct).length;
  return Math.round((fastWrong / stats.length) * 100) / 100;
}

/**
 * Compute overthinking index: proportion of answers that are very slow + wrong.
 */
function computeOverthinkingIndex(stats) {
  if (!stats.length) return 0;
  const slowWrong = stats.filter((s) => (s.time_seconds || 0) >= VERY_SLOW && !s.is_correct).length;
  return Math.round((slowWrong / stats.length) * 100) / 100;
}

/**
 * Average speed (seconds per question).
 */
function computeAvgSpeed(stats) {
  const withTime = stats.filter((s) => s.time_seconds != null && s.time_seconds > 0);
  if (!withTime.length) return null;
  const sum = withTime.reduce((a, s) => a + Number(s.time_seconds), 0);
  return Math.round((sum / withTime.length) * 100) / 100;
}

/**
 * Overall accuracy from stats.
 */
function computeAccuracy(stats) {
  if (!stats.length) return null;
  const correct = stats.filter((s) => s.is_correct).length;
  return Math.round((correct / stats.length) * 100 * 100) / 100;
}

/**
 * Confidence score (average confidence_level 1-5 if present).
 */
function computeConfidenceScore(stats) {
  const withConf = stats.filter((s) => s.confidence_level != null);
  if (!withConf.length) return null;
  const sum = withConf.reduce((a, s) => a + Number(s.confidence_level), 0);
  return Math.round((sum / withConf.length) * 100) / 100;
}

/**
 * Recompute and persist user cognitive profile.
 */
async function computeAndSaveCognitiveProfile(userId) {
  const stats = await getAnswerStatsForUser(userId);
  const avg_speed = computeAvgSpeed(stats);
  const accuracy = computeAccuracy(stats);
  const guessing_index = computeGuessingIndex(stats);
  const overthinking_index = computeOverthinkingIndex(stats);

  await upsertCognitiveProfile(userId, {
    avg_speed,
    accuracy,
    guessing_index,
    overthinking_index
  });

  return getCognitiveProfile(userId);
}

/**
 * Get cognitive profile; compute if missing or stale.
 */
async function getOrComputeCognitiveProfile(userId, forceRecompute = false) {
  let profile = await getCognitiveProfile(userId);
  if (forceRecompute || !profile) {
    profile = await computeAndSaveCognitiveProfile(userId);
  }
  const stats = await getAnswerStatsForUser(userId, 100);
  const confidence_score = computeConfidenceScore(stats);
  const speed_score = profile && profile.avg_speed != null ? (1 / (1 + profile.avg_speed / 60)) : null;

  return {
    user_id: userId,
    avg_speed: profile ? Number(profile.avg_speed) : null,
    accuracy: profile ? Number(profile.accuracy) : null,
    guessing_index: profile ? Number(profile.guessing_index) : null,
    overthinking_index: profile ? Number(profile.overthinking_index) : null,
    confidence_score,
    speed_score: speed_score != null ? Math.round(speed_score * 100) / 100 : null,
    last_updated: profile ? profile.last_updated : null,
    behaviors: {
      guessing: (profile && Number(profile.guessing_index) > 0.25) || false,
      overthinking: (profile && Number(profile.overthinking_index) > 0.25) || false
    }
  };
}

module.exports = {
  computeAndSaveCognitiveProfile,
  getOrComputeCognitiveProfile,
  computeGuessingIndex,
  computeOverthinkingIndex,
  computeAvgSpeed,
  computeAccuracy,
  computeConfidenceScore
};
