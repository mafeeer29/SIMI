import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AppProvider } from "./context/AppContext";
import { Landing } from "./pages/Landing";
import { GeneralDashboard } from "./pages/GeneralDashboard";
import { OperatorDashboard } from "./pages/OperatorDashboard";
import { VerifierDashboard } from "./pages/VerifierDashboard";
import { HolderDashboard } from "./pages/HolderDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Navbar />
        <main className="min-h-[calc(100vh-65px)]">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<GeneralDashboard />} />
            <Route path="/operator" element={<OperatorDashboard />} />
            <Route path="/verifier" element={<VerifierDashboard />} />
            <Route path="/holder" element={<HolderDashboard />} />
          </Routes>
        </main>
      </AppProvider>
    </BrowserRouter>
  );
}
