import { apiRequest } from "./api.js";
export default function sendMessage(id, messageText) {
  return apiRequest(`/conversations/${encodeURIComponent(id)}`, { method: "POST", body: { messageText } });
}
