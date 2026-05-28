import { useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

type Trigger = "exit-intent" | "scroll" | "tiempo" | "clic";
type PopupStatus = "active" | "inactive";

interface Popup {
  id: number;
  name: string;
  trigger: Trigger;
  status: PopupStatus;
  views: number;
  conversions: number;
}

const triggerLabels: Record<Trigger, string> = {
  "exit-intent": "Exit intent",
  "scroll":      "Al hacer scroll",
  "tiempo":      "Después de 10 seg",
  "clic":        "Al hacer clic",
};

const initialPopups: Popup[] = [
  { id: 1, name: "Descuento de bienvenida",  trigger: "exit-intent", status: "active",   views: 1240, conversions: 87  },
  { id: 2, name: "Reserva directa — 15% off", trigger: "scroll",     status: "active",   views: 890,  conversions: 54  },
  { id: 3, name: "Newsletter",                trigger: "tiempo",      status: "inactive", views: 430,  conversions: 12  },
];

import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";
import { Button } from "./ui/button";
import { ConfirmDestructiveDialog } from "./ui/confirm-destructive-dialog";

interface Props {
  siteName: string;
  navigate: (view: View, siteId?: number) => void;
  openCreatePopup?: () => void;
}

export function PopupsView({ siteName, navigate, openCreatePopup }: Props) {
  const [popups, setPopups] = useState<Popup[]>(initialPopups);
  const [pendingDelete, setPendingDelete] = useState<Popup | null>(null);

  function toggleStatus(id: number) {
    setPopups((prev) =>
      prev.map((p) => p.id === id ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p)
    );
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    setPopups((prev) => prev.filter((p) => p.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 860, margin: "0 auto" }}>
        <ViewHeader
          backTo="paginas"
          eyebrow={siteName}
          title="Pop-ups"
          description="Capturá visitantes con mensajes en momentos clave de su navegación."
          navigate={navigate}
          action={
            <Button variant="primary" onClick={openCreatePopup} leftIcon={<Plus size={13} />}>
              Crear pop-up
            </Button>
          }
        />
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Pop-ups activos",   value: popups.filter((p) => p.status === "active").length.toString() },
            { label: "Impresiones totales", value: popups.reduce((s, p) => s + p.views, 0).toLocaleString("es-AR") },
            { label: "Conversiones",       value: popups.reduce((s, p) => s + p.conversions, 0).toString() },
          ].map((card) => (
            <div key={card.label} className="p-3" style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)" }}>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginBottom: 4 }}>{card.label}</p>
              <p style={{ fontSize: "var(--font-size-2xl)", fontWeight: 600, color: "var(--text-primary)" }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Popup list */}
        <div className="flex flex-col gap-1">
          {popups.map((popup) => {
            const isActive = popup.status === "active";
            return (
              <div
                key={popup.id}
                className="flex items-center justify-between px-4"
                style={{
                  background: "var(--surface-card)",
                  borderRadius: "var(--radius-item)",
                  border: "0.5px solid var(--border-ui)",
                  height: 56,
                  opacity: isActive ? 1 : 0.6,
                }}
              >
                {/* Left: name + meta */}
                <div className="flex items-center gap-3">
                  <div
                    style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: isActive ? "var(--status-active)" : "var(--border-ui)" }}
                  />
                  <div>
                    <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.3 }}>
                      {popup.name}
                    </p>
                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)" }}>
                      {triggerLabels[popup.trigger]} · {popup.views.toLocaleString("es-AR")} impresiones · {popup.conversions} conversiones
                    </p>
                  </div>
                </div>

                {/* Right: badge + actions */}
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 h-[18px] flex items-center"
                    style={{
                      background: isActive ? "var(--badge-green-bg)" : "var(--badge-neutral-bg)",
                      borderRadius: "var(--radius-dot)",
                      fontSize: "var(--font-size-xs)",
                      fontWeight: 500,
                      color: isActive ? "var(--badge-green-text)" : "var(--text-secondary)",
                    }}
                  >
                    {isActive ? "Activo" : "Inactivo"}
                  </span>

                  <button
                    onClick={() => toggleStatus(popup.id)}
                    className="flex items-center justify-center transition-opacity hover:opacity-70"
                    title={isActive ? "Desactivar" : "Activar"}
                    style={{ width: 26, height: 26, background: "var(--surface-page)", borderRadius: "var(--radius-dot)", border: "0.5px solid var(--border-ui)" }}
                  >
                    {isActive
                      ? <ToggleRight size={13} style={{ color: "var(--status-active)" }} />
                      : <ToggleLeft  size={13} style={{ color: "var(--text-secondary)" }} />
                    }
                  </button>

                  <button
                    className="flex items-center justify-center transition-opacity hover:opacity-70"
                    title="Editar"
                    style={{ width: 26, height: 26, background: "var(--surface-page)", borderRadius: "var(--radius-dot)", border: "0.5px solid var(--border-ui)" }}
                  >
                    <Pencil size={11} style={{ color: "var(--text-secondary)" }} />
                  </button>

                  <button
                    onClick={() => setPendingDelete(popup)}
                    className="flex items-center justify-center transition-opacity hover:opacity-70"
                    aria-label={`Eliminar pop-up ${popup.name}`}
                    style={{ width: 26, height: 26, background: "var(--surface-page)", borderRadius: "var(--radius-dot)", border: "0.5px solid var(--border-ui)" }}
                  >
                    <Trash2 size={11} style={{ color: "var(--text-secondary)" }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state (shown if all deleted) */}
        <ConfirmDestructiveDialog
          open={pendingDelete !== null}
          title="Eliminar pop-up"
          description="Vas a eliminar el pop-up"
          resourceName={pendingDelete?.name}
          confirmLabel="Eliminar pop-up"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />

        {popups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <p style={{ fontSize: "var(--font-size-lg)", color: "var(--text-tertiary)", marginBottom: 8 }}>Sin pop-ups creados</p>
            <button
              className="flex items-center gap-1.5 px-4 h-8 transition-opacity hover:opacity-85"
              style={{ background: "var(--brand)", borderRadius: "var(--radius-nav)", fontSize: "var(--font-size-md)", fontWeight: 500, color: "#fff" }}
            >
              <Plus size={13} />
              Crear el primero
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
