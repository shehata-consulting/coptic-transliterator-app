// Public Firebase web config — intentionally committed (same convention as
// the sibling apps). Identifies the project; grants no privileged access, and
// it ships in the deployed JS bundle regardless, so removing it from git would
// protect nothing.
//
// GitHub secret scanning flags the `AIza…` shape generically; this is the
// expected false positive, NOT the Gemini key (that one is stored server-side
// in the project's AI Logic config and appears nowhere in this repo). The
// browser key is hardened out-of-band instead: an API allowlist plus HTTP
// referrer restrictions pinned to the Hosting domains and localhost.
export const firebaseConfig = {
  apiKey: 'AIzaSyB9HqNEBViPxKBqdug29ichtOgyoMZcsaI',
  authDomain: 'coptic-transliterator-app.firebaseapp.com',
  projectId: 'coptic-transliterator-app',
  storageBucket: 'coptic-transliterator-app.firebasestorage.app',
  messagingSenderId: '307353739755',
  appId: '1:307353739755:web:42f585f79e4678902679ae',
};

// reCAPTCHA Enterprise site key for App Check. Public by design (site keys are
// meant to ship in client code); it is domain-restricted to the Hosting
// domains. See src/lib/ai.ts for why App Check initializes lazily.
export const RECAPTCHA_SITE_KEY = '6Lev5FwtAAAAACDcWdsA-XXskSudfnW2pv59DVwf';
