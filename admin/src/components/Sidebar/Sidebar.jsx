import React from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";
const Sidebar = () => <aside className="sidebar"><p className="sidebar-label">WORKSPACE</p><div className="sidebar-options"><NavLink to="add" className="sidebar-option"><img src={assets.add_icon} alt=""/><p>Add menu item</p><span>＋</span></NavLink><NavLink to="list" className="sidebar-option"><img src={assets.order_icon} alt=""/><p>Menu inventory</p><span>→</span></NavLink><NavLink to="orders" className="sidebar-option"><img src={assets.order_icon} alt=""/><p>Customer orders</p><span>→</span></NavLink></div><div className="sidebar-help"><b>MESA GUIDE</b><p>Keep your menu fresh and every order moving.</p></div></aside>;
export default Sidebar;