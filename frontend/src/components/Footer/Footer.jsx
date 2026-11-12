import React from "react";
import "./Footer.css";
const Footer = () => (
  <footer className="footer" id="footer">
    <div className="footer-content">
      <div className="footer-content-left"><div className="footer-brand"><span>M</span> MESA.</div><p>Good food brings people together. We make it easier to enjoy the dishes you love, prepared fresh and delivered with care.</p><div className="footer-social-icons"><span>f</span><span>◎</span><span>in</span></div></div>
      <div className="footer-content-center"><h2>Explore</h2><ul><li><a href="/">Home</a></li><li><a href="/#explore-menu">Our menu</a></li><li><a href="/cart">Your basket</a></li><li><a href="/myorders">Track orders</a></li></ul></div>
      <div className="footer-content-right"><h2>Say hello</h2><ul><li>Fresh food, delivered daily</li><li>hello@mesa.food</li><li>Open every day · 10am–11pm</li></ul></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} MESA FOOD CO.</span><span>MADE FRESH. SHARED WITH LOVE.</span></div>
  </footer>
);
export default Footer;