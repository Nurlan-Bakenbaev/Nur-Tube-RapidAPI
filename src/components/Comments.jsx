import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { onAuthStateChanged } from "firebase/auth";
import auth from "./helpers/firebase";
import { postComment, watchComments } from "../services/comments";

export default function Comments({ videoId }) {
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);
  const [waiting, setWaiting] = useState(false);
  useEffect(() => {
    if (!posting) { setWaiting(false); return; }
    const timer = setTimeout(() => setWaiting(true), 8000);
    return () => clearTimeout(timer);
  }, [posting]);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    setComments([]); setText(""); setError(""); setLoadError(""); setLoading(true);
    return watchComments(videoId, (data, offline) => { setComments(data); setLoading(false); setLoadError(offline ? "Connecting to comments… Saved comments may not be up to date." : ""); }, () => {
      setLoading(false); setLoadError("Comments are unavailable right now. Please try again later.");
    });
  }, [videoId]);
  async function submit(event) {
    event.preventDefault(); setPosting(true); setError("");
    try { await postComment(videoId, text); setText(""); }
    catch { setError("Your comment wasn’t posted. Please check your connection and try again."); }
    finally { setPosting(false); }
  }
  return <section className="comments-section" aria-label="Video comments">
    <h2>{comments.length ? `${comments.length} comments` : "Comments"}</h2>
    {user ? <form onSubmit={submit} className="comment-form"><div className="avatar">{(user.displayName || user.email || "U")[0].toUpperCase()}</div><div className="comment-input"><label className="sr-only" htmlFor="comment-text">Add a comment</label><textarea id="comment-text" placeholder="Add a comment…" maxLength={2000} rows={2} value={text} onChange={e => setText(e.target.value)} disabled={posting} /><div className="comment-form-actions"><span className="muted small">{text.length}/2,000</span><button type="button" className="quiet-button" disabled={posting} onClick={() => setText("")}>Cancel</button><button className="primary-button" disabled={posting || !text.trim()}>{posting ? "Posting…" : "Comment"}</button></div>{waiting && <p role="status" className="muted">Waiting for a connection to save your comment. Keep this page open.</p>}{error && <p role="alert" className="form-error">{error}</p>}</div></form>
      : <div className="comment-signin"><div className="avatar" aria-hidden="true">◎</div><div><p>Join the conversation</p><button className="text-button" onClick={() => window.dispatchEvent(new Event("open-sign-in"))}>Sign in to add a comment</button></div></div>}
    <div aria-live="polite">{loading && <p className="muted">Loading comments…</p>}{loadError && <p role="alert" className="form-error">{loadError}</p>}{!loading && !loadError && !comments.length && <p className="muted">No comments yet. Be the first to share your thoughts.</p>}</div>
    {comments.map(comment => <article key={comment.id} className="comment"><div className="avatar">{(comment.authorName || "V")[0].toUpperCase()}</div><div><div className="comment-meta"><strong>{comment.authorName}</strong><span className="muted small">{comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Just now"}</span></div><p>{comment.text}</p></div></article>)}
  </section>;
}
Comments.propTypes = { videoId: PropTypes.string.isRequired };
