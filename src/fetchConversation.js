const fetchConversation = async (conversationId) => {
  console.log("fetching conversation: " + conversationId);
  const response = await fetch(
    `http://localhost:8080/conversations/${conversationId}`,
  );
  if (!response.ok) throw new Error("Failed to fetch conversation");
  return response.json();
};
export default fetchConversation;
