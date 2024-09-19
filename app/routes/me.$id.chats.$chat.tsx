import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useRouteError,
  useLoaderData,
  useFetcher,
} from "@remix-run/react";
import { useEffect, useState } from "react";

import { requireUserId } from "~/session.server";

import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";

import io from "socket.io-client";

import { getChatById } from "~/models/chat.server";

import { createMessage } from "~/models/message.server";

import { formatMessageTime } from "~/utils";
import { text } from "stream/consumers";

const socket = io("http://localhost:3000/");

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const chatId = params.chat;

  const chat = await getChatById(chatId);
  let otherParticipant = null;

  if (chat) {
    otherParticipant = chat.participants.filter((p) => p.id !== userId);
  }

  const friend = otherParticipant?.[0];
  const messages = chat?.messages || [];

  return { userId, friend, messages, chatId };
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const chatId = formData.get("chatId");
  const userId = formData.get("userId");
  const content = formData.get("content");

  // Save the message to the database using Prisma
  const newMessage = await createMessage({
    content: content as string,
    userId: userId as string,
    chatId: chatId as string,
  });

  // Emit the new message via Socket.io
  socket.emit("sendMessageToEventRoom", chatId, newMessage);

  return null;
};

export default function Chat() {
  const { userId, friend, messages, chatId } = useLoaderData();
  const fetcher = useFetcher();
  const [chatHistory, setChatHistory] = useState(messages || []);
  const [textareaValue, setTextareaValue] = useState("");

  // Ensure chatHistory is updated when chatId changes
  useEffect(() => {
    setChatHistory(messages || []);
    socket.emit("joinEventRoom", chatId);
  }, [chatId, messages]);

  // Listen for new messages and update the chat history
  useEffect(() => {
    socket.on("messageReceived", (message) => {
      setChatHistory((prev) => [...prev, message]);
    });

    return () => {
      socket.off("messageReceived");
    };
  }, []);

  const handleSendMessage = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    // Use fetcher to submit the message form
    fetcher.submit(form, { method: "post" });

    // Reset form after submission
    textareaValue && setTextareaValue("");
    event.currentTarget.reset();
  };

  const handleTextareaChange = (e) => {
    setTextareaValue(e.target.value);
    e.target.style.height = "auto"; // Reset height to calculate new height
    e.target.style.height = `${e.target.scrollHeight}px`; // Set height to scroll height
  };

  return (
    <section className="container h-full flex flex-col items-center justify-center p-1">
      <h1 className="text-center font-extrabold flex-start">
        Chat w/ {friend.username}
      </h1>
      <div className="flex flex-col items-center justify-center overflow-y-scroll size-full ">
        <ul id="messages" className="h-full w-full p-1">
          {chatHistory.map((message) => (
            <li key={message.id}>
              {message.userId === userId ? (
                <div className="flex justify-end gap-3">
                  <p>{formatMessageTime(message.createdAt)}</p>
                  <h3>{message.user.username}</h3>
                </div>
              ) : (
                <div className="flex justify-start gap-3">
                  <h3>{message.user.username}</h3>
                  <p>{formatMessageTime(message.createdAt)}</p>
                </div>
              )}

              <div
                className={`flex ${
                  message.userId === userId ? "justify-end" : "justify-start"
                }`}
              >
                <p
                  className={`${
                    message.userId === userId ? "bg-blue-50" : "bg-red-50"
                  } inline-block max-w-xs rounded-xl px-4 py-2 font-bold`}
                >
                  {message.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <form
        method="post"
        onSubmit={handleSendMessage}
        className="flex w-full justify-between items-center gap-3"
      >
        <input type="hidden" name="chatId" value={chatId} />
        <input type="hidden" name="userId" value={userId} />
        <textarea
          name="content"
          required
          placeholder="chat chat chat"
          className="w-full resize-none rounded p-2"
          style={{ minHeight: "40px", maxHeight: "120px", lineHeight: "20px" }} // Set min-height for 1 line and limit the max height
          value={textareaValue}
          onChange={handleTextareaChange} // Dynamically adjust height
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Send
        </button>
      </form>
    </section>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorBoundaryGeneral page="user/id/messages" />;
  }
  return <ErrorBoundaryGeneral page="user/id/messages" />;
}
