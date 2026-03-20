import React, { useState } from "react";
import "./Contact.css";   
import { useNavigate } from "react-router-dom";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      alert(data.message);

      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      alert("Error sending message");
    }
  };

  return (
    <div className="contact-wrapper">

        <button className="back-btn" onClick={() => navigate("/")}>
        ← Back to Home
      </button>
      {/* LEFT - FORM */}
      <div className="contact-form">
        <h2>Contact Us</h2>
        <p>Have questions or need help? Reach out to us.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Write your message..."
            rows={5}
            value={form.message}
            onChange={handleChange}
            required
          />

          <button type="submit">Send Message</button>
        </form>
      </div>

      {/* RIGHT - COMPANY INFO */}
      <div className="contact-info">
        <h3>Get in Touch</h3>
        <p>We are here to help you 24/7.</p>

        <div className="info-box">
          <h4>📧 Email</h4>
          <p>kodequantum@gmail.com</p>
        </div>

        <div className="info-box">
          <h4>📍 Address</h4>
          <p>
            LocalConnect<br />
            Bengaluru, Karnataka, India
          </p>
        </div>

        <div className="info-box">
          <h4>⏰ Working Hours</h4>
          <p>Mon - Sat: 10:00 AM - 7:00 PM</p>
        </div>
      </div>
    </div>
  );
}