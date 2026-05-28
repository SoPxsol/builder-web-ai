import { useState } from "react";
import { Code2, UserPlus, Trash2 } from "lucide-react";
import type { View } from "../types";
import { ViewHeader } from "./ui/view-header";
import { Button } from "./ui/button";
import { ConfirmDestructiveDialog } from "./ui/confirm-destructive-dialog";

interface PermissionUser {
  id: number;
  email: string;
  grantedBy: string;
  date: string;
}

const initialUsers: PermissionUser[] = [
  { id: 1, email: "jaimevenezian1@gmail.com", grantedBy: "fbarron@pxsol.com", date: "22/5/2026, 12:54:45" },
];

interface Props {
  navigate: (view: View, siteId?: number) => void;
}

export function InternoView({ navigate }: Props) {
  const [users, setUsers] = useState<PermissionUser[]>(initialUsers);
  const [emailInput, setEmailInput] = useState("");
  const [pendingRevoke, setPendingRevoke] = useState<PermissionUser | null>(null);

  function handleGrant() {
    if (!emailInput.trim()) return;
    setUsers((prev) => [
      ...prev,
      {
        id: Date.now(),
        email: emailInput.trim(),
        grantedBy: "sofía@pxsol.com",
        date: new Date().toLocaleString("es-AR"),
      },
    ]);
    setEmailInput("");
  }

  function confirmRevoke() {
    if (!pendingRevoke) return;
    setUsers((prev) => prev.filter((u) => u.id !== pendingRevoke.id));
    setPendingRevoke(null);
  }

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: "var(--surface-page)" }}>
      <div style={{ padding: "var(--space-5)", maxWidth: 860, margin: "0 auto" }}>
        <ViewHeader
          eyebrow="PXSOL Web"
          title="Interno · Edición"
          description="Gestioná los permisos especiales de los usuarios sobre el editor de diseño."
          navigate={navigate}
        />

        {/* Card 1: grant permission */}
        <div
          className="mb-3 p-4"
          style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)" }}
        >
          {/* Card header */}
          <div className="flex items-center gap-2 mb-2">
            <Code2 size={14} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
            <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)" }}>
              Administrador de diseño (CustomComponent1)
            </p>
          </div>
          <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
            Otorgá acceso al editor de código del componente{" "}
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>CustomComponent1</span>
            {" "}a usuarios que no tengan email{" "}
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>@pxsol.com</span>
            {". Los usuarios autorizados podrán abrir el administrador de diseño desde el builder."}
          </p>

          {/* Input row */}
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="email@dominio.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGrant()}
              className="flex-1"
              style={{
                height: 36,
                paddingLeft: 12,
                paddingRight: 12,
                borderRadius: "var(--radius-nav)",
                border: "0.5px solid var(--border-ui)",
                background: "var(--surface-page)",
                fontSize: "var(--font-size-md)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
            <Button
              variant="primary"
              onClick={handleGrant}
              leftIcon={<UserPlus size={13} />}
              style={{ height: 36 }}
            >
              Otorgar permiso
            </Button>
          </div>
        </div>

        {/* Card 2: users with permission */}
        <div
          style={{ background: "var(--surface-card)", borderRadius: "var(--radius-card)", border: "0.5px solid var(--border-ui)", overflow: "hidden" }}
        >
          <div className="px-4 pt-4 pb-3">
            <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>
              Usuarios con permiso ({users.length})
            </p>
            <p style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)" }}>
              Los usuarios Pxsol siempre tienen acceso; este listado es solo para usuarios externos.
            </p>
          </div>

          {/* Table */}
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderTop: "0.5px solid var(--border-ui)" }}>
                {["Email", "Otorgado por", "Fecha", "Acciones"].map((col, i) => (
                  <th
                    key={col}
                    className="px-4 py-2 text-left"
                    style={{
                      fontSize: "var(--font-size-md)",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      textAlign: i === 3 ? "right" : "left",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: "0.5px solid var(--border-ui)" }}>
                  <td className="px-4 py-3" style={{ fontSize: "var(--font-size-md)", fontWeight: 500, color: "var(--text-primary)" }}>
                    {u.email}
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)" }}>
                    {u.grantedBy}
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: "var(--font-size-md)", color: "var(--text-secondary)" }}>
                    {u.date}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setPendingRevoke(u)}
                      className="transition-opacity hover:opacity-70"
                      aria-label={`Revocar permiso de ${u.email}`}
                    >
                      <Trash2 size={14} style={{ color: "var(--destructive)" }} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr style={{ borderTop: "0.5px solid var(--border-ui)" }}>
                  <td colSpan={4} className="px-4 py-5 text-center" style={{ fontSize: "var(--font-size-md)", color: "var(--text-tertiary)" }}>
                    Sin usuarios externos con permiso
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDestructiveDialog
        open={pendingRevoke !== null}
        title="Revocar permiso"
        description="Vas a revocar el acceso al administrador de diseño de"
        resourceName={pendingRevoke?.email}
        confirmLabel="Revocar permiso"
        onCancel={() => setPendingRevoke(null)}
        onConfirm={confirmRevoke}
      />
    </main>
  );
}
