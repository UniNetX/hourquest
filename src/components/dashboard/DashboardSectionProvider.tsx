"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  parseDashboardSection,
  type DashboardSectionId,
} from "@/lib/dashboard-nav";

type DashboardSectionContextValue = {
  section: DashboardSectionId;
  goToSection: (
    id: DashboardSectionId,
    options?: { challengeId?: string | null },
  ) => void;
};

const DashboardSectionContext = createContext<DashboardSectionContextValue | null>(
  null,
);

function readSectionFromUrl(): DashboardSectionId {
  if (typeof window === "undefined") return "overview";
  return parseDashboardSection(window.location.hash);
}

export function DashboardSectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Must match server HTML on first paint — read hash only after mount in useEffect.
  const [section, setSection] = useState<DashboardSectionId>("overview");

  const syncFromUrl = useCallback(() => {
    setSection(readSectionFromUrl());
  }, []);

  useLayoutEffect(() => {
    syncFromUrl();
  }, [pathname, syncFromUrl]);

  useEffect(() => {
    const onHashChange = () => syncFromUrl();
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
    };
  }, [syncFromUrl]);

  const goToSection = useCallback(
    (id: DashboardSectionId, options?: { challengeId?: string | null }) => {
      setSection(id);

      if (typeof window === "undefined") return;

      const url = new URL(window.location.href);
      url.pathname = "/dashboard";
      url.hash = id;

      if (options?.challengeId) {
        url.searchParams.set("challengeId", options.challengeId);
      } else if (id !== "submit") {
        url.searchParams.delete("challengeId");
      }

      const next = url.pathname + url.search + url.hash;
      window.history.pushState(null, "", next);
    },
    [],
  );

  const value = useMemo(
    () => ({ section, goToSection }),
    [section, goToSection],
  );

  return (
    <DashboardSectionContext.Provider value={value}>
      {children}
    </DashboardSectionContext.Provider>
  );
}

export function useDashboardSection() {
  const ctx = useContext(DashboardSectionContext);
  if (!ctx) {
    throw new Error("useDashboardSection must be used within DashboardSectionProvider");
  }
  return ctx;
}
