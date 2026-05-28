import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { Site } from "../types";

interface Props {
  sites: Site[];
  activeSiteId: number;
  onSelect: (id: number) => void;
  onSeeAll: () => void;
}

export function SiteSwitcher({ sites, activeSiteId, onSelect, onSeeAll }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const activeSite = sites.find((s) => s.id === activeSiteId) ?? sites[0];

  const q = query.trim().toLowerCase();
  const filtered = q
    ? sites.filter((s) => s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q))
    : sites;

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();
    const activeIdx = filtered.findIndex((s) => s.id === activeSiteId);
    setFocusedIndex(activeIdx >= 0 ? activeIdx : 0);

    function handlePointerOutside(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeAndRestoreFocus();
      }
    }

    document.addEventListener("pointerdown", handlePointerOutside);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerOutside);
      document.removeEventListener("keydown", handleKeydown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Cuando cambia el filtro, resetear el foco al primero válido.
  useEffect(() => {
    if (open) setFocusedIndex(0);
  }, [q, open]);

  function closeAndRestoreFocus() {
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  }

  function handleSelect(id: number) {
    onSelect(id);
    closeAndRestoreFocus();
  }

  function handleInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[focusedIndex];
      if (opt) handleSelect(opt.id);
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setFocusedIndex(filtered.length - 1);
    }
  }

  const activeOptionId = filtered[focusedIndex] ? `${listboxId}-opt-${filtered[focusedIndex].id}` : undefined;

  return (
    <div ref={containerRef} className="mb-4" style={{ position: "relative" }}>
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Sitio activo: ${activeSite.name}. Cambiar de sitio`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        className="focus-ring-dark flex items-center gap-2 px-2 h-8 w-full"
        style={{ background: "var(--shell-item-selector-bg)", borderRadius: "var(--radius-nav)" }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            background: activeSite.status === "active" ? "var(--status-active)" : "var(--status-warning)",
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        <span className="flex-1 text-left truncate" style={{ fontSize: "var(--font-size-base)", fontWeight: 500, color: "var(--shell-label-active)" }}>
          {activeSite.name}
        </span>
        <ChevronDown
          size={10}
          aria-hidden="true"
          style={{
            color: "var(--shell-icon-inactive)",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s ease",
          }}
        />
      </button>

      {open && (
        <div
          className="flex flex-col"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--shell-item-active-bg)",
            border: "1px solid var(--shell-separator)",
            borderRadius: "var(--radius-card)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            overflow: "hidden",
            maxHeight: 360,
          }}
        >
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid var(--shell-separator)" }}>
            <Search size={12} style={{ color: "var(--shell-icon-inactive)", flexShrink: 0 }} aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleInputKey}
              placeholder="Buscar sitio…"
              className="flex-1 bg-transparent border-none outline-none"
              style={{ fontSize: "var(--font-size-base)", color: "var(--shell-label-active)" }}
              aria-label="Buscar sitio"
              role="combobox"
              aria-expanded="true"
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={activeOptionId}
            />
          </div>

          <ul
            id={listboxId}
            role="listbox"
            aria-label="Lista de sitios"
            className="overflow-y-auto scrollbar-dark"
            style={{ flex: 1, padding: "4px 0", margin: 0, listStyle: "none" }}
          >
            {filtered.length === 0 ? (
              <li
                role="presentation"
                className="px-3 py-4 text-center"
                style={{ fontSize: "var(--font-size-base)", color: "var(--shell-label-inactive)" }}
              >
                Sin resultados para “{query}”
              </li>
            ) : (
              filtered.map((site, idx) => {
                const isActive = site.id === activeSiteId;
                const isFocused = idx === focusedIndex;
                return (
                  <li key={site.id} role="presentation">
                    <button
                      id={`${listboxId}-opt-${site.id}`}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      tabIndex={-1}
                      onClick={() => handleSelect(site.id)}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      className="flex items-center gap-2 w-full px-3 h-9 text-left transition-colors"
                      style={{
                        background: isFocused
                          ? "var(--shell-nav-bg)"
                          : isActive
                          ? "var(--shell-nav-bg)"
                          : "transparent",
                        outline: isFocused ? "2px solid var(--accent-info)" : "none",
                        outlineOffset: -2,
                        fontSize: "var(--font-size-base)",
                        color: "var(--shell-label-active)",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          background: site.status === "active" ? "var(--status-active)" : "var(--status-warning)",
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      />
                      <span className="flex-1 truncate">{site.name}</span>
                      {site.domain && (
                        <span
                          className="truncate"
                          style={{ fontSize: "var(--font-size-xs)", color: "var(--shell-label-inactive)", maxWidth: 80 }}
                        >
                          {site.domain}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <button
            type="button"
            onClick={() => {
              onSeeAll();
              closeAndRestoreFocus();
            }}
            className="focus-ring-dark flex items-center justify-center gap-2 h-9"
            style={{
              borderTop: "1px solid var(--shell-separator)",
              fontSize: "var(--font-size-base)",
              color: "var(--accent-info)",
              background: "transparent",
            }}
          >
            Ver todos los sitios →
          </button>
        </div>
      )}
    </div>
  );
}
