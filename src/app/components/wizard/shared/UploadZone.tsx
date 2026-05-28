import { useRef } from "react";
import { Camera, Check, Upload } from "lucide-react";
import type { UploadZoneState } from "../../../types/wizard";

interface UploadZoneProps {
  state: UploadZoneState;
  onUpload: (file: File) => void;
  type: "logo" | "photo";
}

interface ZoneVisual {
  background: string;
  border: string;
  icon: React.ElementType;
  iconColor: string;
  iconSize: number;
  title: string;
  titleColor: string;
  hint?: string;
  hintColor?: string;
  badge?: string;
}

function getVisual(state: UploadZoneState, type: "logo" | "photo"): ZoneVisual {
  if (state === "loaded") {
    return {
      background: "var(--wizard-success-light)",
      border: "1px dashed var(--wizard-success-border)",
      icon: Check,
      iconColor: "var(--wizard-success)",
      iconSize: 20,
      title: type === "logo" ? "Logo cargado ✓" : "Foto cargada ✓",
      titleColor: "var(--wizard-success)",
    };
  }
  if (state === "placeholder") {
    return {
      background: "var(--wizard-amber-light)",
      border: "1px dashed var(--wizard-amber-border)",
      icon: Camera,
      iconColor: "var(--wizard-amber-accent)",
      iconSize: 18,
      title: type === "photo" ? "Subir tu foto" : "Subir logo",
      titleColor: "var(--wizard-amber-text)",
      badge: "Foto de ejemplo activa · cargá la tuya después",
    };
  }
  return {
    background: "var(--surface-page)",
    border: "1px dashed var(--border-ui)",
    icon: Upload,
    iconColor: "var(--text-tertiary)",
    iconSize: 20,
    title: type === "logo" ? "Subir logo" : "Subir foto de portada",
    titleColor: "var(--text-secondary)",
    hint: type === "logo" ? "PNG o SVG · fondo transparente" : "JPG o PNG · mín. 1200×800",
    hintColor: "var(--text-tertiary)",
  };
}

export function UploadZone({ state, onUpload, type }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const visual = getVisual(state, type);
  const Icon = visual.icon;

  function handleClick() {
    inputRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    // Reset el input para que dispare onChange si el usuario elige el mismo archivo.
    e.target.value = "";
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={visual.title}
      className="flex flex-col items-center justify-center w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-opacity hover:opacity-85"
      style={{
        background: visual.background,
        border: visual.border,
        borderRadius: 6,
        height: 80,
        gap: 4,
        padding: 8,
        cursor: "pointer",
        outlineColor: "var(--accent-info)",
      }}
    >
      <Icon size={visual.iconSize} style={{ color: visual.iconColor }} aria-hidden="true" />
      <span
        style={{
          fontSize: "var(--font-size-sm)",
          fontWeight: 500,
          color: visual.titleColor,
        }}
      >
        {visual.title}
      </span>
      {visual.hint && (
        <span style={{ fontSize: "10px", color: visual.hintColor }}>{visual.hint}</span>
      )}
      {visual.badge && (
        <span
          style={{
            background: "var(--wizard-amber-light)",
            border: "1px solid var(--wizard-amber-border-strong)",
            borderRadius: 3,
            fontSize: 9,
            color: "var(--wizard-amber-text)",
            padding: "1px 6px",
            marginTop: 2,
          }}
        >
          {visual.badge}
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={type === "logo" ? "image/png,image/svg+xml" : "image/jpeg,image/png"}
        onChange={handleChange}
        style={{ display: "none" }}
        tabIndex={-1}
        aria-hidden="true"
      />
    </button>
  );
}
