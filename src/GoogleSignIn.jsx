import { useEffect, useRef, useState } from "react";

let sdkPromise;
function loadGoogleSdk() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", () => resolve(window.google), { once: true });
      script.addEventListener("error", () => reject(new Error("Google sign-in could not load. Try again later.")), { once: true });
    });
  }
  return sdkPromise;
}

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "356044456946-ebi4v73c1dtoug43gddf4s0k7s3bcsn3.apps.googleusercontent.com";
const scopes = "openid email profile https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/user.gender.read";

export default function GoogleSignIn({ onCredential, disabled = false }) {
  const client = useRef(null);
  const callback = useRef(onCredential);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { callback.current = onCredential; }, [onCredential]);
  useEffect(() => {
    let active = true;
    loadGoogleSdk().then(google => {
      if (!active) return;
      client.current = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: scopes,
        include_granted_scopes: true,
        error_callback: () => {
          if (active) { setBusy(false); setError("Google sign-in was closed or blocked. Please try again."); }
        },
        callback: async response => {
          if (!active) return;
          if (!response.access_token) {
            setBusy(false); setError("Google did not authorize sign-in. Please try again."); return;
          }
          try { await callback.current(response.access_token); }
          catch { if (active) setError("Google sign-in could not be completed. Please try again."); }
          finally { if (active) setBusy(false); }
        },
      });
      setReady(true);
    }).catch(error => { if (active) setError(error.message); });
    return () => { active = false; client.current = null; };
  }, []);
  function signIn() {
    if (!client.current || disabled || busy) return;
    setError(""); setBusy(true);
    try { client.current.requestAccessToken({ prompt: "select_account" }); }
    catch { setBusy(false); setError("Google sign-in could not open. Please try again."); }
  }
  return <div className="google-signin">
    <button type="button" className="google-signin-button" disabled={disabled || busy || !ready} onClick={signIn}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 48 48"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.2H24v8h11a9.4 9.4 0 0 1-4.1 6.2v5.2h6.6c3.9-3.6 6.1-8.9 6.1-15.2Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.2a12.2 12.2 0 0 1-18.1-6.4H6v5.4A20.4 20.4 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.8 27.5a12.3 12.3 0 0 1 0-7V15H6a20 20 0 0 0 0 18l6.8-5.5Z"/><path fill="#EA4335" d="M24 12c3 0 5.6 1 7.7 3l5.8-5.8A19.4 19.4 0 0 0 24 4 20.4 20.4 0 0 0 6 15l6.8 5.5A12.1 12.1 0 0 1 24 12Z"/></svg>
      {busy ? "Signing in…" : "Continue with Google"}
    </button>
    {error && <p role="alert" className="text-red-600 text-sm mt-2">{error}</p>}
  </div>;
}
