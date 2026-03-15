import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPracticeQuestions, submitTestResults, TRAINING_TOPICS } from "../api/practice.js";
import { getToken } from "../utils/auth.js";

const QUESTION_TIME_SECONDS = 45;

function normalizeOptions(rawOptions, currentQuestion) {
  // Handle database columns: option_a, option_b, option_c, option_d
  if (currentQuestion?.option_a || currentQuestion?.option_b || currentQuestion?.option_c || currentQuestion?.option_d) {
    const optionsArray = [
      currentQuestion?.option_a || currentQuestion?.options?.A,
      currentQuestion?.option_b || currentQuestion?.options?.B,
      currentQuestion?.option_c || currentQuestion?.options?.C,
      currentQuestion?.option_d || currentQuestion?.options?.D,
    ].filter(Boolean);
    return optionsArray;
  }
  
  // Handle original options format
  if (!rawOptions) return [];
  if (Array.isArray(rawOptions)) return rawOptions.slice(0, 4);

  if (typeof rawOptions === "object") {
    const asArray = [rawOptions.A, rawOptions.B, rawOptions.C, rawOptions.D];
    return asArray.filter((v) => v !== undefined).slice(0, 4);
  }

  return [];
}

function getCorrectIndex(question, options) {
  const raw =
    question?.correctIndex ??
    question?.correctOptionIndex ??
    question?.correctOption ??
    question?.correctAnswer ??
    question?.answer;

  if (typeof raw === "number" && raw >= 0 && raw < options.length) return raw;

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    const letter = trimmed.toUpperCase();
    if (["A", "B", "C", "D"].includes(letter)) return letter.charCodeAt(0) - 65;

    const byText = options.findIndex(
      (opt) => String(opt).trim() === String(trimmed).trim(),
    );
    if (byText >= 0) return byText;
  }

  return -1;
}

function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case "Easy": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
    case "Medium": return "bg-amber-500/20 text-amber-300 border-amber-500/50";
    case "Hard": return "bg-rose-500/20 text-rose-300 border-rose-500/50";
    default: return "bg-slate-700/40 text-slate-200 border-slate-600";
  }
}

function getPerformanceMessage(correct) {
  if (correct >= 13) return "Excellent! You're interview ready! 🏆";
  if (correct >= 10) return "Good job! Keep practicing! 💪";
  if (correct >= 7) return "Getting there! Focus on weak areas 📚";
  return "Need more practice. Check AI Recommendations 🎯";
}

