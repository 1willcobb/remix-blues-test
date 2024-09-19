import { cssBundleHref } from "@remix-run/css-bundle";

import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

// import TempNav from "~/components/TempNav";

import { getUser } from "~/session.server";

import styles from "./globals.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "icon", href: "/favicon.ico" },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const meta: MetaFunction = () => {
  return [
    {
      title: "MyFilmFriends",
      viewport: "width=device-width,initial-scale=1",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "apple-mobile-web-app-title": "MyFilmFriends",
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  return { user };
};

export default function App() {
  return (
    <html lang="en" className="h-full" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="icon" href="/_static/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="mask-icon" href="/_static/favicon.ico" color="#000000" />
        <link
          rel="apple-touch-startup-image"
          href="/_static/images/dunes.jpg"
        />

        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
