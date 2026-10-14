import { imageUrl } from "./api";

export default function MatchesList({ matches, onSelectMatch }) {
  return <section className="rounded-lg shadow-lg p-4">
    <h2 className="text-2xl font-bold mb-4">Your matches</h2>
    {!matches.length && <p>No matches yet. Browse AI profiles to start.</p>}
    <ul>{matches.map((match) => <li key={match.id} className="mb-2">
      <button className="w-full hover:bg-gray-100 rounded flex items-center text-left" onClick={() => onSelectMatch(match.profile, match.conversationId)}>
        <img src={imageUrl(match.profile.imageUrl)} alt={match.profile.firstName} className="w-16 h-16 rounded-full mr-3 object-cover" />
        <span className="font-bold">{match.profile.firstName} {match.profile.lastName}</span>
      </button>
    </li>)}</ul>
  </section>;
}
