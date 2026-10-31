import { useEffect, useRef, useState } from "react";
import AuthScreen from "./AuthScreen";
import AccountScreen from "./AccountScreen";
import ChatScreen from "./ChatScreen";
import MatchesList from "./MatchList";
import ProfileSelector from "./ProfileSelector";
import { apiRequest, setAccessToken, refreshSession, endSession } from "./api";
import fetchConversation from "./fetchConversation";
import fetchMatches from "./fetchMatches";
import fetchRandomProfile from "./fetchRandomProfile";
import saveSwipe from "./saveSwipe";

export default function App() {
  const [account, setAccount] = useState(null);
  const [notice, setNotice] = useState("");
  const [restoring, setRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState("");
  const restoration = useRef(null);
  function logout(message = "") {
    setAccessToken(null); setAccount(null); setNotice(message);
    window.google?.accounts?.id?.disableAutoSelect();
  }
  useEffect(() => {
    const expired = () => logout("Your session expired. Please sign in again.");
    window.addEventListener("auth-expired", expired);
    return () => { window.removeEventListener("auth-expired", expired); };
  }, []);
  useEffect(() => {
    let active = true;
    if (!restoration.current) restoration.current = refreshSession().then(() => apiRequest("/users/me"));
    restoration.current.then((me) => { if (active) setAccount(me); }).catch((err) => {
      if (active && err.status !== 401) setRestoreError("Could not restore your session. Please retry.");
    }).finally(() => { if (active) setRestoring(false); });
    return () => { active = false; };
  }, []);
  async function signOut() {
    setRestoring(true);
    try { await endSession(); logout(); }
    catch { setNotice("Sign-out could not be confirmed. Please retry."); }
    finally { setRestoring(false); }
  }
  async function authenticated(token) {
    setAccessToken(token.accessToken);
    try {
      const me = await apiRequest("/users/me");
      setAccount(me); setNotice("");
    } catch (err) { logout(); throw err; }
  }
  if (restoring) return <main className="max-w-md mx-auto p-4" role="status">Restoring session…</main>;
  if (restoreError) return <main className="max-w-md mx-auto p-4"><p role="alert">{restoreError}</p><button onClick={() => window.location.reload()}>Retry</button></main>;
  return <main className="max-w-md mx-auto p-4">
    {account && notice && <p role="alert">{notice}</p>}
    {account ? <SignedInApp key={account.id} account={account} onUpdated={setAccount} onLogout={signOut} />
      : <AuthScreen onAuthenticated={authenticated} notice={notice} />}
  </main>;
}

function SignedInApp({ account, onUpdated, onLogout }) {
  const [screen, setScreen] = useState(account.profile ? "browse" : "account");
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [chat, setChat] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (screen !== "browse" || !account.profile) return;
    let active = true;
    fetchRandomProfile().then((data) => { if (active) setProfile(data); })
      .catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [screen, account.profile]);
  async function swipe(id, direction) {
    if (busy) return;
    setBusy(true); setError("");
    try { if (direction === "right") await saveSwipe(id); setProfile(await fetchRandomProfile()); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function openMatches() {
    setScreen("matches"); setError(""); setBusy(true);
    try { setMatches(await fetchMatches()); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function selectMatch(match, id) {
    setBusy(true); setError("");
    try { setChat({ match, conversation: await fetchConversation(id) }); setScreen("chat"); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function refreshChat() {
    const conversation = await fetchConversation(chat.conversation.id);
    setChat({ ...chat, conversation });
  }
  return <>
    <nav aria-label="Main navigation" className="flex gap-3 items-center justify-between mb-4 text-sm">
      <button disabled={!account.profile || busy} onClick={() => { setError(""); setScreen("browse"); }}>Browse</button>
      <button disabled={!account.profile || busy} onClick={openMatches}>Matches</button>
      <button disabled={busy} onClick={() => { setError(""); setScreen("account"); }}>My profile</button>
      <button onClick={onLogout} className="text-red-700">Sign out</button>
    </nav>
    {error && <p role="alert" className="text-red-600 mb-3">{error}</p>}
    {!account.profile || screen === "account" ? <AccountScreen account={account} onUpdated={onUpdated} />
      : screen === "browse" ? <ProfileSelector profile={profile} onSwipe={swipe} disabled={busy} />
      : screen === "matches" ? <><MatchesList matches={matches} onSelectMatch={selectMatch} />{busy && <p role="status">Loading…</p>}</>
      : chat && <ChatScreen key={chat.conversation.id} currentMatch={chat.match} conversation={chat.conversation} currentUserId={account.id} refreshState={refreshChat} />}
  </>;
}
