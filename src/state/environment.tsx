import { createContext, useContext, useState, type ReactNode } from 'react';
import { demoEnvironments, type DemoEnvironment } from '../data/demo';

// Ambiente attivo (dec. 62). Stato locale finché non c'è un backend (dec. 53).
const Ctx = createContext<{ active: DemoEnvironment; setActive: (id: string) => void } | null>(null);

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState(demoEnvironments[0].id);
  const active = demoEnvironments.find((e) => e.id === activeId) ?? demoEnvironments[0];
  return <Ctx.Provider value={{ active, setActive: setActiveId }}>{children}</Ctx.Provider>;
}

export function useEnvironment() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useEnvironment fuori da EnvironmentProvider');
  return v;
}
