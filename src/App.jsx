import { MessageCircle, User } from "lucide-react";
import { useEffect, useState } from "react";
import ChatScreen from "./ChatScreen";
import MatchesList from "./MatchList";
import ProfileSelector from "./ProfileSelector";
import fetchRandomProfile from "./fetchRandomProfile";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("profile");
  const [currentProfile, setCurrentProfile] = useState(null);

  const loadRandomProfile = async () => {
    try {
      const profile = await fetchRandomProfile();
      setCurrentProfile(profile);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadRandomProfile();
  }, []);

  const onSwipe = (direction) => {
    if (direction === "right") {
      console.log("Liked");
    }
    loadRandomProfile();
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "profile":
        return <ProfileSelector profile={currentProfile} onSwipe={onSwipe} />;
      case "matches":
        return <MatchesList onSelectMatch={() => setCurrentScreen("chat")} />;
      case "chat":
        return <ChatScreen />;
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
