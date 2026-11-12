import React from "react";
import "./Header.css";

const Header = () => (
  <section className="header">
    <div className="hero-content">
      <div className="hero-copy">
        <span className="hero-eyebrow"><i /> THE MESA KITCHEN · FRESH EVERY DAY</span>
        <h1>Crave it.<br /><em>Love it.</em><br />Get it.</h1>
        <p>From comfort-food classics to fresh new favourites, discover meals made with care and delivered straight to your door.</p>
        <div className="hero-actions">
          <a className="hero-cta" href="#food-display">Explore the menu <span>↗</span></a>
          <span className="hero-delivery-note"><b>●</b> Freshly prepared, always</span>
        </div>
        <div className="hero-proof">
          <div className="proof-avatars"><b>F</b><b>+</b><b>♥</b></div>
          <span><strong>Your next favourite is here</strong><small>Good food. Good mood. Every single time.</small></span>
        </div>
      </div>
      <div className="hero-visual-note">
        <span className="visual-note-icon">✳</span>
        <span><strong>Made fresh</strong><small>Just for you</small></span>
      </div>
      <div className="hero-order-card">
        <span className="order-card-kicker">A LITTLE SOMETHING GOOD</span>
        <strong>Big flavour.<br />Zero fuss.</strong>
        <a href="#food-display">Find your meal <span>↗</span></a>
      </div>
    </div>
    <div className="hero-bottom-note"><span>01 / FRESH FOOD</span><span>GOODNESS IN EVERY BITE</span></div>
  </section>
);

export default Header;