import { useState, useEffect, useRef, createContext, useContext } from "react";

const API       = "http://localhost:3000/api/auth";
const PROFILE   = "http://localhost:3000/api/profile";
const NUTRITION = "http://localhost:3000/api/nutrition";

async function apiFetch(base, path, body, method = "POST") {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
//  THEME SYSTEM
//  light = "Pure White / Clean" (green CTA)
//  dark  = "Charcoal + Orange / Bold" (orange CTA)
// ─────────────────────────────────────────────────────────────────────────────
const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

const THEMES = {
  light: {
    mode: "light",
    accent:               "#22c55e",
    accentGrad:           "linear-gradient(135deg,#22c55e,#16a34a)",
    accentGlow:           "rgba(34,197,94,0.32)",
    accentText:           "#fff",
    pageBg:               "#eef5ee",
    cardBg:               "#ffffff",
    cardBorder:           "rgba(0,0,0,0.07)",
    cardShadow:           "0 20px 60px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.05)",
    inputBg:              "#f5f8f5",
    inputBgFocus:         "rgba(34,197,94,0.04)",
    inputBorder:          "rgba(0,0,0,0.1)",
    inputBorderFocus:     "rgba(34,197,94,0.55)",
    inputText:            "#111",
    inputPlaceholder:     "#bbb",
    textPrimary:          "#0f1a0f",
    textSecondary:        "#687868",
    textMuted:            "#b0c0b0",
    textAccent:           "#16a34a",
    socialBg:             "#f5f8f5",
    socialBorder:         "rgba(0,0,0,0.08)",
    socialText:           "#555",
    divider:              "rgba(0,0,0,0.07)",
    choiceBg:             "#f5f8f5",
    choiceBorder:         "rgba(0,0,0,0.08)",
    choiceBgSel:          "rgba(34,197,94,0.07)",
    choiceBorderSel:      "rgba(34,197,94,0.45)",
    choiceText:           "#333",
    choiceTextSel:        "#16a34a",
    dotInactive:          "rgba(0,0,0,0.11)",
    ringTrack:            "rgba(0,0,0,0.07)",
    ringFill:             "#22c55e",
    ringText:             "#0f1a0f",
    ringSubtext:          "#99a899",
    macroTrack:           "rgba(0,0,0,0.07)",
    weekActiveBg:         "linear-gradient(135deg,#22c55e,#16a34a)",
    weekActiveText:       "#fff",
    weekInactiveBg:       "#f0f5f0",
    weekInactiveText:     "#99a899",
    mealBorder:           "rgba(0,0,0,0.06)",
    mealDishText:         "#111",
    mealMetaText:         "#99a899",
    unitActiveBg:         "rgba(34,197,94,0.09)",
    unitActiveBorder:     "rgba(34,197,94,0.45)",
    unitActiveText:       "#16a34a",
    unitInactiveBg:       "#f5f8f5",
    unitInactiveBorder:   "rgba(0,0,0,0.08)",
    unitInactiveText:     "#99a899",
    resultBg:             "#f0faf0",
    resultBorder:         "rgba(34,197,94,0.22)",
    macroBg:              "#e8f5e8",
    statsCardBg:          "#f5f8f5",
    statsCardBorder:      "rgba(0,0,0,0.06)",
    statsValue:           "#0f1a0f",
    statsLabel:           "#b0c0b0",
    btnSecBg:             "#f0f5f0",
    btnSecBorder:         "rgba(0,0,0,0.08)",
    btnSecText:           "#99a899",
    goalChipBg:           "rgba(34,197,94,0.07)",
    goalChipBorder:       "rgba(34,197,94,0.2)",
  },
  dark: {
    mode: "dark",
    accent:               "#f97316",
    accentGrad:           "linear-gradient(135deg,#f97316,#ea580c)",
    accentGlow:           "rgba(249,115,22,0.32)",
    accentText:           "#fff",
    pageBg:               "#111111",
    cardBg:               "#1c1c1c",
    cardBorder:           "rgba(255,255,255,0.06)",
    cardShadow:           "0 20px 60px rgba(0,0,0,0.65)",
    inputBg:              "#252525",
    inputBgFocus:         "rgba(249,115,22,0.05)",
    inputBorder:          "rgba(255,255,255,0.09)",
    inputBorderFocus:     "rgba(249,115,22,0.5)",
    inputText:            "#f0f0f0",
    inputPlaceholder:     "#555",
    textPrimary:          "#f0f0f0",
    textSecondary:        "#888",
    textMuted:            "#444",
    textAccent:           "#f97316",
    socialBg:             "#252525",
    socialBorder:         "rgba(255,255,255,0.07)",
    socialText:           "#aaa",
    divider:              "rgba(255,255,255,0.07)",
    choiceBg:             "#252525",
    choiceBorder:         "rgba(255,255,255,0.07)",
    choiceBgSel:          "rgba(249,115,22,0.09)",
    choiceBorderSel:      "rgba(249,115,22,0.45)",
    choiceText:           "#ccc",
    choiceTextSel:        "#f97316",
    dotInactive:          "rgba(255,255,255,0.1)",
    ringTrack:            "rgba(255,255,255,0.06)",
    ringFill:             "#f97316",
    ringText:             "#f0f0f0",
    ringSubtext:          "#555",
    macroTrack:           "rgba(255,255,255,0.07)",
    weekActiveBg:         "linear-gradient(135deg,#f97316,#ea580c)",
    weekActiveText:       "#fff",
    weekInactiveBg:       "rgba(255,255,255,0.04)",
    weekInactiveText:     "#555",
    mealBorder:           "rgba(255,255,255,0.06)",
    mealDishText:         "#f0f0f0",
    mealMetaText:         "#555",
    unitActiveBg:         "rgba(249,115,22,0.13)",
    unitActiveBorder:     "rgba(249,115,22,0.5)",
    unitActiveText:       "#f97316",
    unitInactiveBg:       "transparent",
    unitInactiveBorder:   "rgba(255,255,255,0.08)",
    unitInactiveText:     "#555",
    resultBg:             "rgba(249,115,22,0.04)",
    resultBorder:         "rgba(249,115,22,0.15)",
    macroBg:              "rgba(255,255,255,0.04)",
    statsCardBg:          "rgba(255,255,255,0.03)",
    statsCardBorder:      "rgba(255,255,255,0.06)",
    statsValue:           "#f0f0f0",
    statsLabel:           "#444",
    btnSecBg:             "rgba(255,255,255,0.04)",
    btnSecBorder:         "rgba(255,255,255,0.08)",
    btnSecText:           "#666",
    goalChipBg:           "rgba(249,115,22,0.07)",
    goalChipBorder:       "rgba(249,115,22,0.2)",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  THEME TOGGLE — fixed pill button
// ─────────────────────────────────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, setThemeMode } = useTheme();
  const t = THEMES[theme];
  const isLight = theme === "light";
  return (
    <button
      onClick={() => setThemeMode(isLight ? "dark" : "light")}
      style={{
        position: "fixed", top: 14, right: 14, zIndex: 9998,
        display: "flex", alignItems: "center", gap: 7,
        background: t.cardBg, border: `1px solid ${t.cardBorder}`,
        borderRadius: 99, padding: "7px 14px 7px 10px",
        cursor: "pointer", boxShadow: t.cardShadow,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        fontSize: 12, fontWeight: 700, color: t.textSecondary,
      }}
    >
      <span style={{ fontSize: 14 }}>{isLight ? "🌙" : "☀️"}</span>
      <span style={{ letterSpacing: "0.04em" }}>{isLight ? "DARK" : "LIGHT"}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  LOGO + BRAND
// ─────────────────────────────────────────────────────────────────────────────
function NutriLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 110" fill="none">
      <defs>
        <radialGradient id="mg" cx="40%" cy="30%" r="70%"><stop offset="0%" stopColor="#4aaa4a" stopOpacity="0.7"/><stop offset="100%" stopColor="#1a4a1a" stopOpacity="0"/></radialGradient>
        <radialGradient id="tg" cx="35%" cy="30%" r="65%"><stop offset="0%" stopColor="#ff8080" stopOpacity="0.5"/><stop offset="100%" stopColor="#8b0000" stopOpacity="0"/></radialGradient>
      </defs>
      <ellipse cx="60" cy="72" rx="38" ry="24" fill="#2d7a2d"/>
      <ellipse cx="60" cy="72" rx="38" ry="24" fill="url(#mg)"/>
      <path d="M28 66 Q60 58 92 66" stroke="#5acc5a" strokeWidth="2.5" strokeLinecap="round" opacity="0.55"/>
      <path d="M46 62 C42 52 36 44 34 32" stroke="#22a84a" strokeWidth="3" strokeLinecap="round"/>
      <path d="M40 50 C36 44 30 40 26 34" stroke="#22a84a" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M44 55 C40 47 38 38 40 30" stroke="#22a84a" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="33" cy="31" rx="7" ry="3.5" fill="#22a84a" transform="rotate(-30 33 31)"/>
      <ellipse cx="25" cy="33" rx="6" ry="3" fill="#2ecc71" transform="rotate(-50 25 33)"/>
      <path d="M58 60 C57 50 55 38 54 24" stroke="#e67e22" strokeWidth="5" strokeLinecap="round"/>
      <path d="M62 60 C63 50 65 38 66 24" stroke="#e67e22" strokeWidth="5" strokeLinecap="round"/>
      <path d="M55 24 C57 16 63 16 65 24" fill="#e67e22"/>
      <path d="M57 60 Q60 66 63 60" fill="#d35400"/>
      <path d="M60 24 C58 14 52 8 48 6" stroke="#22a84a" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M60 24 C62 12 68 8 72 5" stroke="#22a84a" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="48" cy="6" rx="5" ry="2.5" fill="#22a84a" transform="rotate(-40 48 6)"/>
      <ellipse cx="72" cy="5" rx="5" ry="2.5" fill="#22a84a" transform="rotate(40 72 5)"/>
      <circle cx="36" cy="90" r="13" fill="#c0392b"/>
      <circle cx="36" cy="90" r="13" fill="url(#tg)"/>
      <circle cx="36" cy="90" r="9" fill="#e74c3c"/>
      <circle cx="36" cy="90" r="5" fill="#c0392b"/>
      <path d="M33 77 C33 73 36 72 38 74" stroke="#22a84a" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="84" cy="90" r="13" fill="#c0392b"/>
      <circle cx="84" cy="90" r="13" fill="url(#tg)"/>
      <circle cx="84" cy="90" r="9" fill="#e74c3c"/>
      <circle cx="84" cy="90" r="5" fill="#c0392b"/>
      <path d="M81 77 C81 73 84 72 86 74" stroke="#22a84a" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function Brand({ small }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: small ? 0 : 4 }}>
      <NutriLogo size={small ? 28 : 44} />
      <span style={{ fontSize: small ? 17 : 23, fontWeight: 900, color: t.textPrimary, fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: "-0.03em" }}>
        Nutri<span style={{ color: t.accent }}>Ai</span>
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHARED UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function Input({ type = "text", value, onChange, placeholder, min, max }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ position: "relative" }}>
      <input
        type={isPass && !show ? "password" : type === "number" ? "number" : "text"}
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} min={min} max={max}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", boxSizing: "border-box",
          background: focused ? t.inputBgFocus : t.inputBg,
          border: `1.5px solid ${focused ? t.inputBorderFocus : t.inputBorder}`,
          borderRadius: 12, padding: isPass ? "13px 44px 13px 16px" : "13px 16px",
          color: t.inputText, fontSize: 14, outline: "none",
          fontFamily: "inherit",
        }}
      />
      {isPass && (
        <button type="button" onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: 0, display: "flex" }}>
          {show
            ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
        </button>
      )}
    </div>
  );
}

