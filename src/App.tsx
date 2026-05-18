// Circle — application root: Router + Layout + 32 routes
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/providers/AppProvider";
import { Layout } from "@/components/shell/Layout";
import { Splash } from "@/components/Splash";
import { Onboarding } from "@/components/Onboarding";

// Core / discover -------------------------------------------------------------
import { HomeScreen }        from "@/screens/HomeScreen";
import CovenantScreen        from "@/screens/CovenantScreen";
import VisionScreen          from "@/screens/VisionScreen";
import IdentityScreen        from "@/screens/IdentityScreen";

// Four pillars ----------------------------------------------------------------
import { WaslScreen }        from "@/screens/WaslScreen";
import { MashahdScreen }     from "@/screens/MashahdScreen";
import { LamahatScreen }     from "@/screens/LamahatScreen";
import { MidanScreen }       from "@/screens/MidanScreen";

// Community -------------------------------------------------------------------
import CirclesScreen         from "@/screens/CirclesScreen";
import ChannelsScreen        from "@/screens/ChannelsScreen";
import MaktabScreen          from "@/screens/MaktabScreen";
import ProScreen             from "@/screens/ProScreen";
import VerifyScreen          from "@/screens/VerifyScreen";
import GovernanceScreen      from "@/screens/GovernanceScreen";

// Life ------------------------------------------------------------------------
import { RihlaScreen }       from "@/screens/RihlaScreen";
import { PayScreen }         from "@/screens/PayScreen";
import MailScreen            from "@/screens/MailScreen";
import IDScreen              from "@/screens/IDScreen";
import MapsScreen            from "@/screens/MapsScreen";
import TranslateScreen       from "@/screens/TranslateScreen";
import AppsScreen            from "@/screens/AppsScreen";
import UniqueScreen          from "@/screens/UniqueScreen";

// AI & privacy ----------------------------------------------------------------
import MeshScreen            from "@/screens/MeshScreen";
import AISafetyScreen        from "@/screens/AISafetyScreen";
import AICoreScreen          from "@/screens/AICoreScreen";
import BackupScreen          from "@/screens/BackupScreen";
import PrivacyScreen         from "@/screens/PrivacyScreen";

// Open source -----------------------------------------------------------------
import ArchitectureScreen    from "@/screens/ArchitectureScreen";
import DREScreen             from "@/screens/DREScreen";
import TechStackScreen       from "@/screens/TechStackScreen";
import ModelsScreen          from "@/screens/ModelsScreen";
import SelfhostScreen        from "@/screens/SelfhostScreen";
import RoadmapScreen         from "@/screens/RoadmapScreen";
import TransparencyScreen    from "@/screens/TransparencyScreen";
import JourneysScreen        from "@/screens/JourneysScreen";

// Misc ------------------------------------------------------------------------
import { ProfileScreen }     from "@/screens/ProfileScreen";
import NotFound              from "@/pages/NotFound";

const queryClient = new QueryClient();

function BootGate({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === "undefined") return true;
    return !localStorage.getItem("circle-onboarded");
  });

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1600);
    return () => clearTimeout(t);
  }, []);

  const finishOnboarding = () => {
    localStorage.setItem("circle-onboarded", "1");
    setShowOnboarding(false);
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && <Splash />}
      </AnimatePresence>
      {!showSplash && showOnboarding ? (
        <Onboarding onDone={finishOnboarding} />
      ) : (
        children
      )}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <BootGate>
            <Routes>
              <Route element={<Layout />}>
                {/* Discover */}
                <Route path="/"             element={<HomeScreen />} />
                <Route path="/covenant"     element={<CovenantScreen />} />
                <Route path="/vision"       element={<VisionScreen />} />
                <Route path="/identity"     element={<IdentityScreen />} />

                {/* Four pillars */}
                <Route path="/wasl"         element={<WaslScreen />} />
                <Route path="/mashahd"      element={<MashahdScreen />} />
                <Route path="/lamahat"      element={<LamahatScreen />} />
                <Route path="/midan"        element={<MidanScreen />} />

                {/* Community */}
                <Route path="/circles"      element={<CirclesScreen />} />
                <Route path="/channels"     element={<ChannelsScreen />} />
                <Route path="/maktab"       element={<MaktabScreen />} />
                <Route path="/pro"          element={<ProScreen />} />
                <Route path="/verify"       element={<VerifyScreen />} />
                <Route path="/governance"   element={<GovernanceScreen />} />

                {/* Life */}
                <Route path="/rihla"        element={<RihlaScreen />} />
                <Route path="/pay"          element={<PayScreen />} />
                <Route path="/mail"         element={<MailScreen />} />
                <Route path="/id"           element={<IDScreen />} />
                <Route path="/maps"         element={<MapsScreen />} />
                <Route path="/translate"    element={<TranslateScreen />} />
                <Route path="/apps"         element={<AppsScreen />} />
                <Route path="/unique"       element={<UniqueScreen />} />

                {/* AI & privacy */}
                <Route path="/mesh"         element={<MeshScreen />} />
                <Route path="/aisafety"     element={<AISafetyScreen />} />
                <Route path="/aicore"       element={<AICoreScreen />} />
                <Route path="/backup"       element={<BackupScreen />} />
                <Route path="/privacy"      element={<PrivacyScreen />} />

                {/* Open source */}
                <Route path="/architecture" element={<ArchitectureScreen />} />
                <Route path="/dre"          element={<DREScreen />} />
                <Route path="/techstack"    element={<TechStackScreen />} />
                <Route path="/models"       element={<ModelsScreen />} />
                <Route path="/selfhost"     element={<SelfhostScreen />} />
                <Route path="/roadmap"      element={<RoadmapScreen />} />
                <Route path="/transparency" element={<TransparencyScreen />} />
                <Route path="/journeys"     element={<JourneysScreen />} />

                {/* Profile */}
                <Route path="/profile"      element={<ProfileScreen />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BootGate>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
