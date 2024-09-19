import type { ActionFunctionArgs } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  Link,
  Outlet,
  isRouteErrorResponse,
  useRouteError,
  redirect,
  useParams,
  useFetcher,
} from "@remix-run/react";

import { getUserById } from "~/models/user.server";

import { checkChats, getUserChats } from "~/models/chat.server";
import { getFollowing } from "~/models/userFollow.server";
import { requireUserId } from "~/session.server";
import { extractUserIdFromFullId } from "~/utils.ts";

import { RiCloseCircleLine } from "react-icons/ri";

import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";

import { createChat, deleteChat } from "~/models/chat.server";

//TODO:
//* A new message should be made on the friend heading message button
//* That message button should start a new Chat, and establish the chatId
//* the navigation should go to me/id/chats and prob all the way to that friend message
//* the left navigation ata me/id/message should display my messages and the active message
//* messages should save and use the socket connection.
//* upon returning to the page, the messages should be loaded from the database and the most recent chat displayed
//! there should be a way to delete the entire message channel. maybe on me/id/message a little trash icon on hover

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const chats = await getUserChats(userId);

  return { userId, chats };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const newChat = formData.get("NewChat");
  const deleteSignal = formData.get("delete");
  const chatId = formData.get("chatId");


  if (deleteSignal === "true") {
    console.log("delete chat", deleteChat);
    const deletedChat = await deleteChat(chatId);
    
    return redirect(`/me/${params.id}/chats`);
  }

  if (newChat) {
    console.log("new chat", newChat);
    const isChat = await checkChats([newChat, params.id]);
    if (isChat) {
      console.log("CHAT EXISTS", isChat);
      return redirect(`/me/${params.id}/chats/${isChat.id}`);
    } else {
      console.log("CHAT DOES NOT EXIST", isChat);
      const chat = await createChat([newChat, params.id]);
      return redirect(`/me/${params.id}/chats/${chat.id}`);
    }
  }
  return null;
};

export default function Chat() {
  const { userId, chats } = useLoaderData();

  const params = useParams();

  const currentChat = params.chat;

  const fetcher = useFetcher();

  return (
    <div className="grid grid-cols-3 flex-grow">
      <div className="col-span-1 border-r-slate-300 border-r p-2 bg-slate-50">
        {chats
          ? chats.map((chat) => (
              <div
                key={chat.chatId}
                className={`relative group flex gap-2 w-full justify-start align-middle items-center text-center ${chat.chatId === currentChat ? "bg-orange-100" : ""}`}
              >
                <Link
                  to={chat.chatId}
                  className="flex gap-2 w-full justify-start align-middle items-center text-center"
                >
                  <img
                    className="size-4 rounded-full object-cover"
                    src={chat.participantImage}
                    alt={chat.participantName}
                  />
                  <p className="font-bold">{chat.participantName}</p>
                </Link>

                {/* Delete button, visible only on hover */}
                <fetcher.Form
                  method="post"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2  p-1 rounded hover:bg-red-100 hidden group-hover:block"
                >
                  <input type="hidden" name="chatId" value={chat.chatId} />
                  <input type="hidden" name="delete" value="true" />
                  <button type="submit">
                    <RiCloseCircleLine />
                  </button>
                </fetcher.Form>
              </div>
            ))
          : null}
      </div>
      <div className="col-span-2 w-full">
        <Outlet />
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorBoundaryGeneral page="user/id/messages" />;
  }
  return <ErrorBoundaryGeneral page="user/id/messages" />;
}

// ${userId === chat.participantId? "bg-orange-200" : ""}
