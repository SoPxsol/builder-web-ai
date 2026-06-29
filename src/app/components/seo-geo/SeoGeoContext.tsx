/**
 * SeoGeoContext.tsx — Contexto de estado para la Suite SEO/GEO.
 * WEB-737 | Rama: sofia/web-737-gestor-redes-sociales
 *
 * Portado desde pxsol-home-mkt-division/src/context/SeoGeoContext.jsx.
 * Tipado completo con los interfaces de seo-geo-demo.ts.
 */

import {
  createContext, useCallback, useContext, useRef, useState,
  type ReactNode,
} from "react";
import {
  initialGeoQueries,
  initialCompetitors,
  initialSuggestions,
  suggestionVariants,
  initialReportConfig,
  newQueryMockResponses,
  type GeoQuery,
  type Competitor,
  type Suggestion,
  type ReportConfig,
} from "../../data/seo-geo-demo";

/* ────────────────────────────────────────────────────────────────────────────
 * Tipos del contexto
 * ──────────────────────────────────────────────────────────────────────────── */

interface SeoGeoContextValue {
  geoQueries: GeoQuery[];
  competitors: Competitor[];
  suggestions: Suggestion[];
  reportConfig: ReportConfig;
  toneLearned: boolean;
  lastGeoRun: string;
  addCompetitor: (name: string) => void;
  removeCompetitor: (id: string) => void;
  addGeoQuery: (query: string, category: string, engine: GeoQuery["engine"]) => string;
  refreshGeoRun: () => void;
  rejectSuggestion: (id: string) => void;
  requestVariant: (id: string) => void;
  scheduleReport: (cfg: Partial<ReportConfig>) => void;
  updateReport: (cfg: Partial<ReportConfig>) => void;
  setToneLearned: (v: boolean) => void;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Context
 * ──────────────────────────────────────────────────────────────────────────── */

const SeoGeoContext = createContext<SeoGeoContextValue | null>(null);

export function SeoGeoProvider({ children }: { children: ReactNode }) {
  const [geoQueries, setGeoQueries] = useState<GeoQuery[]>(initialGeoQueries);
  const [competitors, setCompetitors] = useState<Competitor[]>(initialCompetitors);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [reportConfig, setReportConfig] = useState<ReportConfig>(initialReportConfig);
  const [toneLearned, setToneLearned] = useState(true);
  const [lastGeoRun, setLastGeoRun] = useState("hace 12 min");

  const variantIdxRef = useRef<Record<string, number>>({ s1: 0, s2: 0, s3: 0 });
  const mockIdxRef = useRef(0);

  const addCompetitor = useCallback((name: string) => {
    const score = 40 + Math.floor(((name.length * 7) % 35));
    setCompetitors((c) => [...c, { id: `c${Date.now()}`, name, aiVisibilityScore: score }]);
  }, []);

  const removeCompetitor = useCallback((id: string) => {
    setCompetitors((c) => c.filter((x) => x.id !== id));
  }, []);

  const addGeoQuery = useCallback(
    (query: string, category: string, engine: GeoQuery["engine"]): string => {
      const idx = mockIdxRef.current++ % newQueryMockResponses.length;
      const mock = newQueryMockResponses[idx];
      const id = `qx${Date.now()}`;
      setGeoQueries((q) => [
        {
          id,
          engine: engine || mock.engine,
          query,
          category: category || "Personalizado",
          mentioned: mock.mentioned,
          position: mock.position,
          excerpt: mock.excerpt,
          citedUrl: mock.citedUrl,
          lastRun: "hace unos segundos",
        },
        ...q,
      ]);
      return id;
    },
    [],
  );

  const refreshGeoRun = useCallback(() => {
    setLastGeoRun("hace unos segundos");
    setGeoQueries((q) => q.map((x) => ({ ...x, lastRun: "hace unos segundos" })));
  }, []);

  const rejectSuggestion = useCallback((id: string) => {
    setSuggestions((s) => s.filter((x) => x.id !== id));
  }, []);

  const requestVariant = useCallback((id: string) => {
    const pool = suggestionVariants[id] || [];
    if (pool.length === 0) return;
    const idx = variantIdxRef.current[id] ?? 0;
    const next = pool[idx % pool.length];
    variantIdxRef.current[id] = idx + 1;
    setSuggestions((s) => s.map((x) => (x.id === id ? { ...x, title: next } : x)));
  }, []);

  const scheduleReport = useCallback((cfg: Partial<ReportConfig>) => {
    setReportConfig((c) => ({ ...c, ...cfg, scheduled: true }));
  }, []);

  const updateReport = useCallback((cfg: Partial<ReportConfig>) => {
    setReportConfig((c) => ({ ...c, ...cfg }));
  }, []);

  return (
    <SeoGeoContext.Provider
      value={{
        geoQueries, competitors, suggestions, reportConfig,
        toneLearned, lastGeoRun,
        addCompetitor, removeCompetitor, addGeoQuery, refreshGeoRun,
        rejectSuggestion, requestVariant, scheduleReport, updateReport,
        setToneLearned,
      }}
    >
      {children}
    </SeoGeoContext.Provider>
  );
}

export function useSeoGeo() {
  const ctx = useContext(SeoGeoContext);
  if (!ctx) throw new Error("useSeoGeo must be used within SeoGeoProvider");
  return ctx;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useSimulatedAsync — loader falso con duración aleatoria dentro de un rango.
 * Portado desde SeoGeoContext.jsx original.
 * ──────────────────────────────────────────────────────────────────────────── */

export function useSimulatedAsync() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const run = useCallback(
    async (
      msg: string,
      fn?: () => void | Promise<void>,
      { min = 1000, max = 2500 }: { min?: number; max?: number } = {},
    ) => {
      setMessage(msg);
      setLoading(true);
      const ms = min + Math.floor((max - min) * 0.65);
      await new Promise((r) => setTimeout(r, ms));
      if (fn) await fn();
      setLoading(false);
      setMessage("");
    },
    [],
  );

  return { loading, message, run };
}
