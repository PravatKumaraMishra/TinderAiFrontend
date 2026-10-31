import { Camera } from "lucide-react";
import { imageUrl } from "./api";
import { useState } from "react";

const emptyProfile = { firstName: "", lastName: "", age: "", ethnicity: "", gender: "", bio: "", imageUrl: "", myersBriggsPersonalityType: "" };

export default function ProfileForm({ initialProfile, onSave, disabled = false, submitLabel = "Save profile", children }) {
  const [profile, setProfile] = useState(() => ({ ...emptyProfile, ...initialProfile }));
  const [photoError, setPhotoError] = useState("");
  const [processing, setProcessing] = useState(false);
  async function uploadPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) { setPhotoError("Choose a JPG, PNG or WebP image under 10 MB."); return; }
    setProcessing(true);
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 640 / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
      const photo = canvas.toDataURL("image/jpeg", 0.82);
      if (photo.length > 600000) throw new Error("Photo is too detailed. Please choose a smaller image.");
      setProfile(previous => ({ ...previous, imageUrl: photo }));
    } catch (error) { setPhotoError(error.message || "Could not read this image. Try another photo."); }
    finally { setProcessing(false); event.target.value = ""; }
  }
  const field = (name) => ({ value: profile[name] ?? "", onChange: (e) => setProfile({ ...profile, [name]: e.target.value }) });
  return <form onSubmit={(e) => { e.preventDefault(); onSave({ ...profile, age: Number(profile.age) }); }} className="profile-form">
    <fieldset disabled={disabled || processing} className="profile-fields">
      {children}
      <div className="photo-upload"><div className="upload-preview">{profile.imageUrl ? <img src={imageUrl(profile.imageUrl)} alt="Your profile preview" /> : <Camera size={28} />}</div><div><strong>Your profile photo</strong><label className="upload-button">{processing ? "Preparing photo…" : "Upload photo"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} className="sr-only" /></label><small>JPG, PNG or WebP · up to 10 MB</small>{profile.imageUrl && <button type="button" className="remove-photo" onClick={() => setProfile({ ...profile, imageUrl: "" })}>Remove photo</button>}</div></div>
      {photoError && <p role="alert" className="notice error">{photoError}</p>}
      <div className="profile-names">
        <label>First name<input {...field("firstName")} required maxLength={80} autoComplete="given-name" className="auth-input" /></label>
        <label>Last name<input {...field("lastName")} required maxLength={80} autoComplete="family-name" className="auth-input" /></label>
      </div>
      <label className="block">Age<input {...field("age")} type="number" min={18} max={120} required className="auth-input" /></label>
      <label className="block">Ethnicity<input {...field("ethnicity")} required maxLength={100} className="auth-input" /></label>
      <label className="block">Gender<select {...field("gender")} required className="auth-input">
        <option value="">Select gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="NON_BINARY">Non-binary</option>
      </select></label>

      <label className="block">Personality type (optional)<select {...field("myersBriggsPersonalityType")} className="auth-input"><option value="">Select your personality</option>{["INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP", "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"].map(type => <option key={type} value={type}>{type}</option>)}</select></label>
      <label className="bio-field">Bio<textarea {...field("bio")} maxLength={2000} rows={2} className="auth-input" /></label>
      <div className="profile-actions"><button className="auth-button" type="submit">{disabled ? "Please wait…" : submitLabel}</button></div>
    </fieldset>
  </form>;
}
