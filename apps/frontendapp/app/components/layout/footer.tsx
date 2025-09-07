import { FaFacebookF, FaYoutube, FaXTwitter, FaLinkedinIn, FaInstagram, FaGooglePlay, FaApple } from "react-icons/fa6";

export function Footer() {
  return (
    <footer
      style={{
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "sans-serif",
        padding: "0",
        fontSize: "1rem",
        marginTop: "-40px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          maxWidth: 1180,
          margin: "0 auto",
          padding: "38px 0 24px 0",
        }}
      >
        {/* Menu */}
        <div style={{ minWidth: 160, marginBottom: 18 }}>
          <div style={{ color: "#3870FF", fontWeight: 700, marginBottom: 12, fontSize: "1.08rem" }}>Menu</div>
          <div style={{ lineHeight: 2.12 }}>
            <div>Home</div>
            <div>About Us</div>
            <div>Clinics</div>
            <div>Medical Services</div>
            <div>Dental Services</div>
            <div>Mobile Services</div>
            <div>Our Doctors</div>
            <div>Offers</div>
            <div>Contact Us</div>
          </div>
        </div>
        {/* Useful Links */}
        <div style={{ minWidth: 200, marginBottom: 18 }}>
          <div style={{ color: "#3870FF", fontWeight: 700, marginBottom: 12, fontSize: "1.08rem" }}>Useful Links</div>
          <div style={{ lineHeight: 2.12 }}>
            <div>Health Tips</div>
            <div>FAQs</div>
            <div>Insurance Information</div>
            <div>Patient Resources</div>
            <div>Testimonials</div>
            <div>Careers</div>
            <div>Laboratory</div>
            <div>Terms & Conditions</div>
            <div>Privacy Policy</div>
            <div>Refund & Cancellation Policy</div>
          </div>
        </div>
        {/* Get to Know Us */}
        <div style={{ minWidth: 220, marginBottom: 18 }}>
          <div style={{ color: "#3870FF", fontWeight: 700, marginBottom: 12, fontSize: "1.08rem" }}>Get to Know Us</div>
          <div style={{ lineHeight: 2.12 }}>
            <div>Telehealth Services</div>
            <div>Events</div>
            <div>Wellness Programs</div>
            <div>Accessibility Statement</div>
            <div>Events</div>
            <div>Wellness Programs</div>
            <div>Online Bill Pay</div>
            <div>Accessibility Statement</div>
          </div>
        </div>
        {/* Connect With Us & Download the App */}
        <div style={{ minWidth: 240, marginBottom: 18 }}>
          <div style={{ color: "#3870FF", fontWeight: 700, marginBottom: 12, fontSize: "1.08rem" }}>Connect With Us</div>
          <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
            <a href="#" style={{ color: "#3870FF", background: "#fff", borderRadius: "50%", width: 34, height: 34, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 21 }}>
              <FaFacebookF />
            </a>
            <a href="#" style={{ color: "#3870FF", background: "#fff", borderRadius: "50%", width: 34, height: 34, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 21 }}>
              <FaYoutube />
            </a>
            <a href="#" style={{ color: "#3870FF", background: "#fff", borderRadius: "50%", width: 34, height: 34, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 21 }}>
              <FaXTwitter />
            </a>
            <a href="#" style={{ color: "#3870FF", background: "#fff", borderRadius: "50%", width: 34, height: 34, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 21 }}>
              <FaLinkedinIn />
            </a>
            <a href="#" style={{ color: "#3870FF", background: "#fff", borderRadius: "50%", width: 34, height: 34, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 21 }}>
              <FaInstagram />
            </a>
          </div>
          <div style={{ color: "#3870FF", fontWeight: 700, marginBottom: 10, fontSize: "1.08rem" }}>Download the App</div>
          <div style={{ display: "flex", gap: 14 }}>
            <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#3870FF", padding: "8px 16px", borderRadius: 8, textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>
              <FaGooglePlay size={20} />
              Google Play
            </a>
            <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#3870FF", padding: "8px 16px", borderRadius: 8, textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>
              <FaApple size={20} />
              App Store
            </a>
          </div>
        </div>
      </div>
      <div
        style={{
          borderTop: "1.5px solid #222",
          padding: "15px 0",
          textAlign: "left",
          color: "#ccc",
          fontSize: "0.98rem",
          maxWidth: 1180,
          margin: "0 auto",
          letterSpacing: "0.02em",
        }}
      >
        ©2025 Health Bridge  All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;