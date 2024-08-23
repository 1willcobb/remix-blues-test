import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Outlet } from "@remix-run/react";
import { getBlogs } from "~/models/blog.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
  const blogs = await getBlogs(page, pageSize);

  const hasNextPage = blogs.length > pageSize;

  return { blogs: hasNextPage ? blogs.slice(0, pageSize) : blogs, page, hasNextPage };
};

export default function Blog() {
  const { blogs, page, hasNextPage } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Blog</h1>
      <ul>
        {blogs.map((blog) => (
          <li key={blog.id}>
            <h2>{blog.title}</h2>
            <p>{blog.content}</p>
            <Link to={`/blog/${blog.id}`}>Read More</Link>
          </li>
        ))}
      </ul>
      <div>
        {page > 1 && (
          <Link to={`?page=${page - 1}`} className="button">
            Previous
          </Link>
        )}
        {hasNextPage && (
          <Link to={`?page=${page + 1}`} className="button">
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
