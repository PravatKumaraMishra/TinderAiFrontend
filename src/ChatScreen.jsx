import { Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import sendMessage from "./sendMessage";
import { imageUrl as profileImageUrl } from "./api";

const ChatScreen = ({ currentMatch, conversation, currentUserId, refreshState }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(conversation?.messages ?? []);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const chatContainerRef = useRef(null);

  useEffect(() => {
    setMessages(conversation?.messages ?? []);
  }, [conversation]);

  useEffect(() => {
    const node = chatContainerRef.current;
    if (!node) return;

    requestAnimationFrame(() => {
      node.scrollTop = node.scrollHeight;
    });
  }, [messages, isTyping]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleSend = async (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed || isTyping) return;

    const optimisticUserMessage = {
      authorId: currentUserId,
      messageText: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setInput("");
    setIsTyping(true);
    setError("");

    try {
      await sendMessage(conversation.id, trimmed);
      await refreshState();
    } catch (error) {
      setError(error.message);
      setInput(trimmed);
      setMessages((prev) =>
        prev.filter(
          (msg, index) =>
            !(
              index === prev.length - 1 &&
              msg.authorId === currentUserId &&
              msg.messageText === trimmed &&
              msg.createdAt === optimisticUserMessage.createdAt
            ),
        ),
      );
      if (error.status === 409) await refreshState().catch(() => {});
    } finally {
      setIsTyping(false);
    }
  };

  const imageUrl = profileImageUrl(currentMatch?.imageUrl);
  return currentMatch ? (
    <div className="rounded-lg shadow-lg p-4">
      <h2 className="text-2xl font-bold mb-4">
        Chat with {currentMatch.firstName} {currentMatch.lastName}
      </h2>

      <div
        ref={chatContainerRef}
        className="h-[50vh] border rounded-lg overflow-y-auto mb-6 p-4 bg-gray-50"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.authorId}-${index}-${message.createdAt ?? "no-time"}`}
            className={`flex ${
              message.authorId === currentUserId ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <div
              className={`flex items-end ${
                message.authorId === currentUserId ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {message.authorId === currentUserId ? (
                <User size={15} />
              ) : (
                <img
                  src={imageUrl}
                  className="w-11 h-11 rounded-full"
                  alt={currentMatch.firstName}
                />
              )}

              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  message.authorId === currentUserId
                    ? "bg-blue-500 text-white ml-2"
                    : "bg-gray-200 text-gray-800 mr-2"
                }`}
              >
                {message.messageText}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="flex items-end flex-row">
              <img
                src={imageUrl}
                className="w-11 h-11 rounded-full"
                alt={currentMatch.firstName}
              />
              <div className="bg-gray-200 text-gray-800 mr-2 px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-2 w-2 rounded-full bg-gray-500 animate-pulse"
                      style={{ animationDelay: `${dot * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p role="alert" className="text-red-600 mb-3">{error}</p>}
      <div className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          maxLength={4000}
          disabled={isTyping}
          className="flex-1 border-2 border-gray-300 rounded-full py-2 px-4 mr-2 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          placeholder="Type a message..."
        />
        <button
          aria-label="Send message"
          className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
          onClick={() => handleSend(input)}
          disabled={isTyping}
        >
          <Send size={24} />
        </button>
      </div>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default ChatScreen;
