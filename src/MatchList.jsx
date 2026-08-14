const MatchesList = ({ matches, onSelectMatch }) => {
  const seenIds = new Set();

  return (
    <div className="rounded-lg shadow-lg p-4">
      <h2 className="text-2xl font-bold mb-4">Matches</h2>
      <ul>
        {matches
          .filter((match) => {
            if (seenIds.has(match.profile.id)) return false;
            seenIds.add(match.profile.id);
            return true;
          })
          .map((match) => (
            <li key={match.profile.id} className="mb-2">
              <button
                className="w-full hover:bg-gray-100 rounded flex item-center"
                onClick={() =>
                  onSelectMatch(match.profile, match.conversationId)
                }
              >
                <img
                  src={"http://localhost:8081/" + match.profile.imageUrl}
                  className="w-16 h-16 rounded-full mr-3 object-cover"
                />
                <span>
                  <h3 className="font-bold">
                    {match.profile.firstName} {match.profile.lastName}
                  </h3>
                </span>
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default MatchesList;
