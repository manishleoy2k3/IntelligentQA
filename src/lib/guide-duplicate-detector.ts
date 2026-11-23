import { ConceptGuide, getAllGuides } from './concept-guides';
import { QADatabase } from './qa-db';
import { Lesson, Track } from '@/types/qa';

export interface DuplicateMatchItem {
  id: string;
  title: string;
  type: 'guide' | 'lesson';
  trackId: string;
  trackName: string;
  similarity: number; // 0 to 100
  matchReason: string;
}

export interface DuplicateCheckReport {
  status: 'unique' | 'potential_duplicate' | 'duplicate';
  similarityScore: number; // 0 to 100
  highestMatch?: DuplicateMatchItem;
  allMatches: DuplicateMatchItem[];
  recommendation: string;
  checkedAgainstCount: {
    guides: number;
    lessons: number;
  };
}

// Stopwords to ignore in keyword extraction
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when',
  'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'all', 'any', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should',
  'now', 'how', 'what', 'why', 'where', 'which', 'who', 'vs', 'versus',
  'using', 'via', 'guide', 'test', 'tests', 'testing'
]);

function normalizeString(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractKeywords(str: string): Set<string> {
  const words = normalizeString(str).split(' ');
  const keywords = new Set<string>();
  for (const w of words) {
    if (w.length > 2 && !STOPWORDS.has(w)) {
      keywords.add(w);
    }
  }
  return keywords;
}

// Jaccard similarity between two keyword sets (0 to 1)
function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

// Substring or token containment ratio
function phraseSimilarity(strA: string, strB: string): number {
  const normA = normalizeString(strA);
  const normB = normalizeString(strB);

  if (!normA || !normB) return 0;
  if (normA === normB) return 1.0;

  if (normA.includes(normB) || normB.includes(normA)) {
    const minLen = Math.min(normA.length, normB.length);
    const maxLen = Math.max(normA.length, normB.length);
    return Math.min(0.95, 0.7 + (minLen / maxLen) * 0.25);
  }

  // Token level overlap
  const tokensA = normA.split(' ').filter(Boolean);
  const tokensB = normB.split(' ').filter(Boolean);
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  let shared = 0;
  for (const t of tokensA) {
    if (tokensB.includes(t)) shared++;
  }
  return (shared * 2) / (tokensA.length + tokensB.length);
}

// Normalize code by stripping comments, formatting and strings
function normalizeCode(code: string): string {
  return (code || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
    .replace(/#.*/g, '')
    .replace(/["'].*?["']/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

/**
 * Checks a submitted guide against all existing guides and curriculum lessons
 * to detect duplicates and prevent redundant content on the site.
 */
export function checkGuideDuplicate(
  candidate: {
    title: string;
    summary?: string;
    overview?: string;
    code?: string;
    category?: string;
    trackId?: string;
  },
  existingGuidesList?: ConceptGuide[],
  existingTracksList?: Track[]
): DuplicateCheckReport {
  const normCandidateTitle = normalizeString(candidate.title || '');
  const candidateKeywords = extractKeywords(
    `${candidate.title || ''} ${candidate.summary || ''} ${candidate.category || ''}`
  );
  const candidateCode = normalizeCode(candidate.code || '');

  // Gather all guides to check against
  const guidesToCheck =
    existingGuidesList && existingGuidesList.length > 0
      ? existingGuidesList
      : getAllGuides();

  // Gather all course curriculum lessons to check against
  const tracksToCheck =
    existingTracksList && existingTracksList.length > 0
      ? existingTracksList
      : typeof window !== 'undefined'
      ? QADatabase.getTracks()
      : [];

  const matches: DuplicateMatchItem[] = [];

  const getTrackName = (id: string) => {
    switch (id) {
      case 'selenium':
      case 'selenium-java':
        return 'Selenium (Java)';
      case 'playwright':
      case 'playwright-ts':
        return 'Playwright (TS)';
      case 'api-testing':
        return 'Rest Assured (API)';
      case 'ai-qa':
        return 'AI Academy';
      default:
        return id || 'General SDET';
    }
  };

  // 1. Compare against existing Concept Guides
  for (const g of guidesToCheck) {
    // Skip if comparing same guide ID
    const normGuideTitle = normalizeString(g.title);
    if (!normGuideTitle) continue;

    const titleSim = phraseSimilarity(candidate.title, g.title);
    const guideKeywords = extractKeywords(`${g.title} ${g.summary || ''} ${g.category || ''}`);
    const keywordSim = jaccardSimilarity(candidateKeywords, guideKeywords);

    // Code comparison
    let codeSim = 0;
    if (candidateCode && g.codeSnippets && g.codeSnippets.length > 0) {
      const gCode = normalizeCode(g.codeSnippets[0].code || '');
      if (candidateCode === gCode && candidateCode.length > 20) {
        codeSim = 0.95;
      } else if (candidateCode.length > 30 && gCode.length > 30) {
        if (candidateCode.includes(gCode) || gCode.includes(candidateCode)) {
          codeSim = 0.85;
        }
      }
    }

    // Weighted combined similarity
    // Title is weighted heavily (60%), Content keywords (30%), Code (10%)
    const combinedScore = Math.round(
      (titleSim * 0.6 + keywordSim * 0.3 + codeSim * 0.1) * 100
    );

    if (combinedScore >= 30) {
      let reason = '';
      if (titleSim >= 0.85) {
        reason = `Identical or near-identical guide title (${Math.round(titleSim * 100)}% title match)`;
      } else if (codeSim >= 0.8) {
        reason = `Identical code snippet implementation found in existing guide`;
      } else if (keywordSim >= 0.5) {
        reason = `High semantic overlap in concept definitions and summary`;
      } else {
        reason = `Moderate keyword overlap with existing topic`;
      }

      matches.push({
        id: g.id,
        title: g.title,
        type: 'guide',
        trackId: g.trackId,
        trackName: getTrackName(g.trackId),
        similarity: combinedScore,
        matchReason: reason,
      });
    }
  }

  // 2. Compare against existing Curriculum Lessons
  let totalLessonsChecked = 0;
  for (const track of tracksToCheck) {
    for (const mod of track.modules || []) {
      for (const lesson of mod.lessons || []) {
        totalLessonsChecked++;
        const titleSim = phraseSimilarity(candidate.title, lesson.title);
        const lessonKeywords = extractKeywords(`${lesson.title} ${lesson.description || ''}`);
        const keywordSim = jaccardSimilarity(candidateKeywords, lessonKeywords);

        const combinedScore = Math.round((titleSim * 0.7 + keywordSim * 0.3) * 100);

        if (combinedScore >= 35) {
          matches.push({
            id: lesson.id,
            title: lesson.title,
            type: 'lesson',
            trackId: track.id,
            trackName: track.title,
            similarity: combinedScore,
            matchReason:
              titleSim >= 0.8
                ? `Matches core curriculum lesson title (${Math.round(titleSim * 100)}% match)`
                : `Similar topic covered in course curriculum module "${mod.title}"`,
          });
        }
      }
    }
  }

  // Sort matches by similarity descending
  matches.sort((a, b) => b.similarity - a.similarity);

  const highestMatch = matches[0];
  const maxScore = highestMatch ? highestMatch.similarity : 0;

  let status: 'unique' | 'potential_duplicate' | 'duplicate';
  let recommendation = '';

  if (maxScore >= 70) {
    status = 'duplicate';
    recommendation = `High Duplicate Risk: This guide has an estimated ${maxScore}% overlap with "${highestMatch.title}" in ${highestMatch.trackName}. Review thoroughly before approving to prevent redundant content.`;
  } else if (maxScore >= 35) {
    status = 'potential_duplicate';
    recommendation = `Moderate Similarity (${maxScore}%): Shares related concept keywords with "${highestMatch.title}". Verify that this submission offers distinct architectural depth or examples.`;
  } else {
    status = 'unique';
    recommendation = `Safe to Approve: Content appears unique (0% - ${maxScore}% similarity). No duplicate guides or curriculum lessons detected on the site.`;
  }

  return {
    status,
    similarityScore: maxScore,
    highestMatch,
    allMatches: matches.slice(0, 5),
    recommendation,
    checkedAgainstCount: {
      guides: guidesToCheck.length,
      lessons: totalLessonsChecked,
    },
  };
}
