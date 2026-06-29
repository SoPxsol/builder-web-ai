/**
 * SocialPhonePreview.tsx
 * Portado de pxsol-mkt-qa/src/components/SocialPhonePreview.jsx
 *
 * Renderiza un mock de teléfono con las pantallas de Instagram, Facebook y TikTok.
 * Los hex de marca social (#1877F2, #0095F6, #FE2C55) son LEGÍTIMOS y se mantienen.
 * Todo lo demás usa tokens del DS del Builder.
 */

import { useEffect, useState } from "react";
import {
  Grid3x3, Film, Heart, Play, MessageCircle, Share2,
  ThumbsUp, MoreHorizontal, ChevronLeft, Search, Bookmark,
  Music2, Send, Wifi, BadgeCheck, Lock, Menu, Plus, Globe,
  ChevronDown, Link2,
} from "lucide-react";
import { socialPosts, hotelImages } from "../../data/social-demo";
import type { SocialPost } from "../../data/social-demo";

/* ──────────────────────────────────────────────────────────────────────────────
 * Constantes
 * ────────────────────────────────────────────────────────────────────────────── */

const IOS_FONT =
  '-apple-system, system-ui, "SF Pro Display", "Segoe UI", Roboto, sans-serif';

/* ──────────────────────────────────────────────────────────────────────────────
 * Perfiles de demo por red
 * ────────────────────────────────────────────────────────────────────────────── */

interface ProfileIG {
  handle: string; name: string; category: string; avatar: string;
  bio: string[]; link: string;
  stats: { k: string; v: string }[];
}
interface ProfileFB {
  handle: string; name: string; category: string; avatar: string;
  cover: string;
  stats: { k: string; v: string }[];
}
interface ProfileTT {
  handle: string; name: string; avatar: string; bio: string;
  stats: { k: string; v: string }[];
}

const profiles: { Instagram: ProfileIG; Facebook: ProfileFB; TikTok: ProfileTT } = {
  Instagram: {
    handle: "hotelazulmarino",
    name: "Hotel Azul Marino",
    category: "Hotel boutique",
    avatar: hotelImages.facade,
    bio: ["Boutique frente al mar 🌊", "Cartagena de Indias · 18 habitaciones", "Reservá directo ↓"],
    link: "hotelazulmarino.presence.io",
    stats: [
      { k: "publicaciones", v: "248" },
      { k: "seguidores", v: "14,2 mil" },
      { k: "seguidos", v: "312" },
    ],
  },
  Facebook: {
    handle: "Hotel Azul Marino",
    name: "Hotel Azul Marino",
    category: "Hotel · Cartagena de Indias",
    avatar: hotelImages.facade,
    cover: hotelImages.hero,
    stats: [
      { k: "Me gusta", v: "9.840" },
      { k: "Seguidores", v: "10.512" },
    ],
  },
  TikTok: {
    handle: "hotelazulmarino",
    name: "Hotel Azul Marino",
    avatar: hotelImages.facade,
    bio: "Tu próxima escapada al Caribe 🌊\nCartagena de Indias",
    stats: [
      { k: "Siguiendo", v: "48" },
      { k: "Seguidores", v: "32,4 mil" },
      { k: "Me gusta", v: "418,9 mil" },
    ],
  },
};

const VIEWS_LABEL = ["12,4 mil", "8.940", "23,6 mil", "5.210", "41,2 mil", "3.180", "18,7 mil", "9.450", "30,1 mil", "6.620"];
const viewsAt = (i: number) => VIEWS_LABEL[i % VIEWS_LABEL.length];

/* ──────────────────────────────────────────────────────────────────────────────
 * Iconos de tab de vista por red
 * ────────────────────────────────────────────────────────────────────────────── */

// Ícono de lista de publicaciones de Facebook (inline SVG)
function AlignList({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="14" y2="17" />
    </svg>
  );
}

interface ViewTabDef {
  id: string;
  icon: React.ComponentType<{ size?: number }>;
}