export default function SpeedTraining() {
  const navigate = useNavigate();
  const token = useMemo(() => getToken(), []);
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1); // 1: topics, 2: difficulty, 3: questions, 4: results
  
  // Topic selection state
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  // Difficulty selection state
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  
  // Questions state
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [answers, setAnswers] = useState([]);
  
  const QUESTIONS_PER_SESSION = questions.length || 10;
  
  // Question navigation state
  const [questionStatuses, setQuestionStatuses] = useState({});
  const [visitedQuestions, setVisitedQuestions] = useState(new Set());
  
  // Results state
  const [sessionEndTime, setSessionEndTime] = useState(null);

  const advanceTimeoutRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const sessionStartRef = useRef(Date.now());

  const topics = TRAINING_TOPICS.speed;
  const currentQuestion = questions?.[questionIndex] ?? null;
  const currentOptions = useMemo(
    () => normalizeOptions(currentQuestion?.options, currentQuestion),
    [currentQuestion],
  );
  const correctIndex = useMemo(
    () => getCorrectIndex(currentQuestion, currentOptions),
    [currentQuestion, currentOptions],
  );

  const isFinished = !loading && questions.length > 0 && questionIndex >= questions.length;
  const totalQuestions = questions.length;

  // Simple single timer effect
  useEffect(() => {
    if (currentStep !== 3 || loading || !questions.length || questionIndex >= questions.length) {
      // Clear timer when not in question step
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    // Mark question as visited when first accessed
    if (!visitedQuestions.has(questionIndex)) {
      setVisitedQuestions(prev => new Set([...prev, questionIndex]));
    }

    // Reset timer to 45 seconds when question changes
    setTimeLeft(QUESTION_TIME_SECONDS);

    // Clear any existing timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    // Start new timer
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Timer reached 0, handle timeout
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [currentStep, loading, questionIndex, questions.length, visitedQuestions]);

  const handleTimeout = useCallback(() => {
  const currentQ = questions[questionIndex];
  if (!currentQ) return;
  
  // Record as timed out
  setAnswers(prev => {
    const existing = prev.find(a => a.questionId === currentQ.id);
    if (existing) return prev;
    return [...prev, {
      questionId: currentQ.id,
      selectedOption: null,
      is_correct: false,
      timeSpent: 45,
      timeTakenSeconds: 45,
      confidenceLevel: null,
      attemptType: null
    }];
  });
  
  setQuestionStatuses(prev => ({
    ...prev,
    [questionIndex]: 'timeout'
  }));

  // Move to NEXT question only
  const nextIndex = questionIndex + 1;
  if (nextIndex < questions.length) {
    setQuestionIndex(nextIndex);
    setTimeLeft(45);
    setSelectedIndex(null); // Reset selection for next question
  }
  // Let the natural flow handle session completion when questionIndex >= questions.length
}, [questionIndex, questions]);

  const handleQuestionNavigation = (targetIndex) => {
    if (targetIndex >= 0 && targetIndex < questions.length) {
      setQuestionIndex(targetIndex);
      setSelectedIndex(null);
    }
  };

  const getQuestionStatus = (qIndex) => {
    // Check if status is already set (from answer or timeout)
    if (questionStatuses[qIndex]) return questionStatuses[qIndex];
    
    // Check if answer exists in answers array
    const answer = answers.find(a => a.question_id === (questions[qIndex]?.id || qIndex));
    if (answer) {
      if (answer.selected_option === null) return 'timeout';
      return answer.is_correct ? 'correct' : 'wrong';
    }
    
    // If questionIndex > currentQuestionIndex AND no answer exists → always return 'unattempted'
    if (qIndex > questionIndex && !answer) {
      return 'unattempted';
    }
    
    // Only mark as unattempted if question hasn't been visited
    return visitedQuestions.has(qIndex) ? 'unattempted' : 'unattempted';
  };

  const handleAnswer = (index) => {
    if (selectedIndex !== null || currentStep !== 3) return;
    
    const questionStartTime = Date.now();
    setSelectedIndex(index);

    const correctLetter = (
      currentQuestion?.correct_answer || 
      currentQuestion?.correct_option || ''
    ).toString().trim().toUpperCase();
    const selectedLetter = String.fromCharCode(65 + index);
    const isCorrect = selectedLetter === correctLetter;
    const timeTaken = QUESTION_TIME_SECONDS - timeLeft;
    
    console.log('correct_answer raw:', currentQuestion?.correct_answer);
    console.log('correct_option raw:', currentQuestion?.correct_option);
    console.log('correctLetter after processing:', correctLetter);
    console.log('selectedLetter:', selectedLetter);
    console.log('isCorrect:', isCorrect);
    
    // Update question status
    setQuestionStatuses(prev => ({
      ...prev,
      [questionIndex]: isCorrect ? 'correct' : 'wrong'
    }));
    
    // Record answer
    const answerRecord = {
      questionId: currentQuestion?.id,
      selectedOption: selectedLetter,
      is_correct: isCorrect,
      timeSpent: timeTaken,
      timeTakenSeconds: timeTaken,
      confidenceLevel: null,
      attemptType: null
    };
    
    // Update or add answer
    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === answerRecord.questionId);
      if (existingIndex === -1) {
        return [...prev, answerRecord];
      }
      const newAnswers = [...prev];
      newAnswers[existingIndex] = answerRecord;
      return newAnswers;
    });

    // Show feedback and advance after 2 seconds
    advanceTimeoutRef.current = setTimeout(() => {
      setQuestionIndex((i) => i + 1);
      setSelectedIndex(null);
    }, 2000);
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setCurrentStep(2);
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setCurrentStep(3);
    loadQuestions();
  };

  const loadQuestions = async () => {
    setLoading(true);
    sessionStartRef.current = Date.now();
    setSessionStartTime(Date.now());
    
    try {
      const data = await getPracticeQuestions(token, "speed", selectedTopic?.name, selectedDifficulty);
      const list = Array.isArray(data) ? data : data?.questions;
      // Use all questions returned by API
      setQuestions(Array.isArray(list) ? list : []);
      setQuestionIndex(0);
      setAnswers([]);
      // Reset navigation state
      setQuestionStatuses({});
      setVisitedQuestions(new Set());
    } catch (error) {
      console.error('Failed to load questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTopics = () => {
    setCurrentStep(1);
    setSelectedTopic(null);
    setSelectedDifficulty(null);
    setQuestions([]);
    setAnswers([]);
  };

  const handleBackToDifficulty = () => {
    setCurrentStep(2);
    setQuestions([]);
    setAnswers([]);
    setQuestionIndex(0);
  };

  const handleTryAgain = () => {
    setCurrentStep(1);
    setSelectedTopic(null);
    setSelectedDifficulty(null);
    setQuestions([]);
    setAnswers([]);
    setQuestionIndex(0);
    setSessionEndTime(null);
    // Reset navigation state
    setQuestionStatuses({});
    setVisitedQuestions(new Set());
  };

  // Submit results when session ends
  useEffect(() => {
    if (isFinished && answers.length === totalQuestions && !sessionEndTime) {
      setSessionEndTime(Date.now());
      submitResults();
    }
  }, [isFinished, answers.length, sessionEndTime, totalQuestions]);

  const submitResults = async () => {
    try {
      const answersArray = Array.isArray(answers) ? answers : Object.values(answers);
      const token = localStorage.getItem('maa_token');
      console.log('Submitting answers:', JSON.stringify(answersArray));
      console.log('Token:', token);
      await submitTestResults(answersArray, token);
    } catch (error) {
      console.error('Failed to submit results:', error);
    }
  };

  const correctCount = Object.values(questionStatuses).filter(status => status === 'correct').length;
  const wrongCount = Object.values(questionStatuses).filter(status => status === 'wrong').length;
  const timeoutCount = Object.values(questionStatuses).filter(status => status === 'timeout').length;
  const accuracyPct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const totalSeconds = Math.floor((Date.now() - sessionStartRef.current) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

const getOptionStyle = (idx) => {
  if (selectedIndex === null) {
    return "cursor-pointer w-full text-left px-4 py-3 rounded-lg border border-slate-700 bg-slate-900/80 hover:border-slate-500 transition";
  }
  const letter = String.fromCharCode(65 + idx);
  const correctLetter = (currentQuestion?.correct_answer || '')
    .toString().trim().toUpperCase();
  if (letter === correctLetter) {
    return "cursor-pointer w-full text-left px-4 py-3 rounded-lg border border-green-500 bg-green-900/30 transition font-semibold";
  }
  if (idx === selectedIndex) {
    return "cursor-pointer w-full text-left px-4 py-3 rounded-lg border border-red-500 bg-red-900/30 transition";
  }
  return "cursor-pointer w-full text-left px-4 py-3 rounded-lg border border-slate-700 bg-slate-900/80 transition opacity-50";
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-50">
      <div className="w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-[0_18px_45px_rgba(15,23,42,0.8)] backdrop-blur">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
              Training • Speed
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {currentStep === 1 && "Speed Challenges"}
              {currentStep === 2 && selectedTopic?.name}
              {currentStep === 3 && selectedTopic?.name}
              {currentStep === 4 && "Session Complete! 🎉"}
            </h1>
            <p className="mt-2 text-xs text-slate-400 sm:text-sm">
              {currentStep === 1 && "Select a topic to practice"}
              {currentStep === 2 && "Choose your difficulty"}
              {currentStep === 3 && `Question ${Math.min(questionIndex + 1, totalQuestions)} of ${totalQuestions}`}
              {currentStep === 4 && getPerformanceMessage(correctCount)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
          >
            Back to dashboard
          </button>
        </div>

        {/* Step 1: Topic Selection */}
        {currentStep === 1 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition hover:border-slate-700 hover:bg-slate-900/90"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{topic.name}</h3>
                    <p className="mt-2 text-sm text-slate-400">{topic.description}</p>
                    <div className="mt-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}>
                        {topic.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTopicSelect(topic)}
                  className="mt-4 w-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-400 hover:to-fuchsia-400"
                >
                  Start Practice →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Difficulty Selection */}
        {currentStep === 2 && (
          <div className="mt-8 space-y-4">
            <button
              type="button"
              onClick={handleBackToTopics}
              className="rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              ← Back
            </button>
            <div className="grid gap-4 sm:grid-cols-3">
              {['Easy', 'Medium', 'Hard'].map((difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => handleDifficultySelect(difficulty)}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-left transition hover:border-slate-700 hover:bg-slate-900/90"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{difficulty}</h3>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getDifficultyColor(difficulty)}`}>
                      15 questions
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    {difficulty === 'Easy' && 'Perfect for building confidence'}
                    {difficulty === 'Medium' && 'Balanced challenge level'}
                    {difficulty === 'Hard' && 'Test your limits'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Questions */}
        {currentStep === 3 && (
          <>
            {loading ? (
              <div className="mt-8 space-y-4">
                <div className="h-5 w-48 animate-pulse rounded-lg bg-slate-800/80" />
                <div className="h-16 w-full animate-pulse rounded-2xl bg-slate-800/60" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-12 animate-pulse rounded-2xl bg-slate-800/60"
                    />
                  ))}
                </div>
              </div>
            ) : !questions.length ? (
              <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-center">
                <p className="text-sm text-slate-200">
                  No questions available. Please check back later.
                </p>
              </div>
            ) : isFinished ? (
              <div className="mt-10 space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">
                    Results
                  </p>
                  <p className="mt-3 text-xl font-semibold text-white">
                    Score {correctCount}/{totalQuestions}
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                      <p className="text-xs text-slate-400">Accuracy</p>
                      <p className="mt-2 text-2xl font-semibold text-emerald-300">
                        {accuracyPct}%
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                      <p className="text-xs text-slate-400">Correct</p>
                      <p className="mt-2 text-2xl font-semibold text-emerald-300">
                        {correctCount}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                      <p className="text-xs text-slate-400">Wrong</p>
                      <p className="mt-2 text-2xl font-semibold text-rose-300">
                        {wrongCount}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                      <p className="text-xs text-slate-400">Skipped</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-400">
                        {timeoutCount}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <p className="text-xs text-slate-400">Time taken</p>
                    <p className="mt-2 text-2xl font-semibold text-sky-300">
                      {minutes}m {seconds}s
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    className="flex-1 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-400 hover:to-fuchsia-400"
                    onClick={() => navigate("/dashboard")}
                  >
                    Back to Dashboard
                  </button>
                  <button
                    type="button"
                    className="flex-1 inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-700"
                    onClick={handleTryAgain}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-6 mt-8">
                {/* Main Question Content */}
                <div className="flex-1 space-y-4">
                  {/* Progress Bar */}
                  <div className="w-full">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Progress</span>
                      <span>{Math.min(questionIndex + 1, totalQuestions)} / {totalQuestions}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
                        style={{ width: `${((Math.min(questionIndex + 1, totalQuestions)) / totalQuestions) * 100}%` }}
                      />
                    </div>
                  </div>

                {/* Timer */}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">
                    Question {questionIndex + 1} of {totalQuestions}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-14 items-center justify-center rounded-full border text-sm font-semibold transition ${
                      timeLeft <= 10 
                        ? 'border-red-500/60 bg-red-500/20 text-red-200' 
                        : 'border-violet-500/60 bg-slate-900/80 text-violet-200'
                    }`}>
                      {timeLeft}s
                    </div>
                  </div>
                </div>

                {/* Question */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Question
                  </p>
                  <p className="mt-2 text-sm text-slate-100">
                    {currentQuestion?.question_text ?? "Question text unavailable."}
                  </p>
                </div>

                {/* Options */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {currentOptions.map((option, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelected = selectedIndex === idx;
                    const showCorrectness = selectedIndex !== null;
                    const isCorrect = showCorrectness && idx === correctIndex;
                    const isWrong = showCorrectness && isSelected && idx !== correctIndex;

                    const base = "rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-left text-sm font-medium text-slate-100 transition cursor-pointer";
                    const selectedStyle = isSelected ? " border-blue-400/80 bg-blue-600 text-white" : " hover:border-violet-400/80 hover:text-violet-200";
                    const correctStyle = isCorrect ? " border-emerald-400/80 bg-green-600 text-emerald-200" : "";
                    const wrongStyle = isWrong ? " border-rose-400/80 bg-red-600 text-rose-200" : "";
                    const disabledStyle = selectedIndex !== null ? " cursor-not-allowed opacity-90" : "";
                    const showFeedback = selectedIndex !== null;
                    
                    const finalStyle = showFeedback ? `${base}${correctStyle}${wrongStyle}${disabledStyle}` : `${base}${selectedStyle}${disabledStyle}`;

                    return (
                      <button
                        key={`${letter}-${String(option)}`}
                        type="button"
                        onClick={() => handleAnswer(idx)}
                        disabled={selectedIndex !== null}
                        className={getOptionStyle(idx)}
                      >
                        <span className="mr-2 text-xs font-semibold text-slate-400">
                          {letter}.
                        </span>
                        {String(option)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Navigation Panel */}
              <div className="w-28 bg-slate-800 rounded-2xl p-3">
                <p className="text-xs font-medium text-slate-400 mb-3 text-center">Questions</p>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: QUESTIONS_PER_SESSION }).map((_, idx) => {
                    const status = getQuestionStatus(idx);
                    const isCurrent = idx === questionIndex;
                    
                    let circleClass = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition cursor-pointer ";
                    let icon = null;
                    
                    if (isCurrent) {
                      circleClass += "bg-blue-600 text-white border-2 border-blue-400";
                    } else if (status === 'correct') {
                      circleClass += "bg-emerald-600 text-white border border-emerald-500";
                      icon = "✓";
                    } else if (status === 'wrong') {
                      circleClass += "bg-rose-600 text-white border border-rose-500";
                      icon = "✗";
                    } else if (status === 'timeout') {
                      circleClass += "bg-orange-600 text-white border border-orange-500";
                      icon = "⏰";
                    } else {
                      circleClass += "bg-slate-700 text-slate-400 border border-slate-600 hover:border-slate-500";
                    }
                    
                    const isAnswered = status === 'correct' || status === 'wrong' || status === 'timeout';
                    
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuestionNavigation(idx)}
                        disabled={isAnswered && !isCurrent}
                        className={circleClass + (isAnswered && !isCurrent ? " cursor-not-allowed opacity-60" : " hover:scale-105")}
                        title={isAnswered ? (status === 'timeout' ? 'Timed out' : status === 'correct' ? 'Correct' : 'Wrong') : 'Not attempted'}
                      >
                        {icon || (idx + 1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  </div>
);
}

