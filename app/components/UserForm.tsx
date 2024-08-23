import React from "react";

export default function UserForm({ user }) {
  return (
    <>
      <div>
        <label>
          Email:
          <input type="email" name="email" defaultValue={user?.email} required />
        </label>
      </div>
      <div>
        <label>
          Password:
          <input type="password" name="password" required />
        </label>
      </div>
      <div>
        <label>
          Username:
          <input type="text" name="username" defaultValue={user?.username} required />
        </label>
      </div>
    </>
  );
}