function Btn({ children, onClick, loading, variant = "primary", small }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  const base = {
    width: "100%", padding: small ? "10px" : "14px 18px",
    borderRadius: 12, border: "none",
    fontSize: small ? 13 : 15, fontWeight: 800,
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "inherit", letterSpacing: "0.01em",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  };
  const styles = {
    primary: { ...base, background: loading ? t.textMuted : t.accentGrad, color: t.accentText, opacity: loading ? 0.7 : 1, boxShadow: loading ? "none" : `0 4px 20px ${t.accentGlow}` },
    secondary: { ...base, background: t.btnSecBg, color: t.btnSecText, border: `1px solid ${t.btnSecBorder}` },
  };
  return (
    <button onClick={onClick} disabled={loading} style={styles[variant] || styles.primary}>
      {loading
        ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>Please wait…</>
        : children}
    </button>
  );
}

function SocialRow() {
  const { theme } = useTheme();
  const t = THEMES[theme];
  const s = {
    flex: 1, padding: "11px 10px", borderRadius: 12,
    border: `1px solid ${t.socialBorder}`, background: t.socialBg,
    color: t.socialText, cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", gap: 8,
    fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
  };
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button style={s}>
        <svg width="15" height="15" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Continue with Google
      </button>
      <button style={s}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill={t.socialText}><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.2 1.29-2.18 3.85.03 3.05 2.67 4.06 2.7 4.07-.03.07-.42 1.44-1.38 2.65M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
        Continue with Apple
      </button>
    </div>
  );
}

