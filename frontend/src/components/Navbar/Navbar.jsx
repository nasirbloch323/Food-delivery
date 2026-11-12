import React, { useContext, useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/frontend_assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    toast.success("Logged out successfully");
    navigate("/");
  };
  return (
    <header className="navbar">
      <Link to="/" className="brand-mark" aria-label="Mesa home"><span className="brand-symbol">M</span><span>MESA<span className="brand-period">.</span><small>FOOD, MADE GOOD</small></span></Link>
      <nav className="navbar-menu">
        <Link to="/" onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>Home</Link>
        <a href="#explore-menu" onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>Our menu</a>
        <a href="#app-download" onClick={() => setMenu("mobile-app")} className={menu === "mobile-app" ? "active" : ""}>Our story</a>
        <a href="#footer" onClick={() => setMenu("contact-us")} className={menu === "contact-us" ? "active" : ""}>Contact</a>
      </nav>
      <div className="navbar-right">
        <div className="navbar-search-icon"><Link to="/cart"><img src={assets.basket_icon} alt="Shopping basket" /></Link>{getTotalCartAmount() > 0 && <span className="dot" />}</div>
        {!token ? <button className="nav-signin" onClick={() => setShowLogin(true)}>Sign in <span>↗</span></button> : <div className="navbar-profile"><img src={assets.profile_icon} alt="Profile" /><ul className="nav-profile-dropdown"><li onClick={() => navigate("/myorders")}><img src={assets.bag_icon} alt="" /><p>My orders</p></li><hr /><li onClick={logout}><img src={assets.logout_icon} alt="" /><p>Log out</p></li></ul></div>}
      </div>
    </header>
  );
};
export default Navbar;