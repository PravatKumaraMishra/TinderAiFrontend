import { Camera } from "lucide-react";
import { imageUrl } from "./api";
import { useState } from "react";

const emptyProfile = { firstName: "", lastName: "", age: "", ethnicity: "", gender: "", bio: "", imageUrl: "", myersBriggsPersonalityType: "" };

export default function ProfileForm({ initialProfile, onSave, disabled = false, submitLabel = "Save profile", children }) {
  const [profile, setProfile] = useState(() => ({ ...emptyProfile, ...initialProfile }));
  const [photoError, setPhotoError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [crop, setCrop] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  async function uploadPhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPhotoError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 500 * 1024) {
      setPhotoError("Choose a JPG, PNG or WebP image up to 500 KB."); return;
    }
    setProcessing(true);
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width; canvas.height = bitmap.height;
      canvas.getContext("2d").drawImage(bitmap, 0, 0);
      bitmap.close();
      setCrop({ src: canvas.toDataURL("image/png"), width: canvas.width, height: canvas.height });
      setZoom(1); setPosition({ x: 50, y: 50 });
    } catch { setPhotoError("Could not read this image. Try another photo."); }
    finally { setProcessing(false); }
  }
  async function applyCrop() {
    setProcessing(true); setPhotoError("");
    try {
      const image = new Image(); image.src = crop.src; await image.decode();
      const side = Math.min(crop.width, crop.height) / zoom;
      const canvas = document.createElement("canvas"); canvas.width = 640; canvas.height = 640;
      const context = canvas.getContext("2d"); context.fillStyle = "#fff"; context.fillRect(0, 0, 640, 640);
      context.drawImage(image, (crop.width - side) * position.x / 100, (crop.height - side) * position.y / 100, side, side, 0, 0, 640, 640);
      let photo;
      for (const quality of [0.88, 0.78, 0.65, 0.5]) {
        photo = canvas.toDataURL("image/jpeg", quality);
        if (atob(photo.split(",")[1]).length <= 500 * 1024) break;
      }
      if (atob(photo.split(",")[1]).length > 500 * 1024) throw new Error("Photo exceeds 500 KB. Please try another image.");
      setProfile(previous => ({ ...previous, imageUrl: photo })); setCrop(null);
    } catch (error) { setPhotoError(error.message || "Could not prepare photo."); }
    finally { setProcessing(false); }
  }
  const field = (name) => ({ value: profile[name] ?? "", onChange: (e) => setProfile({ ...profile, [name]: e.target.value }) });
  return <form onSubmit={(e) => { e.preventDefault(); if (!crop) onSave({ ...profile, age: Number(profile.age) }); }} className="profile-form">
    <fieldset disabled={disabled || processing} className="profile-fields">
      {children}
      <div className="photo-upload"><div className="upload-preview">{profile.imageUrl ? <img src={imageUrl(profile.imageUrl)} alt="Your profile preview" /> : <Camera size={28} />}</div><div><strong>Your profile photo</strong><label className="upload-button">{processing ? "Preparing photo…" : "Upload photo"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} className="sr-only" /></label><small>JPG, PNG or WebP · up to 500 KB</small>{profile.imageUrl && <button type="button" className="remove-photo" onClick={() => setProfile({ ...profile, imageUrl: "" })}>Remove photo</button>}</div></div>
      {crop && <section className="photo-editor" aria-label="Adjust profile photo">
        <strong>Adjust your photo</strong>
        <div className="crop-preview" style={{ backgroundImage: `url("${crop.src}")`, backgroundSize: `${crop.width / (Math.min(crop.width, crop.height) / zoom) * 100}% ${crop.height / (Math.min(crop.width, crop.height) / zoom) * 100}%`, backgroundPosition: `${position.x}% ${position.y}%` }} />
        <label>Zoom<input type="range" min="1" max="3" step="0.01" value={zoom} onChange={e => setZoom(Number(e.target.value))} /></label>
        <label>Horizontal position<input type="range" min="0" max="100" value={position.x} onChange={e => setPosition({ ...position, x: Number(e.target.value) })} /></label>
        <label>Vertical position<input type="range" min="0" max="100" value={position.y} onChange={e => setPosition({ ...position, y: Number(e.target.value) })} /></label>
        <div className="crop-actions"><button type="button" className="upload-button" onClick={applyCrop}>Use photo</button><button type="button" onClick={() => setCrop(null)}>Cancel</button></div>
      </section>}
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
      <div className="profile-actions"><button className="auth-button" type="submit" disabled={!!crop}>{disabled ? "Please wait…" : submitLabel}</button></div>
    </fieldset>
  </form>;
}