function Or() {
  const { theme } = useTheme();
  const t = THEMES[theme];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 1, background: t.divider }} />
      <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 700, letterSpacing: "0.09em" }}>OR</span>
      <div style={{ flex: 1, height: 1, background: t.divider }} />
    </div>
  );
}

function Card({ children, title, subtitle, wide }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  return (
    <div style={{
      background: t.cardBg, border: `1px solid ${t.cardBorder}`,
      borderRadius: 24, padding: "32px 28px",
      width: "100%", maxWidth: wide ? 480 : 400,
      boxShadow: t.cardShadow,
    }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Brand />
        {title && <h2 style={{ margin: "16px 0 5px", fontSize: 24, fontWeight: 900, color: t.textPrimary, letterSpacing: "-0.03em", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{title}</h2>}
        {subtitle && <p style={{ margin: 0, fontSize: 13, color: t.textSecondary, lineHeight: 1.65 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function LinkBtn({ onClick, children }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  return <button onClick={onClick} style={{ background: "none", border: "none", color: t.accent, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}>{children}</button>;
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { if (msg) { const x = setTimeout(onClose, 3500); return () => clearTimeout(x); } }, [msg]);
  if (!msg) return null;
  return (
    <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: type === "error" ? "#dc2626" : "#16a34a", color: "#fff", borderRadius: 12, padding: "12px 20px", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 30px rgba(0,0,0,0.25)", animation: "slideIn 0.3s ease", fontFamily: "'Plus Jakarta Sans',sans-serif", whiteSpace: "nowrap" }}>{msg}</div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  AUTH SCREENS
// ─────────────────────────────────────────────────────────────────────────────
function LoginScreen({ onSwitch, onForgot, setToast, setUser }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    if (!email || !password) return setToast({ msg: "Please fill all fields", type: "error" });
    setLoading(true);
    const data = await apiFetch(API, "/login", { email, password });
    setLoading(false);
    if (data.success) { setToast({ msg: "Welcome back!", type: "success" }); setUser({ email }); }
    else setToast({ msg: data.msg || data.message || "Login failed", type: "error" });
  };
  return (
    <Card title="Welcome back" subtitle="Sign into your account">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <SocialRow />
        <Or />
        <Input type="email" value={email} onChange={setEmail} placeholder="Email address" />
        <Input type="password" value={password} onChange={setPassword} placeholder="Password" />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onForgot} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Forgot password?</button>
        </div>
        <Btn onClick={handle} loading={loading}>Login now ›</Btn>
        <p style={{ textAlign: "center", fontSize: 13, color: t.textSecondary, margin: 0 }}>Don't have an account? <LinkBtn onClick={() => onSwitch("signup")}>Sign up</LinkBtn></p>
      </div>
    </Card>
  );
}

function SignupScreen({ onSwitch, setToast, onVerify }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    if (!name || !email || !password) return setToast({ msg: "All fields are required", type: "error" });
    setLoading(true);
    const data = await apiFetch(API, "/signup", { name, email, password });
    setLoading(false);
    if (data.success) { setToast({ msg: "Account created! Check your email.", type: "success" }); onVerify(email); }
    else setToast({ msg: data.message || "Signup failed", type: "error" });
  };
  return (
    <Card title="Create account" subtitle="Start your nutrition journey today">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <SocialRow />
        <Or />
        <Input value={name} onChange={setName} placeholder="Full Name" />
        <Input type="email" value={email} onChange={setEmail} placeholder="Email address" />
        <Input type="password" value={password} onChange={setPassword} placeholder="Password" />
        <Btn onClick={handle} loading={loading}>Create account ›</Btn>
        <p style={{ textAlign: "center", fontSize: 13, color: t.textSecondary, margin: 0 }}>Already have an account? <LinkBtn onClick={() => onSwitch("login")}>Sign In</LinkBtn></p>
      </div>
    </Card>
  );
}

function VerifyScreen({ email, onSwitch, setToast, setUser }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const refs = useRef([]);
  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const n = [...code]; n[i] = val; setCode(n);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };
  const handleKey = (i, e) => { if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus(); };
  const handle = async () => {
    const c = code.join("");
    if (c.length < 6) return setToast({ msg: "Enter the full 6-digit code", type: "error" });
    setLoading(true);
    const data = await apiFetch(API, "/verify-email", { code: c });
    setLoading(false);
    if (data.success) { setToast({ msg: "Verified! Welcome to NutriAi!", type: "success" }); setUser({ email }); }
    else setToast({ msg: data.message || "Invalid code", type: "error" });
  };
  return (
    <Card title="Check your email" subtitle={`We sent a 6-digit code to ${email}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {code.map((d, i) => (
            <input key={i} ref={el => refs.current[i] = el} maxLength={1} value={d}
              onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKey(i, e)}
              style={{ width: 46, height: 54, textAlign: "center", fontSize: 22, fontWeight: 900, background: d ? t.inputBgFocus : t.inputBg, border: `2px solid ${d ? t.accent : t.inputBorder}`, borderRadius: 12, color: t.inputText, outline: "none", fontFamily: "inherit" }}
            />
          ))}
        </div>
        <Btn onClick={handle} loading={loading}>Verify & Continue ›</Btn>
        <p style={{ textAlign: "center", fontSize: 13, color: t.textSecondary, margin: 0 }}>Back to <LinkBtn onClick={() => onSwitch("login")}>Sign In</LinkBtn></p>
      </div>
    </Card>
  );
}

function ForgotScreen({ onSwitch, setToast }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const handle = async () => {
    if (!email) return setToast({ msg: "Enter your email", type: "error" });
    setLoading(true);
    const data = await apiFetch(API, "/forgot-password", { email });
    setLoading(false);
    if (data.success) { setSent(true); setToast({ msg: "Reset link sent!", type: "success" }); }
    else setToast({ msg: data.message || "Not found", type: "error" });
  };
  return (
    <Card title="Forgot Password?" subtitle="Enter your email and we'll send a reset link.">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {sent
          ? <div style={{ textAlign: "center", padding: "14px 0" }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📬</div>
              <p style={{ color: t.textSecondary, fontSize: 13, lineHeight: 1.7 }}>Check <span style={{ color: t.accent, fontWeight: 800 }}>{email}</span> for your reset link.</p>
            </div>
          : <Input type="email" value={email} onChange={setEmail} placeholder="Email address" />}
        {!sent && <Btn onClick={handle} loading={loading}>Send Reset Link ›</Btn>}
        <p style={{ textAlign: "center", fontSize: 13, color: t.textSecondary, margin: 0 }}>Remembered it? <LinkBtn onClick={() => onSwitch("login")}>Sign In</LinkBtn></p>
      </div>
    </Card>
  );
}

function ResetScreen({ token, onSwitch, setToast }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    if (!password || password !== confirm) return setToast({ msg: "Passwords don't match", type: "error" });
    setLoading(true);
    const res = await fetch(`${API}/reset-password/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ password }) });
    const data = await res.json();
    setLoading(false);
    if (data.success) { setToast({ msg: "Password reset!", type: "success" }); onSwitch("login"); }
    else setToast({ msg: data.msg || "Failed", type: "error" });
  };
  return (
    <Card title="Reset Password" subtitle="Choose a strong new password.">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input type="password" value={password} onChange={setPassword} placeholder="New password" />
        <Input type="password" value={confirm} onChange={setConfirm} placeholder="Confirm new password" />
        <Btn onClick={handle} loading={loading}>Reset Password ›</Btn>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ONBOARDING
// ─────────────────────────────────────────────────────────────────────────────
const GOALS = [
  { value: "lose_weight",  label: "Lose Weight",  emoji: "🔥" },
  { value: "gain_weight",  label: "Gain Weight",  emoji: "💪" },
  { value: "maintain",     label: "Maintain",      emoji: "⚖️" },
  { value: "build_muscle", label: "Build Muscle", emoji: "🏋️" },
];
const ACTIVITY = [
  { value: "sedentary",         label: "Sedentary",         desc: "Little or no exercise" },
  { value: "lightly_active",    label: "Lightly Active",    desc: "Exercise 1–3 days/week" },
  { value: "moderately_active", label: "Moderately Active", desc: "Exercise 3–5 days/week" },
  { value: "very_active",       label: "Very Active",       desc: "Exercise 6–7 days/week" },
  { value: "extra_active",      label: "Extra Active",      desc: "Athlete / physical job" },
];
const TOTAL_STEPS = 5;

function ProgressDots({ step }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24 }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} style={{ width: i === step - 1 ? 22 : 6, height: 6, borderRadius: 3, background: i < step ? t.accent : t.dotInactive }} />
      ))}
    </div>
  );
}

