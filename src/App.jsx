import { MessageCircle, User } from "lucide-react";
import { useState } from "react";
import ChatScreen from "./ChatScreen";
import MatchesList from "./MatchList";
import ProfileSelector from "./ProfileSelector";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("profile");

  const renderScreen = () => {
    switch (currentScreen) {
      case "profile":
        return <ProfileSelector />;
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
