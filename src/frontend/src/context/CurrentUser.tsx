import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { UserRef } from "../types";

// There is no auth in Core, but actions still need an acting user (createdBy,
// comment author). We model a lightweight "acting as" selector persisted to
// localStorage, seeded from the user list.
interface CurrentUserContextValue {
  users: UserRef[];
  currentUser: UserRef | null;
  setCurrentUserId: (id: string) => void;
  isLoading: boolean;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

const STORAGE_KEY = "supportdesk.currentUserId";

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: api.listUsers,
  });

  const [currentUserId, setId] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY),
  );

  useEffect(() => {
    if (!isLoading && users.length > 0) {
      const stillValid = currentUserId && users.some((u) => u.id === currentUserId);
      if (!stillValid) {
        setId(users[0].id);
      }
    }
  }, [isLoading, users, currentUserId]);

  const setCurrentUserId = (id: string) => {
    setId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId],
  );

  return (
    <CurrentUserContext.Provider
      value={{ users, currentUser, setCurrentUserId, isLoading }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within CurrentUserProvider");
  return ctx;
}
