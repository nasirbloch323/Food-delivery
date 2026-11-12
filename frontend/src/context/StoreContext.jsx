import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
export const StoreContext = createContext(null);
const StoreContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const url = import.meta.env.VITE_API_URL || "";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const addToCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    if (token) { const response = await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } }); response.data.success ? toast.success("Item added to basket") : toast.error("Could not update basket"); }
  };
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: Math.max((prev[itemId] || 0) - 1, 0) }));
    if (token) { const response = await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } }); response.data.success ? toast.success("Item removed from basket") : toast.error("Could not update basket"); }
  };
  const getTotalCartAmount = () => Object.entries(cartItems).reduce((total, [id, quantity]) => { const product = food_list.find((item) => item._id === id); return total + (product ? product.price * quantity : 0); }, 0);
  const fetchFoodList = async () => { const response = await axios.get(url + "/api/food/list"); if (response.data.success) setFoodList(response.data.data); else toast.error("Unable to load menu"); };
  const loadCardData = async (currentToken) => { const response = await axios.post(url + "/api/cart/get", {}, { headers: { token: currentToken } }); setCartItems(response.data.cartData || {}); };
  useEffect(() => { async function loadData() { try { await fetchFoodList(); const savedToken = localStorage.getItem("token"); if (savedToken) { setToken(savedToken); await loadCardData(savedToken); } } catch { toast.error("Could not connect to the food service"); } } loadData(); }, []);
  const contextValue = { food_list, cartItems, setCartItems, addToCart, removeFromCart, getTotalCartAmount, url, token, setToken };
  return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>;
};
export default StoreContextProvider;