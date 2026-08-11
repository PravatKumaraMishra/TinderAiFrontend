import { Heart, MessageCircle, User, X } from "lucide-react";
import { useState } from "react";
export default function App() {
  const ProfileSelector = () => (
    <div className="rounded-lg overflow-hidden bg-white shadow-lg">
      <div className="relative">
        <img src="http://127.0.0.1:8081/0157aa70-0034-420a-bd76-2a8912defe16.jpg" />
        <div className="absolute bottom-0 left-0 right-0 text-white p-4 bg-linear-to-t from-black">
          <h2 className="text-3xl font-bold">Pravat Mishra, 26</h2>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 mb-4">
          I am a software engineer with 2.5 years of experience in the industry.
          I am looking for a new job.
        </p>
      </div>
      <div className="p-4 flex justify-center space-x-4">
        <button
          className="bg-red-500 rounded-full p-4 text-white hover:bg-red-700"
          onClick={() => console.log("left")}
        >
          <X size={24} />
        </button>
        <button
          className="bg-green-500 rounded-full p-4 text-white hover:bg-green-700"
          onClick={() => console.log("right")}
        >
          <Heart size={24} />
        </button>
      </div>
    </div>
  );

  const MatchesList = () => (
    <div className="rounded-lg shadow-lg p-4">
      <h2 className="text-2xl font-bold mb-4">Matches</h2>
      <ul>
        {[
          {
            id: 1,
            firstName: "Shyamali",
            lastName: "Das",
            imageUrl:
              "http://127.0.0.1:8081/3ab5dd01-35c3-41c3-8685-8f9c7ce44261.jpg",
          },
          {
            id: 2,
            firstName: "Piyali",
            lastName: "Maity",
            imageUrl:
              "http://127.0.0.1:8081/b15ba4db-0430-4998-b9ab-7f3dca6b01ca.jpg",
          },
        ].map((match) => (
          <li key={match.id} className="mb-2">
            <button className="w-full hover:bg-gray-100 rounded flex item-center">
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

  const [currentScreen, setCurrentScreen] = useState("profile");

  const renderScreen = () => {
    switch (currentScreen) {
      case "profile":
        return <ChatScreen />;
      case "matches":
        return <MatchesList />;
    }
  };

  const ChatScreen = () => {
    const [input, setInput] = useState("");

    const handleSend = () => {
      if (input.trim()) {
        console.log(input);
        setInput("");
      }
    };

    return (
      <div className="rounded-lg shadow-lg p-4">
        <h2 className="text-2xl font-bold mb-4">Chat with Foo Bar</h2>
        <div className="h-[50vh] border rounded overflow-y-auto mb-4 p-2">
          {[
            "Hi",
            "How are you?",
            "How are you?",
            "How are you?",
            "How are you?",
            "How are you?",
            "How are you?",
            "How are you?",
          ].map((message, index) => (
            <div key={index}>
              <div className="mb-4 p-2 rounded bg-gray-100">{message}</div>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="border flex-1 rounded p-2 mr-2"
            placeholder="Type a message..."
          />
          <button
            className="bg-blue-500 text-white rounded p-2"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <nav className="flex justify-between mb-4">
        <User onClick={() => setCurrentScreen("profile")} />
        <MessageCircle onClick={() => setCurrentScreen("matches")} />
      </nav>
      {renderScreen()}
    </div>
  );
}
