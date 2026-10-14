import { apiRequest } from "./api";
export default function saveSwipe(profileId) {
  return apiRequest("/matches", { method: "POST", body: { profileId } });
}
