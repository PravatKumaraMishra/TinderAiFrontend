import { useState } from "react";
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
          onClick={() => handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};
export default ChatScreen;
