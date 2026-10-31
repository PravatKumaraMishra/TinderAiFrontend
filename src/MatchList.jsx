import { imageUrl } from "./api";

export default function MatchesList({ matches, onSelectMatch }) {
  return <section className="glass matches-panel">
    <h2 className="text-2xl font-bold mb-4">Your matches</h2>
    {!matches.length && <p>Your next conversation is waiting. Discover a personality and tap the heart to make your first connection.</p>}
    <ul>{matches.map((match) => <li key={match.id} className="mb-2">
      <button className="match-row" onClick={() => onSelectMatch(match.profile, match.conversationId)}>
        <img src={imageUrl(match.profile.imageUrl)} alt={match.profile.firstName} className="w-16 h-16 rounded-full mr-3 object-cover" />
        <span className="font-bold">{match.profile.firstName} {match.profile.lastName}</span>
      </button>
    </li>)}</ul>
  </section>;
}
