import { useEffect, useRef, useState } from "react";
import { Compass, Heart, LogOut, UserRound, ChevronUp, Monitor } from "lucide-react";
import { imageUrl } from "./api";
import AppFooter from "./AppFooter";
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
  const [appearance, setAppearance] = useState(() => {
    try { return ["light", "dark", "system"].includes(localStorage.getItem("tinderai-appearance")) ? localStorage.getItem("tinderai-appearance") : "system"; }
    catch { return "system"; }
  });
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => { document.documentElement.dataset.theme = appearance === "system" ? (media.matches ? "dark" : "light") : appearance; };
    apply();
    try { localStorage.setItem("tinderai-appearance", appearance); } catch { /* Theme remains usable without storage. */ }
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [appearance]);
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
  if (restoring) return <main className="app-root" role="status">Restoring session…</main>;
  if (restoreError) return <main className="app-root"><p role="alert">{restoreError}</p><button onClick={() => window.location.reload()}>Retry</button></main>;
  return <><main className="app-root">
    {account && notice && <p role="alert">{notice}</p>}
    {account ? <SignedInApp key={account.id} account={account} onUpdated={setAccount} onLogout={signOut} appearance={appearance} onAppearanceChange={setAppearance} />
      : <AuthScreen onAuthenticated={authenticated} notice={notice} />}
  </main><AppFooter /></>;
}

function SignedInApp({ account, onUpdated, onLogout, appearance, onAppearanceChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
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
  return <div className="app-shell">
    <aside className="sidebar glass">
      <a className="brand" href="/" aria-label="TinderAI home"><img src="/icon.svg" alt="" />Tinder<span>AI</span></a>

      <nav aria-label="Main navigation" className="main-nav">
        <button className={screen === "browse" ? "active" : ""} disabled={!account.profile || busy} onClick={() => { setError(""); setScreen("browse"); }}><Compass size={21} /><span>Discover</span></button>
        <button className={screen === "matches" || screen === "chat" ? "active" : ""} disabled={!account.profile || busy} onClick={openMatches}><Heart size={21} /><span>Matches</span></button>
      </nav>
      <div className="profile-control">
        {menuOpen && <><button className="menu-dismiss" aria-label="Close profile menu" onClick={() => setMenuOpen(false)} /><div className="profile-menu glass" role="menu"><p>{account.email}</p><button role="menuitem" onClick={() => { setScreen("account"); setMenuOpen(false); }}><UserRound size={18} />My profile & photo</button><label className="system-theme"><Monitor size={18} />Appearance<select aria-label="Appearance" value={appearance} onChange={event => onAppearanceChange(event.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label><button role="menuitem" className="signout" onClick={onLogout}><LogOut size={18} />Sign out</button></div></>}
        <button className="profile-trigger" aria-label="Open profile menu" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{account.profile?.imageUrl ? <img className="avatar" src={imageUrl(account.profile.imageUrl)} alt="Your profile" /> : <span className="avatar avatar-fallback"><UserRound size={22} /></span>}<span className="profile-name"><strong>{account.profile?.firstName || "Your account"}</strong><small>Personal space</small></span><ChevronUp size={16} /></button>
      </div>
    </aside>
    <div className="workspace">
      {screen !== "browse" && <header className="page-header"><h1>{screen === "account" ? "Profile" : screen === "matches" ? "Matches" : screen === "chat" ? "Conversation" : "Discover"}</h1></header>}
      {error && <p role="alert" className="notice error">{error}</p>}
      {!account.profile || screen === "account" ? <AccountScreen account={account} onUpdated={onUpdated} />
        : screen === "browse" ? <ProfileSelector profile={profile} onSwipe={swipe} disabled={busy} />
        : screen === "matches" ? <><MatchesList matches={matches} onSelectMatch={selectMatch} />{busy && <p role="status">Loading…</p>}</>
        : chat && <ChatScreen key={chat.conversation.id} currentMatch={chat.match} conversation={chat.conversation} currentUserId={account.id} refreshState={refreshChat} />}

    </div>
  </div>;
}
