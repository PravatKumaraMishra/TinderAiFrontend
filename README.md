# Tinder AI frontend

React/Vite frontend with email/password registration, Google sign-in, profile onboarding,
profile editing, independent matches/chats, and sign-out.

## Run

Use Node.js `^20.19.0 || >=22.12.0` and npm. For a fresh checkout:

```sh
git clone https://github.com/PravatKumaraMishra/TinderAiFrontend.git
cd TinderAiFrontend
npm ci
```

Start [TinderAiBackend](https://github.com/PravatKumaraMishra/TinderAiBackend) separately,
then run `npm run dev`. The default backend is
`http://localhost:8080`. Copy `.env.example` to `.env.local` if you need to override:

- `VITE_BACKEND_URL`: your backend URL.
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth Web client ID. The supplied public client ID
  is configured as a fallback in the Google button component.

Use the same client ID in backend `GOOGLE_CLIENT_ID`. Never put a client secret or
backend JWT signing secret in frontend environment variables.

In Google Cloud Console, configure this Web client's **Authorized JavaScript origins**
with the actual frontend origin (`http://localhost:5173` for Vite's default port).
Add production origins when deploying. If Vite selects another port, authorize that
origin too. This uses the Google Identity Services popup/callback flow; there is no
backend redirect URL or client secret required. The backend needs internet access to
Google's rotating public signing keys.

## Authentication behavior

The official Google Identity Services button obtains an ID token. The frontend posts
it as JSON to `/auth/google`; the backend verifies it and issues the application JWT.
The Google token is never used as an application API bearer token.

For new Google accounts, complete the profile before browsing/matching/chatting.
If the same email already has a password account, sign in with the password first,
then link Google from **My profile**. No accounts are automatically merged by email.

All API calls go through `src/api.js`. Tokens stay in memory, so reloading the page
requires signing in again. They expire after the backend's configured lifetime
(30 minutes by default). Sign-out clears the token and unmounts account-specific UI.
Late requests from a previous account cannot populate the next account's state.
There is no persistent browser token storage or refresh-token flow.

Chat authors are taken from `/users/me`. Send-message requests contain only message
text. Failed messages restore the input, and a concurrent-save conflict reloads the
conversation before the user decides whether to resend.

## Verify

```sh
npm run build
npm run lint
node --test src/api.test.js
```

`npm run preview` serves a production build locally; run `npm run build` first.

## Project structure

- `src/App.jsx`: authentication state and screen navigation.
- `src/AuthScreen.jsx`, `src/GoogleSignIn.jsx`: password and Google sign-in.
- `src/AccountScreen.jsx`, `src/ProfileForm.jsx`: profile setup and editing.
- `src/ProfileSelector.jsx`, `src/MatchList.jsx`, `src/ChatScreen.jsx`: browsing and chats.
- `src/api.js`, `src/fetch*.js`, `src/saveSwipe.js`, `src/sendMessage.js`: authenticated API calls.

Google's live popup requires the matching Google Console origins and browser/network
access. Local automated tests cover bearer headers, session expiry, account switches,
logout, and message payloads; backend tests cover Google JWT validation and linking.

If profiles or chats remain on Loading, check backend availability, image routes,
and CORS. Backend AI configuration is documented in its repository.
