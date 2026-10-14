# Shared video comments

Comments use Cloud Firestore in the Firebase project already initialized by
`src/components/helpers/firebase.js`. Firebase Authentication provides the user
identity. RapidAPI is not required to read or post comments on `/video/:id`.

## Firebase console setup

1. Open the existing project's Firebase console. Enable **Email/Password** under
   Authentication → Sign-in method, if it is not enabled already.
2. Create **Cloud Firestore** in production mode if there is no database.
3. In Firestore → Rules, merge the rules in `firestore.rules` with any existing
   application rules and publish them. Do not overwrite unrelated rules. Remove
   any overlapping permissive rule that would bypass these restrictions.
4. In Authentication → Settings → Authorized domains, add the hostname used
   to serve the application if it is not listed.

The comments collection is `videos/{videoId}/comments`. No composite index is
needed. Anyone can read comments. Only authenticated users can create comments
with their own UID, a server timestamp, and 1–2,000 characters of text. Updates
and deletes are denied. Author names are display labels, not verified identities.
Email addresses are not stored in comments; the default label uses the local
part of the user's email. Configure Firebase quotas and consider App Check and
moderation before a public launch.

Cloud environments need HTTPS access to `firestore.googleapis.com`,
`identitytoolkit.googleapis.com`, and `securetoken.googleapis.com`. The saved
network draft allows these destinations but must be applied in environment
settings. The existing Firebase configuration remains in place.

## Run and verify

From `/workspace/Nur-Tube-RapidAPI`, run `npm ci`, `npm run build`, and
`npm run dev -- --host 127.0.0.1`. Open `/video/<YouTube-video-id>`.

Sign in, post a comment, and open the same video in another browser or incognito
session. The comment should appear without refresh and remain after reload.
A different video must show a separate discussion. Signed-out viewers can read,
but are prompted to sign in before posting. Blank comments are disabled;
failed posts keep the draft. Offline comments are explicitly marked as potentially
out of date, and pending writes display a connection message.

Local validation: production build and lint for changed components passed.
Browser checks covered sign-in/create-account modes, Escape dismissal, mobile
layout, and shared-comment UI using a mocked Firebase transport in two sessions.
Live Firestore access was blocked by cloud networking; production persistence and
published security rules still need the above Firebase setup and live verification.

The repeatable UI check is `node tests/comments-ui.cjs` with Vite running and
Playwright available. Set `NURTUBE_TEST_URL` for a different port and
`CHROMIUM_EXECUTABLE` for a different installed Chromium executable. This test
mocks authentication and the Firestore transport; it does not validate production
Firebase access or security-rule enforcement.