function ChoiceBtn({ selected, onClick, children, emoji, desc }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "14px 18px", borderRadius: 14,
      border: `1.5px solid ${selected ? t.choiceBorderSel : t.choiceBorder}`,
      background: selected ? t.choiceBgSel : t.choiceBg,
      color: selected ? t.choiceTextSel : t.choiceText,
      fontFamily: "inherit", cursor: "pointer",
      display: "flex", alignItems: "center", gap: 12, textAlign: "left",
    }}>
      {emoji && <span style={{ fontSize: 20 }}>{emoji}</span>}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{children}</div>
        {desc && <div style={{ fontSize: 11.5, color: selected ? t.accent : t.textMuted, marginTop: 2, opacity: 0.85 }}>{desc}</div>}
      </div>
      {selected && <svg style={{ marginLeft: "auto", flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
    </button>
  );
}

function OnboardingScreen({ onDone, setToast }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ gender: "", age: "", height: "", weight: "", goal: "", activityLevel: "sedentary", targetWeight: "" });

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(""); };
  const validate = () => {
    if (step === 1 && !form.gender) { setError("Please select your gender"); return false; }
    if (step === 2) {
      if (!form.age || !form.height || !form.weight) { setError("Please fill in all fields"); return false; }
      if (form.age < 10 || form.age > 120)           { setError("Enter a valid age (10–120)"); return false; }
      if (form.height < 50 || form.height > 300)     { setError("Enter a valid height in cm"); return false; }
      if (form.weight < 20 || form.weight > 500)     { setError("Enter a valid weight in kg"); return false; }
    }
    if (step === 3 && !form.goal)          { setError("Please select your goal"); return false; }
    if (step === 4 && !form.activityLevel) { setError("Please select your activity level"); return false; }
    return true;
  };
  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => { setError(""); setStep(s => s - 1); };
  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await apiFetch(PROFILE, "/setup", {
        age: Number(form.age), height: Number(form.height), weight: Number(form.weight),
        gender: form.gender, goal: form.goal, activityLevel: form.activityLevel,
        targetWeight: form.targetWeight ? Number(form.targetWeight) : Number(form.weight),
      });
      if (data.success) { setToast({ msg: "Your plan is ready! 🎉", type: "success" }); onDone(data); }
      else setError(data.message || "Something went wrong");
    } catch { setError("Could not connect to server"); }
    finally { setLoading(false); }
  };

  const H2    = { margin: 0, fontSize: 22, fontWeight: 900, color: t.textPrimary, letterSpacing: "-0.02em", fontFamily: "'Plus Jakarta Sans',sans-serif" };
  const SUB   = { margin: "6px 0 0", fontSize: 12.5, color: t.textSecondary };
  const LABEL = { fontSize: 11, color: t.textMuted, fontWeight: 800, marginBottom: -4, textTransform: "uppercase", letterSpacing: "0.08em" };

  const renderStep = () => {
    switch (step) {
      case 1: return (<>
        <h2 style={H2}>Choose your Gender</h2><p style={SUB}>This calibrates your personal plan.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          {["male", "female", "other"].map(g => (
            <ChoiceBtn key={g} selected={form.gender === g} onClick={() => set("gender", g)}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </ChoiceBtn>
          ))}
        </div>
      </>);
      case 2: return (<>
        <h2 style={H2}>Your Body Stats</h2><p style={SUB}>Used to calculate your daily calorie needs.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
          <label style={LABEL}>Age</label>
          <Input type="number" value={form.age} onChange={v => set("age", v)} placeholder="e.g. 25" min={10} max={120} />
          <label style={LABEL}>Height (cm)</label>
          <Input type="number" value={form.height} onChange={v => set("height", v)} placeholder="e.g. 170" min={50} max={300} />
          <label style={LABEL}>Current Weight (kg)</label>
          <Input type="number" value={form.weight} onChange={v => set("weight", v)} placeholder="e.g. 70" min={20} max={500} />
        </div>
      </>);
      case 3: return (<>
        <h2 style={H2}>What is your goal?</h2><p style={SUB}>Your plan will be fully customized around this.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          {GOALS.map(g => (
            <ChoiceBtn key={g.value} selected={form.goal === g.value} onClick={() => set("goal", g.value)} emoji={g.emoji}>{g.label}</ChoiceBtn>
          ))}
        </div>
      </>);
      case 4: return (<>
        <h2 style={H2}>Activity Level</h2><p style={SUB}>How active are you on a weekly basis?</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          {ACTIVITY.map(a => (
            <ChoiceBtn key={a.value} selected={form.activityLevel === a.value} onClick={() => set("activityLevel", a.value)} desc={a.desc}>{a.label}</ChoiceBtn>
          ))}
        </div>
      </>);
      case 5: return (<>
        <h2 style={H2}>Desired Weight?</h2><p style={SUB}>{GOALS.find(g => g.value === form.goal)?.label}</p>
        <div style={{ textAlign: "center", margin: "24px 0 8px" }}>
          <span style={{ fontSize: 56, fontWeight: 900, color: t.accent, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{form.targetWeight || form.weight || "—"}</span>
          <span style={{ fontSize: 22, color: t.textMuted, marginLeft: 6 }}>kg</span>
        </div>
        <input type="range" min={30} max={200} value={form.targetWeight || form.weight || 70} onChange={e => set("targetWeight", e.target.value)} style={{ width: "100%", accentColor: t.accent, marginBottom: 8 }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: t.textMuted }}><span>30 kg</span><span>200 kg</span></div>
      </>);
      default: return null;
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 430 }}>
      <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 24, padding: "28px 28px", boxShadow: t.cardShadow }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          {step > 1
            ? <button onClick={back} style={{ background: "none", border: `1px solid ${t.cardBorder}`, borderRadius: 8, color: t.accent, cursor: "pointer", padding: "6px 12px", fontSize: 13, fontFamily: "inherit", fontWeight: 700 }}>← Back</button>
            : <div />}
          <Brand small />
          <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 700 }}>{step}/{TOTAL_STEPS}</span>
        </div>
        <ProgressDots step={step} />
        {renderStep()}
        {error && <p style={{ color: "#dc2626", fontSize: 12.5, textAlign: "center", marginTop: 12, fontWeight: 600 }}>{error}</p>}
        <div style={{ marginTop: 22 }}>
          <Btn onClick={step === TOTAL_STEPS ? submit : next} loading={loading}>
            {step === TOTAL_STEPS ? "Get My Plan 🚀" : "Continue ›"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function CalRing({ eaten, target, size = 190 }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  const r = (size - 22) / 2;
  const circ = 2 * Math.PI * r;
  const pct = target ? Math.min(eaten / target, 1) : 0;
  const offset = circ * (1 - pct);
  const cx = size / 2;
  const left = Math.max(0, (target || 0) - eaten);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={t.ringTrack} strokeWidth={16} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={t.ringFill} strokeWidth={16}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.34,1.2,0.64,1)", filter: `drop-shadow(0 0 8px ${t.ringFill}66)` }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <span style={{ fontSize: 38, fontWeight: 900, color: t.ringText, fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: -2, lineHeight: 1 }}>{eaten}</span>
        <span style={{ fontSize: 10, color: t.ringSubtext, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>
          {target ? `${(target / 1000).toFixed(3)} kcal` : "kcal"}
        </span>
        {target > 0 && <span style={{ fontSize: 11, color: t.accent, fontWeight: 800, marginTop: 2 }}>{left} left</span>}
      </div>
    </div>
  );
}

function MacroPill({ label, eaten, target, color }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  const pct = target ? Math.min((eaten / target) * 100, 100) : 0;
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ height: 5, borderRadius: 99, background: t.macroTrack, overflow: "hidden", marginBottom: 7 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: t.textMuted, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
        <span style={{ fontSize: 10, color: t.textSecondary, fontFamily: "monospace" }}>
          <span style={{ color: t.textPrimary, fontWeight: 700 }}>{eaten}</span>/{target || "—"}g
        </span>
      </div>
    </div>
  );
}

