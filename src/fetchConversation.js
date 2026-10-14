import { apiRequest } from "./api";
export default function fetchConversation(id) { return apiRequest(`/conversations/${encodeURIComponent(id)}`); }
