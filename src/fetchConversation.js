const fetchConversation = async (conversationId) => {
  console.log("fetching conversation: " + conversationId);
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/conversations/${conversationId}`,
  );
  if (!response.ok) throw new Error("Failed to fetch conversation");
  return response.json();
};
export default fetchConversation;
