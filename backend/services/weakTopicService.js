const { getTopicWisePerformance, getTopicMistakeFrequency } = require('../models/analyticsModel');

/**
 * Weak Topic Detection Engine.
 * Returns list of weakest topics for a user (low accuracy, high mistake frequency).
 */
async function getWeakTopics(userId, limit = 10) {
  const performance = await getTopicWisePerformance(userId);
  const withFrequency = await getTopicMistakeFrequency(userId);

  const weakList = withFrequency
    .map((row) => ({
      topic_id: row.topic_id,
      topic_name: row.topic_name,
      accuracy_percentage: row.accuracy_percentage,
      mistake_frequency: row.mistake_frequency,
      total_attempts: row.total_attempts,
      mistake_count: row.mistake_count
    }))
    .sort((a, b) => {
      if (a.accuracy_percentage !== b.accuracy_percentage) return a.accuracy_percentage - b.accuracy_percentage;
      return b.mistake_frequency - a.mistake_frequency;
    });

  return weakList.slice(0, limit);
}

module.exports = { getWeakTopics };
