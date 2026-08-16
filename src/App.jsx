import { MessageCircle, User } from "lucide-react";
import { useEffect, useState } from "react";
import saveSwipe from "../saveSwipe";
import ChatScreen from "./ChatScreen";
import MatchesList from "./MatchList";
import ProfileSelector from "./ProfileSelector";
import fetchConversation from "./fetchConversation";
import fetchMatches from "./fetchMatches";
import fetchRandomProfile from "./fetchRandomProfile";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("profile");
  const [currentProfile, setCurrentProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [currentMatchAndConversation, setCurrentMatchAndConversation] =
    useState({ match: {}, conversation: [] });

  const loadRandomProfile = async () => {
    try {
      const profile = await fetchRandomProfile();
      setCurrentProfile(profile);
    } catch (error) {
      console.log(error);
    }
  };

  const loadMatches = async () => {
    try {
      const matches = await fetchMatches();
      setMatches(matches);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadRandomProfile();
    loadMatches();
  }, []);

  const onSwipe = async (profileId, direction) => {
    loadRandomProfile();
    if (direction === "right") {
      await saveSwipe(profileId);
      await loadMatches();
    }
    loadRandomProfile();
  };

  const onSelectMatch = async (profile, conversationId) => {
    const conversation = await fetchConversation(conversationId);
    setCurrentMatchAndConversation({
      match: profile,
      conversation: conversation,
    });
    setCurrentScreen("chat");
  };

  const refreshChatState = async () => {
    const conversation = await fetchConversation(
      currentMatchAndConversation.conversation.id,
    );
    setCurrentMatchAndConversation({
      match: currentMatchAndConversation.match,
      conversation: conversation,
    });
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "profile":
        return <ProfileSelector profile={currentProfile} onSwipe={onSwipe} />;
      case "matches":
        return <MatchesList matches={matches} onSelectMatch={onSelectMatch} />;
      case "chat":
        console.log(currentMatchAndConversation);
        return (
          <ChatScreen
            currentMatch={currentMatchAndConversation.match}
            conversation={currentMatchAndConversation.conversation}
            refreshState={refreshChatState}
          />
        );
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <nav className="flex justify-between mb-4">
        <User onClick={() => setCurrentScreen("profile")} />
        <MessageCircle onClick={() => setCurrentScreen("matches")} />
      </nav>
      {renderScreen()}
    </div>
  );
}
