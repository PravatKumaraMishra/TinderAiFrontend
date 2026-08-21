const sendMessage = async (conversationId, message) => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/conversations/${conversationId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messageText: message, authorId: "user" }),
    },
  );
  if (!response.ok) throw new Error("Failed to submit message");

  return response.json();
};
export default sendMessage;
