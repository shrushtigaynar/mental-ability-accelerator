import axios from "axios";

const PRACTICE_BASE_URL = "http://localhost:4000/api/practice/modes";

export async function getPracticeQuestions(token, mode, topic, difficulty) {
  const params = new URLSearchParams();
  if (topic) params.append('topic', topic);
  if (difficulty) params.append('difficulty', difficulty);
  
  const url = `${PRACTICE_BASE_URL}/${encodeURIComponent(mode)}/questions${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getMemoryQuestions(token, topic, difficulty) {
  const params = new URLSearchParams();
  if (topic) params.append('topic', topic);
  if (difficulty) params.append('difficulty', difficulty);
  
  const url = `http://localhost:4000/api/practice/modes/deep-thinking/questions${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await axios.get(url);
  return response.data;
}

export async function getLogicQuestions(token, topic, difficulty) {
  const params = new URLSearchParams();
  if (topic) params.append('topic', topic);
  if (difficulty) params.append('difficulty', difficulty);
  
  const url = `http://localhost:4000/api/practice/modes/interview/questions${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await axios.get(url);
  return response.data;
}

export const submitTestResults = async (answers, token) => {
  try {
    const answersArray = Array.isArray(answers) ? answers : Object.values(answers);
    const response = await axios.post(
      'http://localhost:4000/api/tests/diagnostic/submit',
      { answers: answersArray },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('submitTestResults error:', error);
    throw error;
  }
};

export async function sendAIChatMessage(token, userId, message) {
  try {
    // Try backend endpoint first
    const response = await axios.post(
      "http://localhost:4000/api/recommendations/chat",
      { message, userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // If backend endpoint doesn't exist, call Anthropic API directly
    const anthropicResponse = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        system: "You are an expert aptitude coach helping students prepare for technical interviews. Give specific, actionable study tips for aptitude topics like number series, logical reasoning, blood relations, coding-decoding, direction sense, percentages, profit & loss. Keep answers concise and practical.",
        messages: [
          {
            role: "user",
            content: message
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "sk-ant-api03-key", // This would need to be provided
          "anthropic-version": "2023-06-01"
        }
      }
    );
    return { response: anthropicResponse.data.content[0].text };
  }
}

export async function getRecommendations(token, userId) {
  const response = await axios.get(
    `http://localhost:4000/api/practice/recommendations/${encodeURIComponent(userId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

// Topic data for each training mode
export const TRAINING_TOPICS = {
  speed: [
    {
      id: 'percentages',
      name: 'Percentages',
      description: 'Calculate percentages, ratios, and proportions',
      difficulty: 'Medium'
    },
    {
      id: 'profit-loss',
      name: 'Profit & Loss',
      description: 'Business math and financial calculations',
      difficulty: 'Medium'
    },
    {
      id: 'time-work',
      name: 'Time & Work',
      description: 'Calculate time, work, and efficiency problems',
      difficulty: 'Hard'
    },
    {
      id: 'time-speed-distance',
      name: 'Time, Speed & Distance',
      description: 'Motion, speed, and distance calculations',
      difficulty: 'Hard'
    },
    {
      id: 'ratio-proportion',
      name: 'Ratio & Proportion',
      description: 'Ratio analysis and proportional relationships',
      difficulty: 'Medium'
    }
  ],
  'deep-thinking': [
    {
      id: 'number-series',
      name: 'Number Series',
      description: 'Find patterns and complete number sequences',
      difficulty: 'Easy'
    },
    {
      id: 'missing-number-pattern',
      name: 'Missing Number Pattern',
      description: 'Identify missing numbers in patterns',
      difficulty: 'Medium'
    },
    {
      id: 'alphabet-series',
      name: 'Alphabet Series',
      description: 'Letter patterns and alphabet sequences',
      difficulty: 'Easy'
    },
    {
      id: 'analogy',
      name: 'Analogy',
      description: 'Relationship and similarity identification',
      difficulty: 'Medium'
    },
    {
      id: 'odd-one-out',
      name: 'Odd One Out',
      description: 'Identify the item that doesn\'t belong',
      difficulty: 'Easy'
    }
  ],
  interview: [
    {
      id: 'blood-relations',
      name: 'Blood Relations',
      description: 'Family tree and relationship puzzles',
      difficulty: 'Medium'
    },
    {
      id: 'coding-decoding',
      name: 'Coding-Decoding',
      description: 'Code language and pattern decoding',
      difficulty: 'Medium'
    },
    {
      id: 'direction-sense',
      name: 'Direction Sense',
      description: 'Navigation and direction-based problems',
      difficulty: 'Easy'
    },
    {
      id: 'syllogisms',
      name: 'Syllogisms',
      description: 'Logical reasoning and deductive arguments',
      difficulty: 'Hard'
    },
    {
      id: 'statement-conclusion',
      name: 'Statement & Conclusion',
      description: 'Logical inference and conclusion drawing',
      difficulty: 'Hard'
    }
  ]
};

