const fetchMatches = async () => {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/matches`);
  if (!response.ok) throw new Error("Can't fetch matches");
  return response.json();
};
export default fetchMatches;
