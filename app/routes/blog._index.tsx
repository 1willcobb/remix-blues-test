import { useRouteLoaderData, Link } from "@remix-run/react";

export default function Blog() {
  const { blogs, page, hasNextPage } = useRouteLoaderData(`routes/blog`);

  return (
    <div>
      <ul className="flex flex-col">
        {blogs.map((blog) => (
          <li className="card bg-base-100 w-96 shadow-xl" key={blog.id}>
            <figure>
              <img
                src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                alt="Shoes"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{blog.title}</h2>
              <p>{blog.subtitle}</p>
              <div className="card-actions justify-end">
                <Link to={`/blog/${blog.id}`} className="btn btn-primary">
                  Read More
                </Link>
              </div>
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
