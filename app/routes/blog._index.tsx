import type { ActionFunctionArgs } from "@remix-run/node";
import { useRouteLoaderData, Link, useFetcher } from "@remix-run/react";

import dune from "~/images/dunes.jpg";
import { getUser } from "~/session.server";
import { deleteBlog } from "~/models/blog.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const blogId = formData.get("blogId");
  const deleteFlag = formData.get("delete");
  const user = await getUser(request);

  console.log(user);
  console.log(deleteFlag);
  console.log(blogId);

  if (deleteFlag && user.role === "SUPERADMIN") {
    await deleteBlog(blogId);
  }

  return null;
};

export default function Blog() {
  const { blogs, page, hasNextPage, user } = useRouteLoaderData(`routes/blog`);
  const fetcher = useFetcher();

  return (
    <div>
      <ul className="flex flex-col">
        {blogs.map((blog) => (
          <li
            className="card bg-base-100 w-96 shadow-xl"
            key={blog.id}
          >
            <figure>
              <img src={blog.titleImage || dune} alt={blog.title} />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{blog.title}</h2>
              <p>{blog.subtitle}</p>
              <div className="card-actions justify-end">
                <Link to={`/blog/${blog.id}`} className="btn btn-primary">
                  Read More
                </Link>
              </div>
              {user.role === "SUPERADMIN" ? (
                <fetcher.Form method="post">
                  <input type="hidden" name="blogId" value={blog.id} />
                  <input type="hidden" name="delete" value="delete" />
                  <button type="submit" className="btn btn-warning btn-sm">
                    Delete
                  </button>
                </fetcher.Form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      <div>
        {page > 1 ? (
          <Link to={`?page=${page - 1}`} className="button">
            Previous
          </Link>
        ) : null}
        {hasNextPage ? (
          <Link to={`?page=${page + 1}`} className="button">
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}
