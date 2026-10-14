import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import SignIn from "./SignIn";
export default function Navbar() {
  return <header className="site-header"><Link className="site-brand" to="/" aria-label="NurTube home"><span className="brand-mark" aria-hidden="true">▶</span><span className="brand-name">NurTube</span></Link><SearchBar /><SignIn /></header>;
}
