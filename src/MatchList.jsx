const MatchesList = ({ onSelectMatch }) => (
  <div className="rounded-lg shadow-lg p-4">
    <h2 className="text-2xl font-bold mb-4">Matches</h2>
    <ul>
      {[
        {
          id: 1,
          firstName: "Shyamali",
          lastName: "Das",
          imageUrl:
            "http://127.0.0.1:8080/3ab5dd01-35c3-41c3-8685-8f9c7ce44261.jpg",
        },
        {
          id: 2,
          firstName: "Piyali",
          lastName: "Maity",
          imageUrl:
            "http://127.0.0.1:8080/b15ba4db-0430-4998-b9ab-7f3dca6b01ca.jpg",
        },
      ].map((match) => (
        <li key={match.id} className="mb-2">
          <button
            className="w-full hover:bg-gray-100 rounded flex item-center"
            onClick={onSelectMatch}
          >
            <img
              src={match.imageUrl}
              className="w-16 h-16 rounded-full mr-3 object-cover"
            />
            <span>
              <h3 className="font-bold">
                {match.firstName} {match.lastName}
              </h3>
            </span>
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default MatchesList;
