import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import "../css/ContactUs.css";

function ContactUs() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendEmail = async (e) => {
    e.preventDefault();
    setIsSending(true);

  

    const templateParams = {
      fullName,
      phone,
      email,
      message,
    };

    try {
      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      console.log("Email Sent:", response);
      alert("Message Sent Successfully!");

      setFullName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (error) {
      console.error("EmailJS Error:", error);
      alert("Failed to send message");
    } finally {
      // no matter if it was successful or not set sending back to false
      setIsSending(false);
    }
  };

  return (
    <div className="contactUs-container">
      <div className="contactUs-content">
        <div className="contactUs-left-side">
          <div className="contactUs-texts">
            <h2>Contact Us!</h2>
            <p>
              At <span>SpeedAI</span>, we prioritize exceptional customer service.
              Whether you're curious about a particular model, want to arrange a
              visit to our showroom, or need details about our offerings, our
              dedicated team is here to assist you every step of the way.
            </p>
          </div>

          <div className="contactUs-form">
            <h4>1. Contact Information</h4>
            <form onSubmit={sendEmail}>
              <div className="form-group">
                <label>Full Name*</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="contactUs-input-style"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="phone-email-container">
                <div className="form-group">
                  <label>Phone*</label>
                  <input
                    type="tel"
                    placeholder="Enter your phone"
                    className="contactUs-input-style"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>E-mail*</label>
                  <input
                    type="email"
                    placeholder="Enter your Email"
                    className="contactUs-input-style"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Your Message</label>
                <textarea
                  value={message}
                  rows="4"
                  placeholder="Write any other information related to your request."
                  className="contactUs-textArea"
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <button className="message-submit" type="submit" disabled={isSending}>
                {isSending ? "Sending..." : "SEND"}
              </button>
            </form>
          </div>
        </div>

        <div className="contactUs-right-side">
          <div className="contactUs-image-container">
            <img src="/images/contact-us-image.jpg" alt="contact-us" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
