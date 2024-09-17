import { Outlet } from "@remix-run/react";

export default function Blogp() {
  return (
    <div className="w-full px-4 max-w-2xl flex flex-col">
      <h1 className="absolute top-[55px] text-2xl font-extrabold">Blog</h1>
      <div className="prose max-w-xlg p-4 ">
        <Outlet />
      </div>
    </div>
  );
}
