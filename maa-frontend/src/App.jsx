import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MemoryTraining from "./pages/MemoryTraining.jsx";
import LogicTraining from "./pages/LogicTraining.jsx";
import SpeedTraining from "./pages/SpeedTraining.jsx";
import WeakTopics from "./pages/WeakTopics.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import TestHistory from "./pages/TestHistory.jsx";
import CognitiveProfile from "./pages/CognitiveProfile.jsx";
import FriendStreak from "./pages/FriendStreak.jsx";
import FocusSession from "./pages/FocusSession.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/memory" element={<MemoryTraining />} />
        <Route path="/logic" element={<LogicTraining />} />
        <Route path="/speed-training" element={<SpeedTraining />} />
        <Route path="/weak-topics" element={<WeakTopics />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/test-history" element={<TestHistory />} />
        <Route path="/cognitive-profile" element={<CognitiveProfile />} />
        <Route path="/friends" element={<FriendStreak />} />
        <Route path="/focus-session" element={<FocusSession />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;