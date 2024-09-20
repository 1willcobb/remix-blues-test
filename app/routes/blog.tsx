import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Outlet } from "@remix-run/react";
import { getBlogs } from "~/models/blog.server";

import Header from "~/components/Header";
import ControlBar from "~/components/ControlBar";
import { getUser } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);

  console.log(user);
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
  const blogs = await getBlogs(page, pageSize);

  const hasNextPage = blogs.length > pageSize;

  return {
    user,
    blogs: hasNextPage ? blogs.slice(0, pageSize) : blogs,
    page,
    hasNextPage,
  };
};

export default function Blog() {
  const { user } = useLoaderData();

  console.log(user);

  return (
    <main className="flex flex-col min-h-screen">
      <Header friendUsername={null} />
      {user.role === "SUPERADMIN" ? (
        <div className="flex justify-between gap-8 items-center mx-auto">
          <h2>Admin Controls</h2>
          <Link to="create" className="btn btn-primary btn-sm ">
            Create Blog
          </Link>
        </div>
      ) : null}
      <section className="flex flex-grow flex-col justify-center items-center">
        <Outlet />
      </section>
      <ControlBar />
    </main>
  );
}
