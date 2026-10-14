import { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { Link, useParams } from "react-router-dom";
import { fetchFromAPI } from "../services/videoApi";
import Videos from "./Videos";
import Comments from "./Comments";

export default function VideoDetails() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let active = true;
    setVideo(null); setRelated([]); setStatus("loading");
    fetchFromAPI(`videos?part=snippet,statistics&id=${encodeURIComponent(id)}`).then(data => {
      if (active) { setVideo(data.items?.[0] || null); setStatus(data.items?.[0] ? "ready" : "unavailable"); }
    }).catch(() => { if (active) setStatus("unavailable"); });
    fetchFromAPI(`search?part=snippet&relatedToVideoId=${encodeURIComponent(id)}&type=video`).then(data => {
      if (active) setRelated(data.items || []);
    }).catch(() => {});
    return () => { active = false; };
  }, [id]);
  return <main className="watch-layout"><div className="watch-main"><div className="video-player"><ReactPlayer url={`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`} controls width="100%" height="100%" /></div>
    <h1 className="video-title">{video?.snippet?.title || "Watch video"}</h1>
    {video ? <><div className="video-channel"><Link to={`/channel/${video.snippet.channelId}`} className="channel-link"><span className="avatar">{video.snippet.channelTitle?.[0]}</span><strong>{video.snippet.channelTitle}</strong></Link><span className="video-likes">♡ {Number(video.statistics?.likeCount || 0).toLocaleString()} likes</span></div><div className="video-description"><strong>{Number(video.statistics?.viewCount || 0).toLocaleString()} views</strong><p>{video.snippet.description}</p></div></>
      : <p className="muted video-description">{status === "loading" ? "Loading video details…" : "Video details are unavailable. You can still watch and join the conversation below."}</p>}
    <Comments key={id} videoId={id} /></div><aside className="related-videos" aria-label="Related videos"><h2>Up next</h2>{related.length ? <Videos videos={related} direction="column" /> : <p className="muted">Related videos are unavailable.</p>}</aside></main>;
}
