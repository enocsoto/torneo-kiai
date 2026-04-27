"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getOopLearning, setOopLearning } from "@/lib/oop-learning";

type Ctx = {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
};

const OopLearningContext = createContext<Ctx | null>(null);

export function OopLearningProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(false);

  useEffect(() => {
    setEnabledState(getOopLearning());
  }, []);

  const setEnabled = useCallback((v: boolean) => {
    setOopLearning(v);
    setEnabledState(v);
  }, []);

  const value = useMemo(() => ({ enabled, setEnabled }), [enabled, setEnabled]);

  return (
    <OopLearningContext.Provider value={value}>
      {children}
    </OopLearningContext.Provider>
  );
}

export function useOopLearning(): Ctx {
  const c = useContext(OopLearningContext);
  if (!c) throw new Error("useOopLearning dentro de OopLearningProvider");
  return c;
}
