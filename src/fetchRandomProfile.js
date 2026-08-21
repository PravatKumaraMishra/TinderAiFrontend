const fetchRandomProfile = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/profiles/random`,
  );
  if (!response.ok) throw new Error("Failed to catch profile");
  return response.json();
};
export default fetchRandomProfile;
