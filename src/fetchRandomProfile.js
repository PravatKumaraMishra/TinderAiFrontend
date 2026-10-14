import { apiRequest } from "./api";
export default function fetchRandomProfile() { return apiRequest("/profiles/random"); }
