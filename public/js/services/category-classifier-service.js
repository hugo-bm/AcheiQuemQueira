import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/dist/fuse.mjs";
import { CLASSIFICATION_RULES } from "../data/classification-rules.js";

const MIN_CONFIDENCE = 0.3;
const STOP_WORDS = new Set([
  "com",
  "sem",
  "para",
  "uma",
  "uns",
  "umas",
  "mas",
  "nao",
  "que",
  "dos",
  "das",
  "pelo",
  "pela",
  "num",
  "numa",
  "esta",
  "este",
  "isso",
  "aquilo",
  "tira",
  "tirar",
  "tem",
]);

export class CategoryClassifierService {
  /**
   * Suggests a category and subcategory based on title and description.
   *
   * @param {string} title - Item title.
   * @param {string} [description=''] - Item description.
   * @returns {{
   * success: boolean,
   * categoryId: string|null,
   * subcategoryId: string|null,
   * confidence: number,
   * tags: string[]
   * }}
   */
  static suggestCategory(title) {
    const normalizedTitle = this.normalizeText(title);
    const terms = this.extractTerms(normalizedTitle);

    const classification = this.classifyTerms(terms);

    if (!classification || classification.confidence < MIN_CONFIDENCE) {
      return {
        success: false,
        categoryId: null,
        subcategoryId: null,
        confidence: 0,
        tags: [],
      };
    }
    // Extract the tags that actually matched the title and the winning rule.
    const matchedTags = this.extractTags(terms, classification.rule);


    // --- RULE OF CONSISTENCY ---
    // If the confidence level indicates a correlation, but no actual tag has been validated,
    // we intercept the false positive and return "no suggestion".
    if (matchedTags.length === 0) {
      return {
        success: false,
        categoryId: null,
        subcategoryId: null,
        confidence: 0,
        tags: [],
      };
    }
    return {
      success: true,
      categoryId: classification.categoryId,
      subcategoryId: classification.subcategoryId,
      confidence: classification.confidence,
      tags: matchedTags,
    };
  }

  /**
   * Normalizes text for classification.
   *
   * @param {string} text - Raw text.
   * @returns {string}
   */
  static normalizeText(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, " ")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Extracts relevant terms from normalized text.
   *
   * @param {string} text - Normalized text.
   * @returns {string[]}
   */
  static extractTerms(text) {
    return text
      .split(" ")
      .map((term) => term.trim())
      .filter((term) => term.length >= 3 && !STOP_WORDS.has(term));
  }

  /**
   * Classifies terms using Fuse.js and classification rules.
   *
   * @param {string[]} terms - Extracted terms.
   * @returns {{
   * categoryId: string,
   * subcategoryId: string,
   * confidence: number,
   * rule: object
   * }|null}
   */
  static classifyTerms(terms) {
    if (!terms.length) {
      return null;
    }

    // Notes: 0.0 — Perfect coincidence | 1.0 — Total mismatch

    const fuse = new Fuse(CLASSIFICATION_RULES, {
      includeScore: true,
      threshold: 0.25, // Maintains a certain tolerance.
      keys: ["tags"],
    });

    const candidateMatches = new Map();

    for (const term of terms) {
      const matches = fuse.search(term);

      for (const match of matches) {
        const rule = match.item;
        const key = `${rule.categoryId}:${rule.subcategoryId}`;

        let score = match.score ?? 1;

        // --- Protection against "LITROS" VS "LIVROS" ---

        // Check if the "term" being evaluated is identical to the "term" saved in the rule.
        // Or if fuse.js thought they were only similar.        
        const hasExactMatchInRule = rule.tags.includes(term);

        // Check if the term is considered similar
        if (!hasExactMatchInRule && score > 0) {

          // If the word is short (e.g., 6 letters like liters/books), we lower the score.
          // This prevents 1-letter errors in short words from incorrectly crossing categories.
          if (term.length <= 6) {
            score = score * 2.5; //It severely penalizes false spelling friends.
          }
        }

        // Se após a penalização o score estourar o limite aceitável, ignoramos o match
        if (score > 0.25) continue;

        const currentConfidence = Number((1 - score).toFixed(2));
        const existing = candidateMatches.get(key);

        if (!existing) {
          candidateMatches.set(key, {
            rule,
            maxConfidence: currentConfidence,
            isExact: hasExactMatchInRule, // Salva se eles forem exatos
          });
        } else {
          if (currentConfidence > existing.maxConfidence) {
            existing.maxConfidence = currentConfidence;
          }
          if (hasExactMatchInRule) {
            existing.isExact = true;
          }
        }
      }
    }

    if (candidateMatches.size === 0) {
      return null;
    }

    let bestCandidate = null;

    // Two-stage tie-breaking criterion
    for (const candidate of candidateMatches.values()) {
      if (!bestCandidate) {
        bestCandidate = candidate;
        continue;
      }

      //  Layer 1: If one candidate has a 100% EXACT match ("litros" in the correct tag) and the other does not,
      // the exact match wins instantly.
      if (candidate.isExact && !bestCandidate.isExact) {
        bestCandidate = candidate;
        continue;
      }
      if (!candidate.isExact && bestCandidate.isExact) {
        continue;
      }

      // Layer 2: If both are exact or both are approximate, the higher confidence wins.
      if (candidate.maxConfidence > bestCandidate.maxConfidence) {
        bestCandidate = candidate;
      }
    }

    return {
      categoryId: bestCandidate.rule.categoryId,
      subcategoryId: bestCandidate.rule.subcategoryId,
      confidence: bestCandidate.maxConfidence,
      rule: bestCandidate.rule,
    };
  }

  /**
   * Extracts matched tags from the winning rule.
   *
   * @param {string[]} terms - Extracted terms.
   * @param {Object} rule - Winning classification rule.
   * @returns {string[]}
   */
  static extractTags(terms, rule) {
    if (!rule?.tags?.length) {
      return [];
    }

    const normalizedTerms = new Set(
      terms.map((term) => this.normalizeText(term)),
    );

    return rule.tags.filter((tag) =>
      normalizedTerms.has(this.normalizeText(tag)),
    );
  }
}
