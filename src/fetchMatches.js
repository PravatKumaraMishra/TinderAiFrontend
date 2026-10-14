import { apiRequest } from "./api";
export default function fetchMatches() { return apiRequest("/matches"); }
