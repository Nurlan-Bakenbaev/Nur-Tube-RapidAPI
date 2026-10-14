import { useEffect, useRef, useState } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import auth from "./helpers/firebase";

export default function SignIn() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef(null);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    const open = () => { setError(""); dialog.current?.showModal(); };
    window.addEventListener("open-sign-in", open);
    return () => window.removeEventListener("open-sign-in", open);
  }, []);
  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      await (mode === "signin" ? signInWithEmailAndPassword : createUserWithEmailAndPassword)(auth, email.trim(), password);
      setPassword(""); dialog.current.close();
    } catch (err) {
      const messages = {
        "auth/invalid-credential": "Your email or password is incorrect.",
        "auth/wrong-password": "Your email or password is incorrect.",
        "auth/user-not-found": "Your email or password is incorrect.",
        "auth/email-already-in-use": "An account already exists with this email. Try signing in.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/network-request-failed": "Unable to connect. Check your connection and try again.",
      };
      setError(messages[err.code] || "Unable to continue. Please check your details and try again.");
    } finally { setBusy(false); }
  }
  async function logout() {
    try { await signOut(auth); localStorage.removeItem("user"); }
    catch { setError("Unable to sign out. Please try again."); }
  }
  return <>
    {user ? <div className="account-actions"><Link to="/mychannel" className="avatar" aria-label="My channel">{(user.email || "U")[0].toUpperCase()}</Link><button className="quiet-button" onClick={logout}>Sign out</button>{error && <span role="alert">{error}</span>}</div>
      : <button className="sign-in-button" onClick={() => { setError(""); dialog.current.showModal(); }}><span aria-hidden="true">◎</span> Sign in</button>}
    <dialog ref={dialog} className="auth-dialog" onClick={e => { if (e.target === dialog.current && !busy) dialog.current.close(); }} onCancel={e => { if (busy) e.preventDefault(); }}>
      <button className="close-dialog" aria-label="Close sign in" disabled={busy} onClick={() => dialog.current.close()}>×</button>
      <div className="brand-mark" aria-hidden="true">▶</div><h1>{mode === "signin" ? "Sign in" : "Create your account"}</h1>
      <p className="muted">{mode === "signin" ? "Continue to NurTube. Join the conversation." : "Your next favorite video is waiting."}</p>
      <form onSubmit={submit}>
        <label htmlFor="auth-email">Email address</label><input id="auth-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={busy} />
        <label htmlFor="auth-password">Password</label><input id="auth-password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={mode === "signup" ? 6 : undefined} required value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />
        {mode === "signup" && <p className="muted small">Use at least 6 characters.</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="auth-footer"><button type="button" className="text-button" disabled={busy} onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}>{mode === "signin" ? "Create account" : "Sign in instead"}</button><button className="primary-button" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button></div>
      </form>
    </dialog>
  </>;
}
