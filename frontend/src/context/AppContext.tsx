import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Role, SimRequest } from "../types/request";
import { mockRequests } from "../data/mockRequests";

const MOCK_WALLET = "0x71F3…8AC2";

interface AppContextValue {
  role: Role;
  setRole: (r: Role) => void;
  requests: SimRequest[];
  addRequest: (lineId: string, holder: string) => void;
  updateRequest: (id: number, patch: Partial<SimRequest>) => void;
  getRequest: (id: number) => SimRequest | undefined;
  walletConnected: boolean;
  walletAddress: string;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("Operator");
  const [requests, setRequests] = useState<SimRequest[]>(mockRequests);
  const [walletConnected, setWalletConnected] = useState(true);

  const value = useMemo<AppContextValue>(() => {
    const addRequest = (lineId: string, holder: string) => {
      setRequests((prev) => {
        const nextId = Math.max(0, ...prev.map((r) => r.id)) + 1;
        const newReq: SimRequest = {
          id: nextId,
          lineId,
          operator: "0x71F3…8AC2",
          holder,
          createdAt: new Date().toISOString(),
          identityVerified: false,
          holderConfirmed: false,
          disputed: false,
          status: "Created",
        };
        return [newReq, ...prev];
      });
    };

    const updateRequest = (id: number, patch: Partial<SimRequest>) => {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
      );
    };

    const getRequest = (id: number) => requests.find((r) => r.id === id);

    return {
      role,
      setRole,
      requests,
      addRequest,
      updateRequest,
      getRequest,
      walletConnected,
      walletAddress: MOCK_WALLET,
      connectWallet: () => setWalletConnected(true),
      disconnectWallet: () => setWalletConnected(false),
    };
  }, [role, requests, walletConnected]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
