import { useState } from "react";
import GoogleSignIn from "./GoogleSignIn";
import ProfileForm from "./ProfileForm";
import { apiRequest } from "./api";

export default function AuthScreen({ onAuthenticated, notice }) {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function authenticate(path, body) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const token = await apiRequest(path, { method: "POST", body, authenticated: false });
      await onAuthenticated(token);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  const credentials = <div className="credentials-grid">
    <label className="block">Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required maxLength={254} autoComplete="email" className="auth-input" /></label>
    <label className="block">Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={register ? 12 : undefined} maxLength={64} autoComplete={register ? "new-password" : "current-password"} className="auth-input" /></label>
  </div>;
  return <div className={`auth-layout${register ? " is-register" : ""}`}><aside className="auth-story"><a className="brand" href="/"><img src="/icon.svg" alt="" />TinderAI</a><h2>Find your spark.</h2><p>Your next great conversation starts here.</p></aside><section className="glass auth-panel space-y-5">
    <h1 className="text-2xl font-bold">{register ? "Create your account" : "Welcome to TinderAI"}</h1>

    {notice && <p role="status" className="text-sm text-gray-600">{notice}</p>}
    {error && <p role="alert" className="text-red-600">{error}</p>}
    <GoogleSignIn disabled={busy} onCredential={(accessToken) => authenticate("/auth/google", { accessToken })} />
    <div className="auth-divider"><span>or use email</span></div>
    {register ? <ProfileForm onSave={(profile) => authenticate("/auth/register", { email, password, profile })} disabled={busy} submitLabel="Create account">{credentials}</ProfileForm>
      : <form onSubmit={(e) => { e.preventDefault(); authenticate("/auth/login", { email, password }); }} className="space-y-3">
        <fieldset disabled={busy} className="space-y-3">{credentials}<button type="submit" className="auth-button">{busy ? "Signing in…" : "Sign in"}</button></fieldset>
      </form>}
    <button disabled={busy} type="button" className="text-blue-700 underline text-sm" onClick={() => { setRegister(!register); setError(""); }}>{register ? "Already registered? Sign in" : "New here? Create an account"}</button>
  </section></div>;
}
