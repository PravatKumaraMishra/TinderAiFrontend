import { Heart, X, Sparkles } from "lucide-react";
import { imageUrl } from "./api";

export default function ProfileSelector({ profile, onSwipe, disabled }) {
  if (!profile) return <section className="glass loading-state" role="status"><Sparkles size={32} /><p>Loading profiles…</p></section>;
  return <section className="profile-stage" aria-label="Discover AI profiles">
    <article className="unified-profile glass" key={profile.id}>
      <div className="unified-photo">
        {profile.imageUrl ? <img src={imageUrl(profile.imageUrl)} alt={`${profile.firstName}'s AI persona`} /> : <div className="photo-placeholder"><span>{profile.firstName?.[0] || "?"}</span></div>}
        <div className="photo-identity">
        {profile.myersBriggsPersonalityType && <span className="personality-label">{profile.myersBriggsPersonalityType}</span>}
        <h2>{profile.firstName}, {profile.age}</h2>
        </div>
      </div>
      <div className="unified-bio">
        {profile.bio && <p>{profile.bio}</p>}
      </div>
    </article>
    <div className="floating-actions" role="group" aria-label="Profile actions">
      <button className="swipe skip" disabled={disabled} aria-label="Dislike profile" onClick={() => onSwipe(profile.id, "left")}><X size={30} /><span className="action-tooltip">Dislike</span></button>
      <button className="swipe like" disabled={disabled} aria-label="Like profile" onClick={() => onSwipe(profile.id, "right")}><Heart size={30} /><span className="action-tooltip">Like</span></button>
    </div>
  </section>;
}
