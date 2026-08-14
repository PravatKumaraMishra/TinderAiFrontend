const fetchRandomProfile = async () => {
  const response = await fetch("http://localhost:8080/profiles/random");
  if (!response.ok) throw new Error("Failed to catch profile");
  return response.json();
};
export default fetchRandomProfile;
