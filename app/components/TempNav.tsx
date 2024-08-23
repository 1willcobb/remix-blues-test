import { Form, useNavigate } from "@remix-run/react";
import React from "react";

const location = [
  { to: "/admin", name: "Admin" },
  { to: "/explore/comingsoon", name: "coming soon page" },
  { to: "/1willcobb", name: "Friend Home Page" },
  { to: "/1willcobb/featured", name: "Featured" },
  { to: "/1willcobb/message", name: "Message" },
  { to: "/1willcobb/following", name: "Following" },
  { to: "/1willcobb/followers", name: "Followers" },
  { to: "/me/1", name: "user account" },
  { to: "/me/1/messages", name: "user messages" },
  { to: "/me/1/payments", name: "user payments" },
  { to: "/me/1/settings", name: "user settings" },
  { to: "/me/1/upload", name: "user upload" },
  { to: "/friends", name: "main feed" },
  { to: "/explore", name: "explore main" },
  { to: "/explore/all-time", name: "explore all-time" },
  { to: "/explore/monthly", name: "explore month" },
  { to: "/explore/featured", name: "explore featured" },
];

export default function TempNav() {
  const navigate = useNavigate();
  const [selectedValue, setSelectedValue] = React.useState("");

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedValue(value);
    navigate(value);
  };

  return (
    <div className="flex align-middle gap-1 h-6 border border-brown-100 sm:flex sm:justify-end fixed top-14 left-0 right-0 bg-slate-100 z-50">
      <select
        value={selectedValue}
        onChange={handleChange}
        className="btn btn-neutral"
      >
        <option value="" disabled className="p-0"> 
          page
        </option>
        {location.map((link) => (
          <option key={link.to} value={link.to}>
            {link.name}
          </option>
        ))}
      </select>
      <Form action="/logout" method="post" className="h-4">
        <button type="submit"  className="btn btn-neutral">
          Logout
        </button>
      </Form>
    </div>
  );
}
