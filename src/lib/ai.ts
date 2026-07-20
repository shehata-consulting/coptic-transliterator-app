// AI-enhanced transliteration via Firebase AI Logic → Gemini Developer API.
//
// Same contract as the Streamlit app's llm_transliterate (app.py in the
// coptic-transliterator-llm repo): identical system instruction, few-shot
// prompt, temperature, chunking, one retry, and ASCII validation via
// cleanLlmOutput. Returns null on ANY failure — the caller always falls back
// to the rule-based engine, so AI can never make the tool worse.
//
// Cost: the GoogleAIBackend uses the Gemini Developer API free tier and the
// project stays on the Spark plan — no billing surface. Rate-cap hits just
// mean a null return here.
import type { GenerativeModel } from 'firebase/ai';

import { FIREBASE_CONFIG, RECAPTCHA_SITE_KEY } from './firebaseConfig';
import { chunkText, cleanLlmOutput, LLM_MAX_CHUNKS } from './textUtils';

// The Streamlit app pins gemini-2.5-flash-lite, but that model is closed to
// new projects (404 "no longer available to new users"), so this one can't use
// it. The rolling alias always resolves to the current flash-lite, which keeps
// a future deprecation from silently breaking the button. Safe to float: the
// rule-based engine is the source of truth, and every response is validated to
// plain ASCII by cleanLlmOutput before it can reach the screen.
const MODEL = 'gemini-flash-lite-latest';

const SYSTEM_INSTRUCTION = `You are an expert in Coptic language transliteration. Your task is to transliterate Coptic text to Latin script using standard transliteration conventions.
    Rules:
    - Convert each Coptic character to its Latin equivalent
    - Preserve word boundaries, line breaks, and spacing
    - Use lowercase Latin letters
    - **Crucially: The output MUST contain ONLY plain, unaccented Latin characters (ASCII a-z). No Coptic characters, no diacritics, and no special Latin characters (e.g., ā, ē, ī, ō, ū) are allowed in the final transliterated text.**
    - Do not add explanations, conversational filler, or additional text. Only return the transliterated text.`;

const promptFor = (chunk: string) => `Examples:
            - ⲡⲛⲟⲩⲧⲉ → pnoute
            - ⲧⲉⲕⲕⲗⲏⲥⲓⲁ → tekklesia
            - ⲁⲅⲁⲡⲏ → agape
            - ⲙⲁⲣⲓⲁ → maria

            Transliterate this Coptic text to Latin script: ${chunk}`;

// Lazy singleton: the firebase modules load on first AI use, so the offline
// rule-based path never pays for them.
let modelPromise: Promise<GenerativeModel> | null = null;

function getModel(): Promise<GenerativeModel> {
  if (!modelPromise) {
    modelPromise = (async () => {
      const { initializeApp } = await import('firebase/app');
      const { getAI, getGenerativeModel, GoogleAIBackend } = await import('firebase/ai');
      const app = initializeApp(FIREBASE_CONFIG);

      // App Check attests that requests come from this site, so the project's
      // free-tier Gemini quota can't be spent by scripts lifting the (public)
      // config out of the bundle. Initialized HERE rather than at startup on
      // purpose: it pulls reCAPTCHA Enterprise from google.com, and the
      // offline-first rule-based path must never depend on a network call.
      // Failure is non-fatal — the AI request proceeds and is judged on its
      // own result (and enforcement is what makes tokens mandatory anyway).
      try {
        const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import(
          'firebase/app-check'
        );
        initializeAppCheck(app, {
          provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
          isTokenAutoRefreshEnabled: true,
        });
      } catch {
        // ignore — see comment above
      }

      const ai = getAI(app, { backend: new GoogleAIBackend() });
      return getGenerativeModel(ai, {
        model: MODEL,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: { temperature: 0.1 },
      });
    })();
    // A failed init (offline first click, blocked API) must not poison later tries.
    modelPromise.catch(() => {
      modelPromise = null;
    });
  }
  return modelPromise;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * AI transliteration. Long input is split into line-boundary chunks to stay
 * within free-tier request sizes (capped at LLM_MAX_CHUNKS); every response
 * is validated down to plain ASCII. Null on any failure → caller falls back.
 */
export async function aiTransliterate(text: string): Promise<string | null> {
  if (!text || !text.trim()) return null;

  try {
    const model = await getModel();
    const pieces: string[] = [];
    for (const chunk of chunkText(text).slice(0, LLM_MAX_CHUNKS)) {
      let raw: string | null = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        // one retry: 503s during demand spikes are common
        try {
          const res = await model.generateContent(promptFor(chunk));
          raw = res.response.text();
          break;
        } catch {
          if (attempt === 0) await sleep(2000);
        }
      }
      if (raw === null) return null;
      const cleaned = cleanLlmOutput(raw);
      if (cleaned === null) return null;
      pieces.push(cleaned);
    }
    return pieces.join('\n');
  } catch {
    return null;
  }
}
