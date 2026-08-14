const fetchMatches = async () => {
  const response = await fetch("http://localhost:8080/matches");
  if (!response.ok) throw new Error("Can't fetch matches");
  return response.json();
};
export default fetchMatches;
