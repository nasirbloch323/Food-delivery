import React from "react";
import "./Header.css";
const Header = () => (
  <section className="header">
    <div className="hero-copy">
      <span className="hero-eyebrow"><i /> FRESHLY PREPARED · DELIVERED WITH CARE</span>
      <h1>Good food.<br/><em>Good mood.</em><br/>Every day.</h1>
      <p>Thoughtful ingredients, bold flavours and feel-good favourites — made fresh and brought straight to your door.</p>
      <a className="hero-cta" href="#explore-menu">Explore the menu <span>↗</span></a>
      <div className="hero-proof"><div className="proof-avatars"><b>F</b><b>+</b><b>♥</b></div><span><strong>Fresh choices, happy people</strong><small>Your next favourite meal is waiting</small></span></div>
    </div>
    <div className="hero-stamp"><span>MADE FRESH</span><b>✳</b><span>JUST FOR YOU</span></div>
    <div className="hero-bottom-note"><span>01 / FRESH FOOD</span><span>GOODNESS IN EVERY BITE</span></div>
  </section>
);
export default Header;