import { useState } from "react";

const emptyProfile = { firstName: "", lastName: "", age: "", ethnicity: "", gender: "", bio: "", imageUrl: "", myersBriggsPersonalityType: "" };

export default function ProfileForm({ initialProfile, onSave, disabled = false, submitLabel = "Save profile", children }) {
  const [profile, setProfile] = useState(() => ({ ...emptyProfile, ...initialProfile }));
  const field = (name) => ({ value: profile[name] ?? "", onChange: (e) => setProfile({ ...profile, [name]: e.target.value }) });
  return <form onSubmit={(e) => { e.preventDefault(); onSave({ ...profile, age: Number(profile.age) }); }} className="space-y-3">
    <fieldset disabled={disabled} className="space-y-3">
      {children}
      <div className="grid grid-cols-2 gap-3">
        <label>First name<input {...field("firstName")} required maxLength={80} autoComplete="given-name" className="auth-input" /></label>
        <label>Last name<input {...field("lastName")} required maxLength={80} autoComplete="family-name" className="auth-input" /></label>
      </div>
      <label className="block">Age<input {...field("age")} type="number" min={18} max={120} required className="auth-input" /></label>
      <label className="block">Ethnicity<input {...field("ethnicity")} required maxLength={100} className="auth-input" /></label>
      <label className="block">Gender<select {...field("gender")} required className="auth-input">
        <option value="">Select gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="NON_BINARY">Non-binary</option>
      </select></label>
      <label className="block">Bio<textarea {...field("bio")} maxLength={2000} rows={3} className="auth-input" /></label>
      <label className="block">Profile image URL (optional)<input {...field("imageUrl")} maxLength={500} className="auth-input" /></label>
      <label className="block">Personality type (optional)<input {...field("myersBriggsPersonalityType")} maxLength={4} className="auth-input" /></label>
      <button className="auth-button" type="submit">{disabled ? "Please wait…" : submitLabel}</button>
    </fieldset>
  </form>;
}
