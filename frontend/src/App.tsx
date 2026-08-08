import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AppProvider, useApp } from "./context/AppContext";
import { Landing } from "./pages/Landing";
import { GeneralDashboard } from "./pages/GeneralDashboard";
import { OperatorDashboard } from "./pages/OperatorDashboard";
import { VerifierDashboard } from "./pages/VerifierDashboard";
import { HolderDashboard } from "./pages/HolderDashboard";
import type { CreateRequestInput } from "./types/request";

function DashboardRouter() {
  const { role, requests, addRequest, updateRequest } = useApp();

  const onCreateRequest = (input: CreateRequestInput) => {
    addRequest(input);
  };

  const onVerifyIdentity = (requestId: number) => {
    updateRequest(requestId, {
      identityVerified: true,
      status: "IdentityVerified",
    });
  };

  const onConfirm = (requestId: number) => {
    updateRequest(requestId, {
      holderConfirmed: true,
      status: "Authorized",
    });
  };

  const onDispute = (requestId: number) => {
    updateRequest(requestId, {
      disputed: true,
      status: "Disputed",
    });
  };

  const onSelectRequest = (requestId: number) => {
    console.debug("Selected request", requestId);
  };

  switch (role) {
    case "Operator":
      return (
        <OperatorDashboard
          requests={requests}
          onCreateRequest={onCreateRequest}
          onSelectRequest={onSelectRequest}
        />
      );
    case "Verifier":
      return (
        <VerifierDashboard
          requests={requests}
          onVerifyIdentity={onVerifyIdentity}
        />
      );
    case "Holder":
      return (
        <HolderDashboard
          requests={requests}
          onConfirm={onConfirm}
          onDispute={onDispute}
        />
      );
    default:
      return <GeneralDashboard requests={requests} />;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Navbar />
        <main className="min-h-[calc(100vh-65px)]">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
          </Routes>
        </main>
      </AppProvider>
    </BrowserRouter>
  );
}
