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
  const credentials = <>
    <label className="block">Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required maxLength={254} autoComplete="email" className="auth-input" /></label>
    <label className="block">Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={register ? 12 : undefined} maxLength={64} autoComplete={register ? "new-password" : "current-password"} className="auth-input" /></label>
  </>;
  return <section className="bg-white rounded-xl shadow p-6 space-y-5">
    <h1 className="text-2xl font-bold">{register ? "Create your account" : "Welcome to Tinder AI"}</h1>
    <p className="text-gray-600">Meet AI personas. Your profile, matches, and chats belong to your account.</p>
    {notice && <p role="status" className="text-sm text-gray-600">{notice}</p>}
    {error && <p role="alert" className="text-red-600">{error}</p>}
    <GoogleSignIn disabled={busy} onCredential={(credential) => authenticate("/auth/google", { credential })} />
    <p className="text-sm text-gray-500">Or continue with email</p>
    {register ? <ProfileForm onSave={(profile) => authenticate("/auth/register", { email, password, profile })} disabled={busy} submitLabel="Create account">{credentials}</ProfileForm>
      : <form onSubmit={(e) => { e.preventDefault(); authenticate("/auth/login", { email, password }); }} className="space-y-3">
        <fieldset disabled={busy} className="space-y-3">{credentials}<button type="submit" className="auth-button">{busy ? "Signing in…" : "Sign in"}</button></fieldset>
      </form>}
    <button disabled={busy} type="button" className="text-blue-700 underline text-sm" onClick={() => { setRegister(!register); setError(""); }}>{register ? "Already registered? Sign in" : "New here? Create an account"}</button>
  </section>;
}
