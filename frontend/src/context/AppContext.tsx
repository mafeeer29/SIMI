import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Role, SimRequest, CreateRequestInput } from "../types/request";
import { mockRequests, mockWallets } from "../data/mockRequests";

const DEFAULT_WALLET = "0x71F3…8AC2";

interface AppContextValue {
  role: Role;
  requests: SimRequest[];
  addRequest: (input: CreateRequestInput) => void;
  updateRequest: (id: number, patch: Partial<SimRequest>) => void;
  getRequest: (id: number) => SimRequest | undefined;
  walletConnected: boolean;
  walletAddress: string;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<SimRequest[]>(mockRequests);
  const [walletConnected, setWalletConnected] = useState(true);
  const [walletAddress] = useState<string>(DEFAULT_WALLET);

  const role = useMemo<Role>(() => {
    if (!walletConnected) return null;
    return mockWallets[walletAddress]?.role ?? null;
  }, [walletAddress, walletConnected]);

  const value = useMemo<AppContextValue>(() => {
    const addRequest = ({ lineId, holder }: CreateRequestInput) => {
      setRequests((prev) => {
        const nextId = Math.max(0, ...prev.map((r) => r.id)) + 1;
        const newReq: SimRequest = {
          id: nextId,
          lineId,
          operator: walletAddress,
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
      requests,
      addRequest,
      updateRequest,
      getRequest,
      walletConnected,
      walletAddress,
      connectWallet: () => setWalletConnected(true),
      disconnectWallet: () => setWalletConnected(false),
    };
  }, [role, requests, walletConnected, walletAddress]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
