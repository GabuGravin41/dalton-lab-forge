// Local dictionary-based sentiment analyzer to run 100% offline in browser cache

const POSITIVE_WORDS: Record<string, number> = {
  "love": 4, "loved": 4, "loves": 4, "loving": 4,
  "excellent": 4, "excellent!": 4, "excel": 3, "excels": 3,
  "amazing": 4, "amazed": 4, "awesome": 4, "awesomely": 4,
  "beautiful": 3, "beautifully": 3, "wonderful": 4, "wonderfully": 4,
  "exciting": 3, "excited": 3, "excite": 2, "excitement": 3,
  "success": 3, "successful": 3, "successfully": 3, "succeed": 3,
  "enjoy": 2, "enjoyed": 2, "enjoying": 2, "enjoyment": 3,
  "glad": 2, "support": 2, "supported": 2, "supporting": 2,
  "recommend": 2, "recommended": 2, "recommends": 2,
  "positive": 2, "positively": 2, "best": 3, "smart": 2,
  "intelligence": 2, "intelligent": 2, "precise": 2, "precision": 2,
  "nice": 2, "nicely": 2, "perfect": 4, "perfected": 4, "perfectly": 4,
  "good": 2, "great": 3, "happy": 3, "happily": 3, "happiness": 4,
  "cool": 2, "fantastic": 4, "fantastically": 4, "superb": 4,
  "outstanding": 4, "brilliant": 4, "brilliantly": 4,
  "optimistic": 2, "optimism": 2, "pleasure": 3, "pleased": 3,
  "satisfied": 3, "satisfy": 2, "satisfying": 3,
  "win": 3, "winner": 3, "winning": 3, "won": 3,
  "trust": 2, "trusted": 2, "trusting": 2, "worthy": 2,
  "kind": 2, "friendly": 2, "gentle": 2, "safe": 2, "safely": 2,
  "clean": 2, "cleanly": 2, "creative": 2, "innovative": 3,
  "innovation": 3, "progress": 2, "progressive": 2,
  "helpful": 2, "help": 1, "helped": 1, "helping": 1,
  "agree": 1, "agreed": 1, "agrees": 1, "agreement": 2,
  "hope": 2, "hopeful": 2, "hoping": 2, "valuable": 3,
  "value": 2, "proud": 3, "praise": 3, "praised": 3
};

const NEGATIVE_WORDS: Record<string, number> = {
  "hate": -4, "hated": -4, "hating": -4, "hates": -4,
  "sad": -3, "saddened": -3, "sadly": -3, "sadness": -3,
  "poor": -2, "poorly": -2, "terrible": -4, "terribly": -4,
  "horrible": -4, "horribly": -4, "fail": -3, "failed": -3,
  "failing": -3, "fails": -3, "failure": -3, "failures": -3,
  "error": -2, "errors": -2, "erroneous": -2,
  "bug": -2, "bugs": -2, "wrong": -2, "wrongly": -2,
  "break": -2, "broken": -2, "breaking": -2, "breaks": -2,
  "defect": -3, "defects": -3, "defective": -3,
  "issue": -1, "issues": -1, "limit": -1, "limited": -1,
  "limitation": -2, "limitations": -2,
  "warning": -1, "warnings": -1, "warned": -1,
  "danger": -3, "dangerous": -3, "dangerously": -3,
  "slow": -2, "slowly": -2, "slowing": -2, "slows": -2,
  "block": -2, "blocked": -2, "blocking": -2, "blocks": -2,
  "crash": -3, "crashed": -3, "crashing": -3, "crashes": -3,
  "bad": -2, "badly": -2, "worse": -3, "worst": -4,
  "annoy": -2, "annoyed": -2, "annoying": -2, "annoys": -2,
  "angry": -3, "angrily": -3, "anger": -3,
  "frustrated": -3, "frustrating": -3, "frustration": -3,
  "boring": -2, "bored": -2, "bore": -2,
  "disappointed": -3, "disappointing": -3, "disappointment": -3,
  "ugly": -3, "dirty": -2, "waste": -2, "wasted": -2,
  "useless": -3, "scared": -2, "afraid": -2, "fear": -3,
  "lonely": -2, "depressed": -4, "depression": -4,
  "pain": -3, "painful": -3, "hurt": -2, "hurts": -2,
  "sorry": -1, "fault": -2, "blame": -2, "criticize": -2,
  "problem": -2, "problems": -2, "difficult": -2,
  "hard": -1, "stuck": -2, "stupid": -3, "dumb": -3,
  "weird": -1, "bizarre": -1, "crazy": -1, "insane": -2,
  "kill": -3, "killed": -3, "killing": -3, "die": -3, "dead": -3
};

export interface LocalSentimentResult {
  emotion: string;
  confidence: number;
  feedback: string;
  score: number;
}

/**
 * Analyzes the sentiment of a given text 100% client-side.
 */
export const analyzeSentimentLocally = (text: string): LocalSentimentResult => {
  if (!text || !text.trim()) {
    return {
      emotion: "Neutral",
      confidence: 1.0,
      feedback: "No text was provided for analysis.",
      score: 0
    };
  }

  const tokens = text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
    .split(/\s+/);

  let totalScore = 0;
  let matchingWordsCount = 0;

  tokens.forEach((token) => {
    if (POSITIVE_WORDS[token] !== undefined) {
      totalScore += POSITIVE_WORDS[token];
      matchingWordsCount++;
    } else if (NEGATIVE_WORDS[token] !== undefined) {
      totalScore += NEGATIVE_WORDS[token];
      matchingWordsCount++;
    }
  });

  let normalizedScore = 0;
  if (matchingWordsCount > 0) {
    const avgWeight = totalScore / matchingWordsCount;
    normalizedScore = Math.max(-1, Math.min(1, avgWeight / 4));
  }

  const confidence = matchingWordsCount > 0 
    ? Math.min(0.95, 0.5 + (matchingWordsCount * 0.1) + (Math.abs(normalizedScore) * 0.2))
    : 0.5;

  let emotion = "Neutral";
  let feedback = "";

  if (normalizedScore > 0.5) {
    emotion = "Joy / Positive";
    feedback = "The text exhibits strong positive sentiment with terms of satisfaction or delight.";
  } else if (normalizedScore > 0.1) {
    emotion = "Optimistic / Positive";
    feedback = "The text has a generally positive and pleasant tone.";
  } else if (normalizedScore < -0.5) {
    emotion = "Sadness / Anger";
    feedback = "The text contains strong negative expressions indicating frustration, trouble, or failure.";
  } else if (normalizedScore < -0.1) {
    emotion = "Concerned / Negative";
    feedback = "The text contains some expressions of concern, difficulty, or mild negativity.";
  } else {
    emotion = "Neutral";
    feedback = "The tone appears objective or balanced, without notable positive or negative keywords.";
  }

  return {
    emotion,
    confidence: parseFloat(confidence.toFixed(2)),
    feedback,
    score: parseFloat(normalizedScore.toFixed(2))
  };
};
