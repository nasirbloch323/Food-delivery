import React from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes } from "react-router-dom";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login/Login";
const App = () => {
  const url = import.meta.env.VITE_API_URL || "";
  return <div className="admin-shell"><ToastContainer/><Navbar/><div className="app-content"><Sidebar/><main className="admin-main"><div className="admin-page-heading"><span>GOOD FOOD. WELL MANAGED.</span><h1>Operations overview</h1></div><Routes><Route path="/" element={<Login url={url}/>}/><Route path="/add" element={<Add url={url}/>}/><Route path="/list" element={<List url={url}/>}/><Route path="/orders" element={<Orders url={url}/>}/></Routes></main></div></div>;
};
export default App;