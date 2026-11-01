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

All API calls go through `src/api.js`. Access tokens stay in memory. Login sets an
HttpOnly refresh cookie; on reload the app calls `/auth/refresh`, then `/users/me`
before showing the signed-in interface. Expired API requests share a refresh and
retry once. Web Locks coordinate refreshes across tabs where supported.
Sign-out calls `/auth/logout` to revoke the refresh session. Network failures during
startup show a retry screen. No tokens are stored in localStorage or sessionStorage.

Deploy the matching backend changes. Allow the exact frontend Origin in backend
CORS (no trailing slash), use HTTPS and `COOKIE_SECURE=true` in production.
Keep `COOKIE_SAME_SITE=Lax`: authentication goes through the frontend proxy below,
so the cookie stays first-party. The Vite proxy adapts cookie attributes for local
HTTP development without weakening production cookies.

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


### First-party authentication proxy

Auth requests use relative `/auth/*` URLs. Vite development and preview proxy them
to `VITE_BACKEND_URL`; Vercel uses `vercel.json` to forward them to the Render API.
This keeps the HttpOnly cookie on the frontend host and avoids cross-site cookie
blocking when localhost or `tinder.pravat.me` calls `onrender.com`.
The local Vite proxy removes Secure and converts SameSite=None to Lax on HTTP;
production HTTPS cookies retain their security attributes. The backend must allow
the frontend Origin in CORS. Restart Vite after changing proxy configuration.
If the backend host changes, update both `VITE_BACKEND_URL` and the Vercel rewrite.
Other hosting providers must provide the same `/auth/*` reverse proxy.
Sign in once after updating: cookies on the Render host cannot migrate to localhost.

### Google profile import

Google sign-in automatically requests profile, birthday, and gender permissions in the same sign-in flow. The backend validates the Google access token for the configured OAuth client, then fetches name, photo, birthday, and gender. No separate connect or import step is shown. Enable People API in the OAuth client's Google Cloud project and configure these scopes on the OAuth consent screen (including test users while the app is in testing). Fields that Google does not share remain editable. Google access tokens are used only for sign-in and are not stored. Declined birthday/gender permissions leave those fields editable and do not prevent basic sign-in.

Profile photos accept JPG, PNG, or WebP files up to 500 KB. Users can crop, zoom, and reposition the image before saving a square JPEG.

If Google returns `403 access_denied` saying the app is in testing, open Google Cloud Console → Google Auth Platform → Audience for the project owning this OAuth client. Add the signing-in Google account under Test users for development. For public access, publish the app and complete the verification required for birthday/gender scopes. This restriction is enforced by Google and cannot be bypassed in application code.

## Legal pages

Public Terms of Service and Privacy Policy are available at `/terms` and `/privacy`
(with direct static copies at `/terms.html` and `/privacy.html`). Vercel rewrites
serve these documents without authentication or an API connection. A shared footer below the app links to both, alongside GitHub, a creator credit,
contact, and Buy Me a Coffee. The legal pages include the same footer links.
Update `public/terms.html` and `public/privacy.html` when operators, providers,
retention practices, or features change. Privacy/support contact: me.sanuvai@gmail.com.
