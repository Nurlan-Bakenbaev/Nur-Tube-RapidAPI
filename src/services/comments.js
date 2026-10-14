import { addDoc, collection, getFirestore, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import auth from "../components/helpers/firebase";

const db = getFirestore(auth.app);
const commentsFor = videoId => collection(db, "videos", videoId, "comments");
export function watchComments(videoId, onChange, onError) {
  return onSnapshot(query(commentsFor(videoId), orderBy("createdAt", "desc")), { includeMetadataChanges: true }, snapshot => {
    onChange(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })), snapshot.metadata?.fromCache === true);
  }, onError);
}
export async function postComment(videoId, text) {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in to add a comment.");
  const body = text.trim();
  if (!body || body.length > 2000) throw new Error("Comments must be between 1 and 2,000 characters.");
  return addDoc(commentsFor(videoId), {
    text: body, authorId: user.uid,
    authorName: user.displayName || user.email?.split("@")[0] || "Viewer",
    createdAt: serverTimestamp(),
  });
}
