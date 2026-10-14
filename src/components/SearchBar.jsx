import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
export default function SearchBar() {
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  return <form className="search-form" onSubmit={e => { e.preventDefault(); if (term.trim()) navigate(`/search/${encodeURIComponent(term.trim())}`); }}><input aria-label="Search videos" placeholder="Search videos" value={term} onChange={e => setTerm(e.target.value)} /><button aria-label="Search" type="submit"><SearchIcon /></button></form>;
}
