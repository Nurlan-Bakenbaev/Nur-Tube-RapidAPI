import PropTypes from "prop-types";
import { categories } from "./helpers/constants";
export default function SideBar({selectedCategory, setSelectedCategory}) {
  return <nav className="category-nav" aria-label="Video categories">{categories.map(category => <button key={category.name} className={category.name === selectedCategory ? "selected" : ""} aria-pressed={category.name === selectedCategory} onClick={() => setSelectedCategory(category.name)}><span aria-hidden="true">{category.icon}</span><span>{category.name}</span></button>)}</nav>;
}
SideBar.propTypes = { selectedCategory: PropTypes.string.isRequired, setSelectedCategory: PropTypes.func.isRequired };
