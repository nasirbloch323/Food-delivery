import React from "react";
import "./AppDownload.css";
import { assets } from "../../assets/frontend_assets/assets";
const AppDownload = () => (
  <section className="app-download" id="app-download">
    <p>Good food is closer<br/>than you think.</p>
    <div className="app-download-platforms">
      <img src={assets.play_store} alt="Get it on Google Play"/>
      <img src={assets.app_store} alt="Download on the App Store"/>
    </div>
  </section>
);
export default AppDownload;
