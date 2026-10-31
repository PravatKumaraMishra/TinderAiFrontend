import { useState } from "react";
import { apiRequest } from "./api";
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
  return <section className="glass account-panel space-y-4">

    <p className="text-gray-600">{account.email}</p>

    {error && <p role="alert" className="text-red-600">{error}</p>}
    {saved && <p role="status" className="text-green-700">Profile saved.</p>}
    <ProfileForm initialProfile={account.profile || { ...account.googleProfile, age: account.googleProfile?.age || "" }} onSave={save} disabled={busy} />
  </section>;
}
