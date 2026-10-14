import { useState, useEffect } from "react";
import SideBar from "./SideBar";
import Videos from "./Videos";
import { fetchFromAPI } from "./helpers/fetchFromAPI";

export default function Feed() {
  const [selectedCategory, setSelectedCategory] = useState("New");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true); setVideos([]);
    fetchFromAPI(`search?part=snippet&q=${encodeURIComponent(selectedCategory)}`)
      .then(data => { if (active) setVideos(data.items || []); })
      .catch(() => { if (active) setVideos([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedCategory]);
  return <main className="feed-layout"><SideBar selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} /><section className="feed-content"><p className="feed-eyebrow">EXPLORE NURTUBE</p><h1>{selectedCategory === "New" ? "Discover something new" : `${selectedCategory} videos`}</h1><p className="muted feed-subtitle">Find your next favorite. Share your thoughts.</p>{loading ? <p role="status" className="muted">Loading videos…</p> : videos.length ? <Videos videos={videos} /> : <div className="feed-empty"><span className="brand-mark" aria-hidden="true">▶</span><h2>No videos to show right now</h2><p className="muted">Try another category or come back later.</p></div>}</section></main>;
}
