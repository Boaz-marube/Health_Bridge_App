import { FaFacebookF, FaYoutube, FaLinkedinIn, FaInstagram, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export function Footer() {
  return (
    <footer
      style={{
        background: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)",
        color: "#fff",
        fontFamily: "sans-serif",
        fontSize: "1rem",
        borderTop: "2px solid #45a4fa",
        marginTop: "-60px",
        paddingTop: "60px"
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Logo & Brand */}
        <div className="lg:col-span-2 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div style={{ marginRight: 18 }}>
            <div
              style={{
                width: 72,
                height: 72,
                background: "#fff",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {/* Image placeholder for logo */}
              <img
                src="/logo.jpg"
                alt="Health Bridge Logo"
                style={{ width: 58, height: 58, borderRadius: "8px", objectFit: "cover" }}
              />
            </div>
          </div>
          <div style={{ fontWeight: 700, fontSize: "1.22rem", letterSpacing: ".03em", lineHeight: 1.1 }}>
            Health<br />Bridge
          </div>
        </div>
        {/* Contact Section */}
        <div className="text-center sm:text-left">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Contact</div>
          <div className="flex items-center justify-center sm:justify-start mb-2">
            <FaEnvelope className="mr-2 text-sm" />
            <span className="text-sm">info@healthbridge.com</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start mb-2">
            <FaPhoneAlt className="mr-2 text-sm" />
            <span className="text-sm">+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start">
            <FaMapMarkerAlt className="mr-2 text-sm" />
            <span className="text-sm">123 Health St, Medical City</span>
          </div>
        </div>
        {/* QuickLinks */}
        <div className="text-center sm:text-left">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>QuickLinks</div>
          <div style={{ cursor: "pointer", transition: "color 0.2s", marginBottom: 4 }} onMouseEnter={e => e.target.style.color = "#f0f0f0"} onMouseLeave={e => e.target.style.color = "#fff"} onClick={() => window.location.href = "#home"}>Home</div>
          <div style={{ cursor: "pointer", transition: "color 0.2s", marginBottom: 4 }} onMouseEnter={e => e.target.style.color = "#f0f0f0"} onMouseLeave={e => e.target.style.color = "#fff"} onClick={() => window.location.href = "#about"}>About Us</div>
          <div style={{ cursor: "pointer", transition: "color 0.2s", marginBottom: 4 }} onMouseEnter={e => e.target.style.color = "#f0f0f0"} onMouseLeave={e => e.target.style.color = "#fff"} onClick={() => window.location.href = "#doctors"}>Our doctors</div>
          <div style={{ cursor: "pointer", transition: "color 0.2s", marginBottom: 4 }} onMouseEnter={e => e.target.style.color = "#f0f0f0"} onMouseLeave={e => e.target.style.color = "#fff"} onClick={() => window.location.href = "#testimonials"}>Testimonials</div>
          <div style={{ cursor: "pointer", transition: "color 0.2s", marginBottom: 4 }} onMouseEnter={e => e.target.style.color = "#f0f0f0"} onMouseLeave={e => e.target.style.color = "#fff"} onClick={() => alert('Wellness Tips - Coming Soon!')}>Wellness Tips</div>
          <div style={{ cursor: "pointer", transition: "color 0.2s", marginBottom: 4 }} onMouseEnter={e => e.target.style.color = "#f0f0f0"} onMouseLeave={e => e.target.style.color = "#fff"} onClick={() => alert('Contact Us - Coming Soon!')}>Contact Us</div>
        </div>
        {/* Support & Resources */}
        <div className="text-center sm:text-left">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Support &<br />Resources</div>
          <div style={{ cursor: "pointer", transition: "color 0.2s", marginBottom: 4 }} onMouseEnter={e => e.target.style.color = "#f0f0f0"} onMouseLeave={e => e.target.style.color = "#fff"} onClick={() => alert('FAQs - Coming Soon!')}>FAQs</div>
          <div style={{ cursor: "pointer", transition: "color 0.2s", marginBottom: 4 }} onMouseEnter={e => e.target.style.color = "#f0f0f0"} onMouseLeave={e => e.target.style.color = "#fff"} onClick={() => alert('Privacy Policy - Coming Soon!')}>Privacy Policy</div>
          <div style={{ cursor: "pointer", transition: "color 0.2s", marginBottom: 4 }} onMouseEnter={e => e.target.style.color = "#f0f0f0"} onMouseLeave={e => e.target.style.color = "#fff"} onClick={() => alert('Terms & Conditions - Coming Soon!')}>Terms & Conditions</div>
          <div style={{ cursor: "pointer", transition: "color 0.2s", marginBottom: 4 }} onMouseEnter={e => e.target.style.color = "#f0f0f0"} onMouseLeave={e => e.target.style.color = "#fff"} onClick={() => alert('Help Center - Coming Soon!')}>Help Center</div>
        </div>
        {/* Social Media */}
        <div className="lg:col-span-5 text-center lg:text-right">
          <div className="flex gap-3 justify-center lg:justify-end mb-4">
            <a href="https://facebook.com/healthbridge" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", background: "#3870FF", borderRadius: "50%", width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, transition: "transform 0.2s" }} onMouseEnter={e => e.target.style.transform = "scale(1.1)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>
              <FaFacebookF />
            </a>
            <a href="https://youtube.com/@healthbridge" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", background: "#ff3b2f", borderRadius: "50%", width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, transition: "transform 0.2s" }} onMouseEnter={e => e.target.style.transform = "scale(1.1)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>
              <FaYoutube />
            </a>
            <a href="https://twitter.com/healthbridge" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", background: "#222", borderRadius: "50%", width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, transition: "transform 0.2s" }} onMouseEnter={e => e.target.style.transform = "scale(1.1)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>
              <FaXTwitter />
            </a>
            <a href="https://linkedin.com/company/healthbridge" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", background: "#0a66c2", borderRadius: "50%", width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, transition: "transform 0.2s" }} onMouseEnter={e => e.target.style.transform = "scale(1.1)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>
              <FaLinkedinIn />
            </a>
            <a href="https://instagram.com/healthbridge" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", background: "linear-gradient(135deg,#fdc468 0%,#df4996 100%)", borderRadius: "50%", width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, transition: "transform 0.2s" }} onMouseEnter={e => e.target.style.transform = "scale(1.1)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
      <div
        style={{
          borderTop: "1px solid #45a4fa",
          padding: "20px 0",
          textAlign: "left",
          color: "#f8f8f8",
          fontSize: "0.97rem",
          maxWidth: 1100,
          margin: "0 auto",
          opacity: 0.87,
          letterSpacing: "0.01em",
        }}
      >
        ©2025 Health Bridge  All Rights Reserved.
      </div>
    </footer>
  );
}