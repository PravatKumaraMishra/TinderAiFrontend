import { useState } from "react";
import { apiRequest } from "./api";
import GoogleSignIn from "./GoogleSignIn";
import ProfileForm from "./ProfileForm";

export default function AccountScreen({ account, onUpdated }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  async function save(profile) {
    setBusy(true); setError(""); setSaved(false);
    try {
      await apiRequest("/users/me/profile", { method: "PUT", body: profile });
      onUpdated(await apiRequest("/users/me")); setSaved(true);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function link(credential) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      await apiRequest("/users/me/google", { method: "POST", body: { credential } });
      onUpdated(await apiRequest("/users/me"));
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <section className="rounded-xl shadow bg-white p-5 space-y-4">
    <h1 className="text-2xl font-bold">{account.profile ? "Your profile" : "Complete your profile"}</h1>
    <p className="text-gray-600">{account.email}</p>
    {!account.profile && <p>Add your details to start matching and chatting.</p>}
    {error && <p role="alert" className="text-red-600">{error}</p>}
    {saved && <p role="status" className="text-green-700">Profile saved.</p>}
    <ProfileForm initialProfile={account.profile} onSave={save} disabled={busy} />
    {account.googleLinked ? <p className="text-sm text-green-700">Google sign-in is linked.</p> : <div className="space-y-2 border-t pt-4">
      <p className="text-sm">Link Google using the same email to sign in either way.</p>
      <GoogleSignIn onCredential={link} disabled={busy} />
    </div>}
  </section>;
}