function WeekStrip({ activeDay, setActiveDay }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  const today = new Date();
  const days  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const dow   = (today.getDay() + 6) % 7;
  return (
    <div>
      <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
        {today.toLocaleString("default", { month: "long" })} {today.getFullYear()}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {days.map((d, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() - dow + i);
          const isToday = i === dow;
          const isActive = i === activeDay;
          return (
            <button key={d} onClick={() => setActiveDay(i)} style={{
              flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer",
              background: isActive ? t.weekActiveBg : t.weekInactiveBg,
            }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: isActive ? t.weekActiveText : t.textMuted, letterSpacing: 0.5, marginBottom: 4 }}>{d}</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: isActive ? t.weekActiveText : isToday ? t.accent : t.weekInactiveText, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{date.getDate()}</div>
              {isToday && !isActive && <div style={{ width: 3, height: 3, borderRadius: "50%", background: t.accent, margin: "3px auto 0" }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MealEntry({ meal, onRemove }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: `1px solid ${t.mealBorder}`, animation: "fadeUp 0.25s ease" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: t.mealDishText, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meal.dish}</div>
        <div style={{ fontSize: 11, color: t.mealMetaText, display: "flex", gap: 10 }}>
          <span style={{ color: t.accent, fontWeight: 700 }}>{meal.calories} kcal</span>
          <span>P:{meal.protein}g</span><span>C:{meal.carbs}g</span><span>F:{meal.fats}g</span>
        </div>
      </div>
      <button onClick={() => onRemove(meal.id)} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: 16, padding: "4px 8px", flexShrink: 0 }}
        onMouseEnter={e => e.target.style.color = "#dc2626"}
        onMouseLeave={e => e.target.style.color = t.textMuted}
      >✕</button>
    </div>
  );
}

const UNITS = [
  { label: "g", value: "g" }, { label: "kg", value: "kg" },
  { label: "piece", value: "piece" }, { label: "cup", value: "cup" },
  { label: "tbsp", value: "tbsp" }, { label: "tsp", value: "tsp" },
  { label: "ml", value: "ml" }, { label: "bowl", value: "bowl" },
  { label: "slice", value: "slice" }, { label: "plate", value: "plate" },
];
function toGrams(qty, unit, portion_g) {
  const base = portion_g || 100;
  switch (unit) {
    case "g": return qty; case "kg": return qty * 1000;
    case "piece": return qty * base; case "slice": return qty * base;
    case "cup": return qty * 240; case "tbsp": return qty * 15;
    case "tsp": return qty * 5; case "ml": return qty;
    case "bowl": return qty * 300; case "plate": return qty * base * 2.5;
    default: return qty * base;
  }
}
function scaleMacros(base, consumedGrams) {
  const ratio = consumedGrams / (base.portion_g || 100);
  const r = v => Math.round(v * ratio * 10) / 10;
  return { dish: base.dish, calories: r(base.calories), protein: r(base.protein), carbs: r(base.carbs), fats: r(base.fats), portion_g: Math.round(consumedGrams), source: base.source };
}

function MealSearchPanel({ onAdd, setToast }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  const [query, setQuery] = useState("");
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("piece");
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState(null);
  const [pending, setPending] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    if (!raw) return;
    setPending(scaleMacros(raw, toGrams(Number(qty) || 1, unit, raw.portion_g)));
  }, [qty, unit, raw]);

  const search = async () => {
    const dish = query.trim();
    if (!dish) return;
    setLoading(true); setRaw(null); setPending(null);
    try {
      const data = await apiFetch(NUTRITION, "/search", { dish });
      if (data.success) {
        setRaw(data.result);
        setPending(scaleMacros(data.result, toGrams(Number(qty) || 1, unit, data.result.portion_g)));
      } else { setToast({ msg: data.message || "Not found. Try a different name.", type: "error" }); }
    } catch { setToast({ msg: "Nutrition service unavailable", type: "error" }); }
    setLoading(false);
  };

  const confirm = () => {
    if (!pending) return;
    onAdd({ ...pending, id: Date.now() });
    setRaw(null); setPending(null); setQuery(""); setQty(1); setUnit("piece");
    inputRef.current?.focus();
  };
  const dismiss = () => { setRaw(null); setPending(null); setQuery(""); setQty(1); setUnit("piece"); };
  const canSearch = query.trim() && !loading;

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: t.textMuted, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 12 }}>Log a Meal</div>

      {/* Search row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input ref={inputRef} value={query}
          onChange={e => { setQuery(e.target.value); setRaw(null); setPending(null); }}
          onKeyDown={e => e.key === "Enter" && canSearch && search()}
          placeholder="e.g. eggs, chapati, dal…"
          style={{ flex: 1, background: t.inputBg, border: `1.5px solid ${t.inputBorder}`, borderRadius: 12, padding: "12px 14px", color: t.inputText, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, outline: "none" }}
          onFocus={e => e.target.style.borderColor = t.inputBorderFocus}
          onBlur={e => e.target.style.borderColor = t.inputBorder}
        />
        <button onClick={search} disabled={!canSearch} style={{
          background: canSearch ? t.accentGrad : t.btnSecBg,
          border: "none", borderRadius: 12, padding: "12px 18px",
          color: canSearch ? t.accentText : t.textMuted,
          fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13,
          cursor: canSearch ? "pointer" : "not-allowed",
          minWidth: 76, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {loading
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>
            : "Search"}
        </button>
      </div>

      {/* Qty + units */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", background: t.inputBg, border: `1.5px solid ${t.inputBorder}`, borderRadius: 12, overflow: "hidden" }}>
          <button onClick={() => setQty(q => Math.max(0.5, Number(q) - (unit === "g" || unit === "ml" ? 25 : 0.5)))}
            style={{ background: "none", border: "none", color: t.textMuted, fontSize: 18, padding: "0 12px", height: 44, cursor: "pointer", lineHeight: 1, fontFamily: "inherit" }}>−</button>
          <input type="number" value={qty} min={0.5}
            step={unit === "g" || unit === "ml" || unit === "kg" ? 25 : 0.5}
            onChange={e => setQty(Math.max(0.5, Number(e.target.value) || 1))}
            style={{ width: 50, textAlign: "center", background: "none", border: "none", color: t.inputText, fontWeight: 900, fontSize: 14, fontFamily: "inherit", outline: "none", MozAppearance: "textfield" }} />
          <button onClick={() => setQty(q => Number(q) + (unit === "g" || unit === "ml" ? 25 : 0.5))}
            style={{ background: "none", border: "none", color: t.textMuted, fontSize: 18, padding: "0 12px", height: 44, cursor: "pointer", lineHeight: 1, fontFamily: "inherit" }}>+</button>
        </div>
        <div style={{ display: "flex", gap: 5, overflowX: "auto", flex: 1, paddingBottom: 2 }}>
          {UNITS.map(u => (
            <button key={u.value} onClick={() => setUnit(u.value)} style={{
              flexShrink: 0, padding: "7px 10px", borderRadius: 8,
              border: `1.5px solid ${unit === u.value ? t.unitActiveBorder : t.unitInactiveBorder}`,
              background: unit === u.value ? t.unitActiveBg : t.unitInactiveBg,
              color: unit === u.value ? t.unitActiveText : t.unitInactiveText,
              fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
            }}>{u.label}</button>
          ))}
        </div>
      </div>

      {raw && (
        <div style={{ marginTop: 7, fontSize: 11, color: t.textMuted }}>
          ≈ <span style={{ color: t.textSecondary, fontWeight: 700 }}>{Math.round(toGrams(Number(qty) || 1, unit, raw.portion_g))}g</span>
          {" "}· base {raw.portion_g}g per {raw.dish}
        </div>
      )}

      {pending && (
        <div style={{ marginTop: 12, background: t.resultBg, border: `1px solid ${t.resultBorder}`, borderRadius: 14, padding: "14px 16px", animation: "fadeUp 0.2s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: t.textPrimary, marginBottom: 2, textTransform: "capitalize" }}>{pending.dish}</div>
              <div style={{ fontSize: 11, color: t.textSecondary }}>{qty} {unit} · {pending.portion_g}g</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: t.textPrimary, fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1 }}>{pending.calories}</div>
              <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: 1, fontWeight: 700 }}>KCAL</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {[
              { l: "Protein", v: pending.protein, c: t.accent },
              { l: "Carbs",   v: pending.carbs,   c: "#eab308" },
              { l: "Fat",     v: pending.fats,    c: "#ef4444" },
            ].map(m => (
              <div key={m.l} style={{ flex: 1, textAlign: "center", background: t.macroBg, borderRadius: 10, padding: "8px 4px" }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: m.c, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{m.v}g</div>
                <div style={{ fontSize: 9, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1.2, marginTop: 2, fontWeight: 700 }}>{m.l}</div>
              </div>
            ))}
          </div>
          {pending.source && <div style={{ fontSize: 10, color: t.textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.8 }}>Source: {pending.source}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={confirm} style={{
              flex: 1, background: t.accentGrad, border: "none", borderRadius: 10, padding: "11px",
              fontWeight: 800, fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif",
              cursor: "pointer", color: t.accentText, boxShadow: `0 4px 14px ${t.accentGlow}`,
            }}>+ Add to Log</button>
            <button onClick={dismiss} style={{
              background: t.btnSecBg, border: `1px solid ${t.btnSecBorder}`, borderRadius: 10,
              padding: "11px 14px", color: t.btnSecText, cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 600,
            }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function Dashboard({ user, onLogout, setToast, profileData }) {
  const { theme } = useTheme();
  const t = THEMES[theme];
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [meals, setMeals] = useState([]);
  const [activeDay, setActiveDay] = useState((new Date().getDay() + 6) % 7);

  const targets   = profileData?.dailyTargets || {};
  const profile   = profileData?.profile    || {};
  const goalLabel = GOALS.find(g => g.value === profile.goal)?.label || "Your Goal";
  const totals    = meals.reduce((acc, m) => ({
    calories: acc.calories + (Number(m.calories) || 0),
    protein:  acc.protein  + (Number(m.protein)  || 0),
    carbs:    acc.carbs    + (Number(m.carbs)     || 0),
    fat:      acc.fat      + (Number(m.fats)      || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const addMeal    = m  => setMeals(prev => [m, ...prev]);
  const removeMeal = id => setMeals(prev => prev.filter(m => m.id !== id));

  const handleLogout = async () => {
    setLogoutLoading(true);
    await fetch(`${API}/logout`, { method: "POST", credentials: "include" });
    setLogoutLoading(false);
    setToast({ msg: "Logged out", type: "success" });
    onLogout();
  };

  return (
    <div style={{
      width: "100%", maxWidth: 480,
      background: t.cardBg, border: `1px solid ${t.cardBorder}`,
      borderRadius: 24, boxShadow: t.cardShadow,
      fontFamily: "'Plus Jakarta Sans',sans-serif", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 24px 0" }}>
        <Brand small />
        <button onClick={handleLogout} disabled={logoutLoading} style={{
          background: "none", border: `1px solid ${t.cardBorder}`, borderRadius: 8,
          color: t.textMuted, padding: "7px 13px", fontSize: 12, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
        }}
          onMouseEnter={e => { e.currentTarget.style.color = t.accent; e.currentTarget.style.borderColor = t.accent; }}
          onMouseLeave={e => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.borderColor = t.cardBorder; }}
        >{logoutLoading ? "…" : "Sign out"}</button>
      </div>

      {/* Goal chip */}
      <div style={{ padding: "14px 24px 0" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: t.goalChipBg, border: `1px solid ${t.goalChipBorder}`, borderRadius: 99, padding: "5px 14px 5px 10px" }}>
          <span style={{ fontSize: 13 }}>{GOALS.find(g => g.value === profile.goal)?.emoji || "🎯"}</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: t.accent, textTransform: "uppercase", letterSpacing: 1 }}>{goalLabel}</span>
          <span style={{ fontSize: 11, color: t.textMuted }}>·</span>
          <span style={{ fontSize: 11, color: t.textSecondary }}>{profile.weight}kg → {profile.targetWeight || profile.weight}kg</span>
        </div>
      </div>

      {/* Week strip */}
      <div style={{ padding: "18px 24px 0" }}>
        <WeekStrip activeDay={activeDay} setActiveDay={setActiveDay} />
      </div>

      {/* Calorie ring */}
      <div style={{ display: "flex", justifyContent: "center", padding: "26px 24px 0" }}>
        <CalRing eaten={totals.calories} target={targets.calories} size={190} />
      </div>

      {/* Macro bars */}
      <div style={{ padding: "18px 24px 0", display: "flex", gap: 20 }}>
        <MacroPill label="Protein" eaten={totals.protein} target={targets.protein} color={t.accent} />
        <MacroPill label="Carbs"   eaten={totals.carbs}   target={targets.carbs}   color="#eab308" />
        <MacroPill label="Fat"     eaten={totals.fat}     target={targets.fat}     color="#ef4444" />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: t.divider, margin: "22px 24px 0" }} />

      {/* Meal search */}
      <div style={{ padding: "0 24px" }}>
        <MealSearchPanel onAdd={addMeal} setToast={setToast} />
      </div>

      {/* Meal log */}
      {meals.length > 0 && (
        <div style={{ padding: "0 24px", marginTop: 22 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: t.textMuted, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 4 }}>
            Today's Log — {meals.length} item{meals.length !== 1 ? "s" : ""}
          </div>
          {meals.map(m => <MealEntry key={m.id} meal={m} onRemove={removeMeal} />)}
        </div>
      )}

      {/* Stats footer */}
      <div style={{ padding: "22px 24px 28px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { label: "Target", value: `${targets.calories || "—"} kcal` },
          { label: "Eaten",  value: `${totals.calories} kcal` },
          { label: "BMI",    value: profile.height && profile.weight ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1) : "—" },
        ].map(item => (
          <div key={item.label} style={{ background: t.statsCardBg, border: `1px solid ${t.statsCardBorder}`, borderRadius: 14, padding: "12px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: t.statsValue, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{item.value}</div>
            <div style={{ fontSize: 9, color: t.statsLabel, marginTop: 4, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  BACKGROUND
// ─────────────────────────────────────────────────────────────────────────────
function Bg() {
  const { theme } = useTheme();
  if (theme === "light") {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "#eef5ee", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle,rgba(34,197,94,0.11) 0%,transparent 70%)", animation: "bgpulse 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(16,185,129,0.07) 0%,transparent 70%)", animation: "bgpulse 11s ease-in-out infinite 3s" }} />
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.05 }}>
          <defs><pattern id="dotsl" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="#16a34a"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dotsl)" />
        </svg>
      </div>
    );
  }
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "#111111", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "12%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.07) 0%,transparent 70%)", animation: "bgpulse 8s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "8%", right: "8%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(234,88,12,0.05) 0%,transparent 70%)", animation: "bgpulse 12s ease-in-out infinite 4s" }} />
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.025 }}>
        <defs><pattern id="dotsd" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="#f97316"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#dotsd)" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  APP ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [themeMode, setThemeModeState] = useState(() => {
    try { return localStorage.getItem("nutriai-theme") || "dark"; } catch { return "dark"; }
  });
  const [screen, setScreen]           = useState("login");
  const [toast, setToast]             = useState({ msg: "", type: "success" });
  const [user, setUser]               = useState(null);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [profileData, setProfileData] = useState(null);

  const setThemeMode = (m) => {
    setThemeModeState(m);
    try { localStorage.setItem("nutriai-theme", m); } catch {}
  };

  const t = THEMES[themeMode];
  const resetToken = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("token");
  useEffect(() => { if (resetToken) setScreen("reset-password"); }, []);

  const handleUser = async (u) => {
    setUser(u);
    try {
      const data = await apiFetch(PROFILE, "", undefined, "GET");
      if (data.success && data.user?.profile?.isOnboarded) { setProfileData(data.user); setScreen("dashboard"); }
      else setScreen("onboarding");
    } catch { setScreen("onboarding"); }
  };

  const handleOnboardingDone = (data) => {
    setProfileData({ profile: data.profile, dailyTargets: data.dailyTargets });
    setScreen("dashboard");
  };

  const isDashboard = screen === "dashboard";

  const renderScreen = () => {
    switch (screen) {
      case "signup":          return <SignupScreen onSwitch={setScreen} setToast={setToast} onVerify={e => { setVerifyEmail(e); setScreen("verify-email"); }} />;
      case "verify-email":    return <VerifyScreen email={verifyEmail} onSwitch={setScreen} setToast={setToast} setUser={handleUser} />;
      case "forgot-password": return <ForgotScreen onSwitch={setScreen} setToast={setToast} />;
      case "reset-password":  return <ResetScreen token={resetToken} onSwitch={setScreen} setToast={setToast} />;
      case "onboarding":      return <OnboardingScreen onDone={handleOnboardingDone} setToast={setToast} />;
      case "dashboard":       return <Dashboard user={user} onLogout={() => { setUser(null); setProfileData(null); setScreen("login"); }} setToast={setToast} profileData={profileData} />;
      default:                return <LoginScreen onSwitch={setScreen} onForgot={() => setScreen("forgot-password")} setToast={setToast} setUser={handleUser} />;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: themeMode, setThemeMode }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: ${t.pageBg}; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bgpulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder { color: ${t.inputPlaceholder}; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px ${t.inputBg} inset !important; -webkit-text-fill-color: ${t.inputText} !important; }
        input[type=range] { -webkit-appearance: none; height: 6px; background: ${t.macroTrack}; border-radius: 3px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: ${t.accent}; cursor: pointer; box-shadow: 0 0 0 3px ${t.cardBg}, 0 0 10px ${t.accent}55; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        ::-webkit-scrollbar { width: 4px; height: 0; }
        ::-webkit-scrollbar-thumb { background: ${t.divider}; border-radius: 2px; }
      `}</style>

      <Bg />
      <ThemeToggle />

      <div style={{
        position: "relative", zIndex: 1,
        minHeight: "100vh",
        display: "flex",
        alignItems: isDashboard ? "flex-start" : "center",
        justifyContent: "center",
        padding: isDashboard ? "24px 16px 52px" : "24px 16px",
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        animation: "fadeUp 0.4s ease",
      }}>
        {renderScreen()}
      </div>

      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "" })} />
    </ThemeContext.Provider>
  );
}