const viewsByNetwork: Record<string, ViewTabDef[]> = {
  Instagram: [
    { id: "feed",   icon: Grid3x3 },
    { id: "reels",  icon: Film },
  ],
  Facebook: [
    { id: "feed",  icon: AlignList },
    { id: "fotos", icon: Grid3x3 },
  ],
  TikTok: [
    { id: "videos", icon: Grid3x3 },
    { id: "liked",  icon: Heart },
  ],
};

/* ──────────────────────────────────────────────────────────────────────────────
 * Componentes de chrome del teléfono
 * ────────────────────────────────────────────────────────────────────────────── */

function SignalBars({ color }: { color: string }) {
  return (
    <div className="flex items-end gap-[2px]" aria-hidden="true">
      {[5, 7, 9, 11].map((h, i) => (
        <span key={i} className="w-[3px] rounded-[1px]" style={{ height: `${h}px`, background: color }} />
      ))}
    </div>
  );
}

function Battery({ color, outline }: { color: string; outline: string }) {
  return (
    <div className="flex items-center" aria-hidden="true">
      <div
        className="relative flex items-center px-[1.5px]"
        style={{ width: 23, height: 12, borderRadius: 3.5, border: `1px solid ${outline}` }}
      >
        <div className="rounded-[1.5px]" style={{ width: "74%", height: 7, background: color }} />
      </div>
      <span style={{ width: 2, height: 4, marginLeft: 1, borderRadius: "0 2px 2px 0", background: outline }} />
    </div>
  );
}

function StatusBar({ dark = false }: { dark?: boolean }) {
  const color = dark ? "#ffffff" : "#0a0a0a";
  const outline = dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  return (
    <div className="relative flex-shrink-0 h-[46px] flex items-center justify-between pl-7 pr-5" aria-hidden="true">
      <span className="text-[15px] font-semibold tracking-[-0.02em]" style={{ color, fontVariantNumeric: "tabular-nums" }}>
        9:41
      </span>
      <div className="flex items-center gap-[6px]" style={{ color }}>
        <SignalBars color={color} />
        <Wifi size={16} strokeWidth={2.6} aria-hidden="true" />
        <Battery color={color} outline={outline} />
      </div>
    </div>
  );
}

function Phone({ statusDark = false, children }: { statusDark?: boolean; children: React.ReactNode }) {
  return (
    /* aria-hidden="true": el phone es decorativo — no aporta info adicional al lector de pantalla.
     * inert="": bloquea todo el tab order y el foco dentro del widget decorativo (WCAG 2.4.3).
     * React 18 no tiene tipos para inert — usamos spread con cast para evitar el error de TS. */
    <div className="relative w-[300px] mx-auto" aria-hidden="true"
      {...({ inert: "" } as React.HTMLAttributes<HTMLDivElement>)}
    >
      <div className="rounded-[2.6rem] p-[5px]" style={{ background: "#111111", boxShadow: "0 34px 70px rgba(0,0,0,0.32)" }}>
        <div
          className="relative rounded-[2.3rem] overflow-hidden bg-white h-[600px] flex flex-col ring-1 ring-black/10"
          style={{ fontFamily: IOS_FONT, letterSpacing: "-0.01em", WebkitFontSmoothing: "antialiased" }}
        >
          <StatusBar dark={statusDark} />
          <div className="relative flex-1 min-h-0 flex flex-col">{children}</div>
          {/* Dynamic island */}
          <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[94px] h-[27px] bg-black rounded-full z-50 flex items-center justify-end pr-2.5">
            <span className="w-[8px] h-[8px] rounded-full" style={{ background: "#16181b", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }} />
          </div>
          {/* Home indicator */}
          <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[112px] h-[4px] rounded-full z-50" style={{ background: "rgba(0,0,0,0.3)" }} />
        </div>
      </div>
    </div>
  );
}

