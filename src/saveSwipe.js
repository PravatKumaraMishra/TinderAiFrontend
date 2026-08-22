const saveSwipe = async (profileId) => {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/matches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ profileId }),
  });
  if (!response.ok) throw new Error("Failed to save swipe");
};
export default saveSwipe;
