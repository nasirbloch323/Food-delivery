import React, { useContext } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
  const navigate = useNavigate();
  const { token, admin, setAdmin, setToken } = useContext(StoreContext);
  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("admin"); setToken(""); setAdmin(false); toast.success("Logged out"); navigate("/"); };
  return <header className="navbar"><div className="admin-brand"><span>M</span><div>MESA<small>OPERATIONS CONSOLE</small></div></div><div className="admin-nav-right"><span className="admin-live"><i/> SYSTEM ONLINE</span><button className="login-conditon" onClick={token && admin ? logout : () => navigate("/")}>{token && admin ? "Log out" : "Admin login"}</button><img className="profile" src={assets.profile_image} alt="Admin profile"/></div></header>;
};
export default Navbar;