function ViewTabs({
  views,
  active,
  onChange,
  color = "#1a1a1a",
}: {
  views: ViewTabDef[];
  active: string;
  onChange: (id: string) => void;
  color?: string;
}) {
  return (
    <div className="flex border-t border-border">
      {views.map((v) => {
        const Icon = v.icon;
        const on = v.id === active;
        return (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            className="flex-1 py-2 flex items-center justify-center relative transition-colors"
            style={{ color: on ? color : "#b0b0b0" }}
          >
            <Icon size={18} />
            {on && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: color }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* Overlapping reaction badges — Facebook like/love stack. */
function ReactionStack() {
  return (
    <span className="flex items-center" aria-hidden="true">
      <span className="w-[15px] h-[15px] rounded-full flex items-center justify-center ring-[1.5px] ring-white" style={{ background: "#1877F2" }}>
        <ThumbsUp size={8} className="text-white" fill="white" />
      </span>
      <span className="w-[15px] h-[15px] rounded-full flex items-center justify-center ring-[1.5px] ring-white -ml-1" style={{ background: "#F33E58" }}>
        <Heart size={8} className="text-white" fill="white" />
      </span>
    </span>
  );
}

function GridItem({
  src, i, onClick, ratio = "aspect-square", views,
}: {
  src: string; i: number; onClick: () => void; ratio?: string; views?: string;
}) {
  return (
    <button onClick={onClick} className={`relative ${ratio} overflow-hidden bg-gray-100`} style={{ animation: `fadeIn 0.32s ease-out ${i * 0.03}s both` }}>
      <img src={src} alt="" className="w-full h-full object-cover" />
      {views && (
        <span className="absolute bottom-1 left-1 flex items-center gap-0.5 text-white text-[9px] font-semibold drop-shadow" aria-hidden="true">
          <Play size={9} fill="currentColor" /> {views}
        </span>
      )}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Detalle de publicación (overlay dentro del teléfono)
 * ────────────────────────────────────────────────────────────────────────────── */

function PostDetail({
  network, post, profile, onBack,
}: {
  network: string;
  post: SocialPost;
  profile: ProfileIG | ProfileFB | ProfileTT;
  onBack: () => void;
}) {
  if (network === "TikTok") {
    return (
      <div className="absolute inset-0 z-40 bg-black flex flex-col">
        <img src={post.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        <button onClick={onBack} className="relative z-10 m-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center" aria-label="Volver">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <div className="relative z-10 mt-auto flex items-end justify-between p-3.5 text-white">
          <div className="max-w-[78%]">
            <div className="text-[13px] font-semibold">@{(profile as ProfileTT).handle}</div>
            <div className="text-[12px] leading-snug mt-1">{post.overlay}</div>
            <div className="text-[11px] opacity-80 mt-1">{post.sub}</div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px]">
              <Music2 size={12} aria-hidden="true" /> Sonido original — Azul Marino
            </div>
          </div>
          <div className="flex flex-col items-center gap-3.5" aria-hidden="true">
            <div className="flex flex-col items-center text-[10px]"><Heart size={24} fill="white" /> 41,2 mil</div>
            <div className="flex flex-col items-center text-[10px]"><MessageCircle size={23} fill="white" /> 312</div>
            <div className="flex flex-col items-center text-[10px]"><Share2 size={23} /> 1.204</div>
          </div>
        </div>
      </div>
    );
  }

  // Instagram / Facebook
  const p = profile as ProfileIG | ProfileFB;
  return (
    <div className="absolute inset-0 z-40 bg-white flex flex-col">
      <div className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100">
        <button onClick={onBack} className="text-gray-800" aria-label="Volver">
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <span className="text-[13px] font-semibold">Publicación</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ overscrollBehavior: "contain" }}>
        <div className="flex items-center gap-2 px-3 py-2">
          <img src={p.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
          <span className="text-[12px] font-semibold">{p.handle}</span>
          <MoreHorizontal size={16} className="ml-auto text-gray-400" aria-hidden="true" />
        </div>
        <div className="relative">
          <img src={post.image} alt="" className="w-full object-cover" />
        </div>
        <div className="flex items-center gap-4 px-3 py-2.5 text-gray-800" aria-hidden="true">
          <Heart size={20} />
          <MessageCircle size={20} />
          <Send size={19} />
          <Bookmark size={19} className="ml-auto" />
        </div>
        <div className="px-3 text-[12px] font-semibold">1.842 Me gusta</div>
        <div className="px-3 mt-1 text-[12px] leading-snug">
          <span className="font-semibold">{p.handle}</span> {post.overlay}{" "}
          <span className="text-gray-400">{post.sub}</span>
        </div>
        <div className="px-3 mt-2 mb-4 text-[11px] text-gray-400">Hace 2 horas</div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Pantallas por red social
 * ────────────────────────────────────────────────────────────────────────────── */

const IG_HIGHLIGHTS = [
  { label: "Suites",  img: hotelImages.room2 },
  { label: "Playa",  img: hotelImages.beach },
  { label: "Spa",    img: hotelImages.spa },
  { label: "Resto",  img: hotelImages.restaurant },
  { label: "Tour",   img: hotelImages.facade },
];

function InstagramScreen({
  posts, view, setView, onOpen,
}: {
  posts: SocialPost[];
  view: string;
  setView: (v: string) => void;
  onOpen: (p: SocialPost) => void;
}) {
  const p = profiles.Instagram;
  const reels = posts.filter((x) => /Reel|Story/.test(x.type));
  const grid = view === "reels" ? (reels.length ? reels : posts) : posts;

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2">
        <span className="font-semibold text-[16px] flex items-center gap-1.5 tracking-[-0.02em]">
          <Lock size={12} strokeWidth={2.5} className="text-black/80" aria-hidden="true" />
          {p.handle}
          <ChevronDown size={15} className="text-black/70" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <div className="flex items-center gap-4 text-black/90" aria-hidden="true">
          <Plus size={21} strokeWidth={2} />
          <Menu size={21} strokeWidth={2} />
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ overscrollBehavior: "contain" }}>
        <div className="px-4 pt-1">
          {/* Avatar + stats */}
          <div className="flex items-center gap-6">
            <div className="p-[2.5px] rounded-full" style={{ background: "linear-gradient(to top right, #FFDC80, #e84a2c, #C13584)" }}>
              <img src={p.avatar} alt="" className="w-[72px] h-[72px] rounded-full object-cover ring-[2.5px] ring-white" />
            </div>
            <div className="flex-1 flex justify-around text-center" aria-hidden="true">
              {p.stats.map((s) => (
                <div key={s.k}>
                  <div className="text-[16px] font-semibold leading-none tracking-[-0.02em]">{s.v}</div>
                  <div className="text-[11px] text-gray-400 mt-1">{s.k}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Bio */}
          <div className="mt-3 flex items-center gap-1 text-[12.5px] font-semibold">
            {p.name}
            <BadgeCheck size={13} className="text-blue-400" fill="#5B8FBF" stroke="white" aria-hidden="true" />
          </div>
          <div className="text-[11.5px] text-gray-400 mt-0.5">{p.category}</div>
          <div className="text-[12px] leading-[1.45] mt-1 text-black/90">
            {p.bio.map((b) => <div key={b}>{b}</div>)}
          </div>
          <a className="inline-flex items-center gap-1 text-[12px] font-medium mt-0.5" style={{ color: "#385898" }}>
            <Link2 size={12} strokeWidth={2.5} aria-hidden="true" /> {p.link}
          </a>
          {/* Actions */}
          <div className="flex gap-1.5 mt-3" aria-hidden="true">
            <button className="flex-1 h-[34px] rounded-[10px] text-white text-[12.5px] font-semibold" style={{ background: "#0095F6" }}>
              Seguir
            </button>
            <button className="flex-1 h-[34px] rounded-[10px] text-[12.5px] font-semibold" style={{ background: "#EFEFEF" }}>
              Mensaje
            </button>
            <button className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center" style={{ background: "#EFEFEF" }}>
              <ChevronDown size={16} strokeWidth={2.5} />
            </button>
          </div>
          {/* Story highlights */}
          <div className="flex gap-4 mt-4 overflow-x-auto pb-1" aria-hidden="true">
            {IG_HIGHLIGHTS.map((h) => (
              <div key={h.label} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-[54px] h-[54px] rounded-full p-[2px] ring-[1.5px] ring-black/10">
                  <img src={h.img} alt="" className="w-full h-full rounded-full object-cover" />
                </div>
                <span className="text-[10px] text-black/80">{h.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <ViewTabs views={viewsByNetwork.Instagram} active={view} onChange={setView} />
          <div className="grid grid-cols-3 gap-[1.5px]" key={view}>
            {grid.map((post, i) => (
              <GridItem
                key={i}
                src={post.image}
                i={i}
                ratio={view === "reels" ? "aspect-[9/16]" : "aspect-square"}
                views={view === "reels" ? viewsAt(i) : undefined}
                onClick={() => onOpen(post)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function FacebookScreen({
  posts, view, setView, onOpen,
}: {
  posts: SocialPost[];
  view: string;
  setView: (v: string) => void;
  onOpen: (p: SocialPost) => void;
}) {
  const p = profiles.Facebook;

  return (
    <>
      <div className="flex items-center justify-between px-3.5 py-1.5">
        <span className="text-[19px] font-bold tracking-[-0.04em]" style={{ color: "#1877F2" }}>
          facebook
        </span>
        <div className="flex items-center gap-2.5 text-gray-400" aria-hidden="true">
          <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
            <Search size={15} />
          </span>
          <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
            <MessageCircle size={15} />
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ background: "#f0f2f5", overscrollBehavior: "contain" }}>
        <div className="bg-white">
          <div className="h-[92px] overflow-hidden" aria-hidden="true">
            <img src={p.cover} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="px-3.5 pb-3 -mt-7">
            <img src={p.avatar} alt="" className="w-[70px] h-[70px] rounded-full object-cover ring-4 ring-white" />
            <div className="mt-1.5 flex items-center gap-1 text-[17px] font-bold leading-tight tracking-[-0.02em]">
              {p.name}
              <BadgeCheck size={15} className="text-blue-400" fill="#5B8FBF" stroke="white" aria-hidden="true" />
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">{p.category}</div>
            <div className="flex gap-3 mt-1 text-[11px] text-gray-400" aria-hidden="true">
              {p.stats.map((s) => (
                <span key={s.k}><span className="font-semibold text-black">{s.v}</span> {s.k}</span>
              ))}
            </div>
            <div className="flex gap-1.5 mt-2.5" aria-hidden="true">
              <button className="flex-1 h-8 rounded-md text-white text-[12px] font-semibold flex items-center justify-center gap-1.5" style={{ background: "#1877F2" }}>
                <ThumbsUp size={13} /> Me gusta
              </button>
              <button className="flex-1 h-8 rounded-md text-[12px] font-semibold flex items-center justify-center gap-1.5" style={{ background: "#EFEFEF" }}>
                <MessageCircle size={13} /> Mensaje
              </button>
            </div>
          </div>
          <ViewTabs views={viewsByNetwork.Facebook} active={view} onChange={setView} color="#1877F2" />
        </div>

        {view === "fotos" ? (
          <div className="grid grid-cols-3 gap-[3px] p-[3px] bg-white" key="fotos">
            {posts.map((post, i) => (
              <GridItem key={i} src={post.image} i={i} onClick={() => onOpen(post)} />
            ))}
          </div>
        ) : (
          <div key="feed">
            {posts.map((post, i) => (
              <div key={i} className="bg-white mt-2" style={{ animation: `fadeIn 0.32s ease-out ${i * 0.05}s both` }}>
                <div className="flex items-center gap-2.5 px-3.5 pt-3">
                  <img src={p.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                  <div className="leading-tight">
                    <div className="text-[12.5px] font-semibold">{p.name}</div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                      3 h · <Globe size={10} aria-hidden="true" />
                    </div>
                  </div>
                  <MoreHorizontal size={17} className="ml-auto text-gray-400" aria-hidden="true" />
                </div>
                <div className="px-3.5 py-2 text-[12px] leading-[1.4] text-black/90">{post.overlay}</div>
                <button onClick={() => onOpen(post)} className="block w-full">
                  <img src={post.image} alt="" className="w-full aspect-[1.91/1] object-cover" />
                </button>
                <div className="flex items-center justify-between px-3.5 py-2 text-[11px] text-gray-400" aria-hidden="true">
                  <span className="flex items-center gap-1.5"><ReactionStack /> 1,2 mil</span>
                  <span>84 comentarios · 12 compartidos</span>
                </div>
                <div className="flex border-t border-black/[0.07] mx-3.5 text-[12px] text-gray-400 font-medium" aria-hidden="true">
                  <span className="flex-1 py-2 flex items-center justify-center gap-1.5"><ThumbsUp size={15} /> Me gusta</span>
                  <span className="flex-1 py-2 flex items-center justify-center gap-1.5"><MessageCircle size={15} /> Comentar</span>
                  <span className="flex-1 py-2 flex items-center justify-center gap-1.5"><Share2 size={15} /> Compartir</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function TikTokScreen({
  posts, view, setView, onOpen,
}: {
  posts: SocialPost[];
  view: string;
  setView: (v: string) => void;
  onOpen: (p: SocialPost) => void;
}) {
  const p = profiles.TikTok;

  return (
    <>
      <div className="flex items-center justify-between px-3.5 py-1.5 text-black">
        <span className="w-6" />
        <span className="font-semibold text-[14px]">{p.handle}</span>
        <MoreHorizontal size={18} aria-hidden="true" />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ overscrollBehavior: "contain" }}>
        <div className="flex flex-col items-center px-4 pt-1">
          <img src={p.avatar} alt="" className="w-[80px] h-[80px] rounded-full object-cover ring-1 ring-black/5" />
          <div className="mt-2 flex items-center gap-1 text-[14px] font-semibold tracking-[-0.01em]">
            @{p.handle}
            <BadgeCheck size={13} className="text-blue-400" fill="#5B8FBF" stroke="white" aria-hidden="true" />
          </div>
          <div className="flex gap-7 mt-3.5" aria-hidden="true">
            {p.stats.map((s) => (
              <div key={s.k} className="text-center">
                <div className="text-[16px] font-semibold leading-none tracking-[-0.02em]">{s.v}</div>
                <div className="text-[10.5px] text-gray-400 mt-1.5">{s.k}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3.5 w-full" aria-hidden="true">
            <button className="flex-1 h-9 rounded-[8px] text-white text-[13px] font-semibold" style={{ background: "#FE2C55" }}>
              Seguir
            </button>
            <button className="w-11 h-9 rounded-[8px] flex items-center justify-center" style={{ background: "#F1F1F2" }}>
              <ChevronDown size={16} strokeWidth={2.5} />
            </button>
            <button className="w-11 h-9 rounded-[8px] flex items-center justify-center" style={{ background: "#F1F1F2" }}>
              <Send size={15} />
            </button>
          </div>
          <div className="text-[12px] text-center mt-3.5 leading-[1.45] whitespace-pre-line text-black/90">
            {p.bio}
          </div>
        </div>
        <div className="mt-3">
          <ViewTabs views={viewsByNetwork.TikTok} active={view} onChange={setView} color="#1a1a1a" />
          <div className="grid grid-cols-3 gap-[2px]" key={view}>
            {posts.map((post, i) => (
              <GridItem key={i} src={post.image} i={i} ratio="aspect-[9/16]" views={viewsAt(i)} onClick={() => onOpen(post)} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Componente público
 * ────────────────────────────────────────────────────────────────────────────── */

interface SocialPhonePreviewProps {
  network: string;
}

export function SocialPhonePreview({ network }: SocialPhonePreviewProps) {
  const networkViews = viewsByNetwork[network] ?? viewsByNetwork.Instagram;
  const [view, setView] = useState(networkViews[0].id);
  const [selected, setSelected] = useState<SocialPost | null>(null);

  // Al cambiar de red, resetear la vista interna y el detalle abierto.
  useEffect(() => {
    setView((viewsByNetwork[network] ?? viewsByNetwork.Instagram)[0].id);
    setSelected(null);
  }, [network]);

  const posts = socialPosts[network] ?? [];
  const profile = profiles[network as keyof typeof profiles];

  const screen =
    network === "Instagram" ? (
      <InstagramScreen posts={posts} view={view} setView={setView} onOpen={setSelected} />
    ) : network === "Facebook" ? (
      <FacebookScreen posts={posts} view={view} setView={setView} onOpen={setSelected} />
    ) : (
      <TikTokScreen posts={posts} view={view} setView={setView} onOpen={setSelected} />
    );

  return (
    <Phone>
      {screen}
      {selected && (
        <PostDetail
          network={network}
          post={selected}
          profile={profile}
          onBack={() => setSelected(null)}
        />
      )}
    </Phone>
  );
}
