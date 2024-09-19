import { useMatches } from "@remix-run/react";
import { useMemo } from "react";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


import type { User } from "~/models/user.server";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string,
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id],
  );
  return route?.data as Record<string, unknown>;
}

function isUser(user: unknown): user is User {
  return (
    user != null &&
    typeof user === "object" &&
    "email" in user &&
    typeof user.email === "string"
  );
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.",
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}


export function extractUserIdFromFullId(userId: string): number {
  if(userId === null) return 0;
  console.log(userId)
  return parseInt(userId.split("#")[1], 10);
}

export function extractIdfromFullId(id: string): string {
  if(id === null) return 0;
  return id.split("#")[1]
}

export function dateConverter(createdAt: string) {
  try {
    // Convert the string to a Date object
    const date = new Date(createdAt);

    // Check if the conversion was successful (valid date)
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date format");
    }

    // Format the date as 'Month day, year' (e.g., August 22, 2024)
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: '2-digit',
    };

    const formattedDate = date.toLocaleDateString('en-US', options);

    return formattedDate;
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

export function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

export const formatMessageTime = (dateString) => {
  const messageDate = new Date(dateString);
  const now = new Date();

  const timeDifference = now.getTime() - messageDate.getTime();
  const oneHourInMs = 60 * 60 * 1000; // Number of milliseconds in one hour

  if (timeDifference < oneHourInMs) {
    // If the message is less than 1 hour old, do not display time
    return null;
  }
  const oneWeekInMs = 7 * 24 * 60 * 60 * 1000; // Number of milliseconds in one week

  if (timeDifference < oneWeekInMs) {
    // If the message is less than one week old, format as "Day HH:MM AM/PM"
    const options = { weekday: "short", hour: "numeric", minute: "numeric", hour12: true };
    return new Intl.DateTimeFormat("en-US", options).format(messageDate);
  } else {
    // If the message is more than one week old, format as "MM/DD/YY"
    const options = { month: "2-digit", day: "2-digit", year: "2-digit" };
    return new Intl.DateTimeFormat("en-US", options).format(messageDate);
  }
};