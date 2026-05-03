import { useState, useEffect } from "react";
import LockScreen from "./LockScreen";

const SESSION_KEY = "whimsey_session";

export interface WhimseySession {
  role: "owner" | "manager";
  name: string;
  unlockedAt: number;
}

function loadSession(): WhimseySession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WhimseySession;
  } catch {
    return null;
  }
}

function saveSession(session: WhimseySession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

interface Props {
  children: (session: WhimseySession) => React.ReactNode;
}

export default function AuthGate({ children }: Props) {
  const [session, setSession] = useState<WhimseySession | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setSession(loadSession());
    setChecked(true);
  }, []);

  function handleUnlock(role: string, name: string) {
    const s: WhimseySession = {
      role: role as "owner" | "manager",
      name,
      unlockedAt: Date.now(),
    };
    saveSession(s);
    setSession(s);
  }

  if (!checked) return null;
  if (!session) return <LockScreen onUnlock={handleUnlock} />;
  return <>{children(session)}</>;
}
