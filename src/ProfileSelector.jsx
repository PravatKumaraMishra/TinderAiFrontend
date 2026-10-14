import { Heart, X } from "lucide-react";
import { imageUrl } from "./api";

export default function ProfileSelector({ profile, onSwipe, disabled }) {
  if (!profile) return <p>Loading profiles…</p>;
  return <section className="rounded-lg overflow-hidden bg-white shadow-lg">
    <div className="relative">
      <img src={imageUrl(profile.imageUrl)} alt={`${profile.firstName}'s AI profile`} className="w-full" />
      <div className="absolute bottom-0 left-0 right-0 text-white p-4 bg-linear-to-t from-black">
        <h2 className="text-3xl font-bold">{profile.firstName} {profile.lastName}, {profile.age}</h2>
      </div>
    </div>
    <div className="p-4"><p className="text-sm text-gray-500 mb-2">AI persona</p><p>{profile.bio}</p></div>
    <div className="p-4 flex justify-center gap-4">
      <button disabled={disabled} aria-label="Skip profile" className="bg-red-500 rounded-full p-4 text-white disabled:opacity-50" onClick={() => onSwipe(profile.id, "left")}><X size={24} /></button>
      <button disabled={disabled} aria-label="Match with profile" className="bg-green-500 rounded-full p-4 text-white disabled:opacity-50" onClick={() => onSwipe(profile.id, "right")}><Heart size={24} /></button>
    </div>
  </section>;
}
