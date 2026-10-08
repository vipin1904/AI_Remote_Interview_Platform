import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";

import { Toaster } from "react-hot-toast";
import DashboardPage from "./pages/DashboardPage";
import ProblemPage from "./pages/ProblemPage";
import ProblemsPage from "./pages/ProblemsPage";
import SessionPage from "./pages/SessionPage";

import { RoleProvider } from "./context/RoleContext";
import RoleSelectionModal from "./components/RoleSelectionModal";

function App() {
  const { isSignedIn, isLoaded } = useUser();

  // Show clean spinner while Clerk authentication initializes
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-base-300 flex flex-col items-center justify-center gap-3">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-sm font-medium text-base-content/60">Loading Talent IQ...</p>
      </div>
    );
  }

  return (
    <RoleProvider>
      <Routes>
        <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/dashboard" element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />} />

        <Route path="/problems" element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />} />
        <Route path="/problem/:id" element={isSignedIn ? <ProblemPage /> : <Navigate to={"/"} />} />
        <Route path="/session/:id" element={isSignedIn ? <SessionPage /> : <Navigate to={"/"} />} />
      </Routes>

      <RoleSelectionModal />
      <Toaster toastOptions={{ duration: 3000 }} />
    </RoleProvider>
  );
}

export default App;
