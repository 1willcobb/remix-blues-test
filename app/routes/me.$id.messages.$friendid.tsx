import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  useParams,
  isRouteErrorResponse,
  useRouteError,
  useNavigate,
  useLoaderData,
} from "@remix-run/react";
import { useEffect, useState } from "react";

import { getUser, requireUserId } from "~/session.server";

import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";

import io from "socket.io-client";
import { getChatById } from "~/models/chat.server";

import { getUserById } from "~/models/user.server";

const socket = io("http://localhost:3000/");

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const chatId = `${params.id}##${params.friendid}`;


  const friend = await getUserById(params.friendid);
  console.log("friend", friend);

  

  console.log("chatId", chatId);

  // getChatById(userId);

  return { userId, chatId, friend };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return null;
};

export default function Chat() {
  // Get the event ID from the URL
  const {userId, chatId, friend} = useLoaderData()
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    socket.emit("joinEventRoom", chatId);
  }, [chatId]);

  const [name, setName] = useState("jeff");
  const navigate = useNavigate();

  // set up state for chat data and set default author to local storage name
  const [chatData, setChatData] = useState({
    capsuleId: chatId,
    text: "",
    author: name, // grab local storage name as default
  });

  // // Query the database for the chat history
  // const { loading, data } = useQuery(GET_CHAT, {
  //   variables: { id: eventId },
  // });

  // // check if there is chat history
  // const chatHistory = data?.getCapsule || [];

  // // Create a new message via GraphQL mutation and set createMessage to a function
  // const [createMessage, { error }] = useMutation(ADD_CHAT, {
  //   variables: {
  //     capsuleId: chatData.capsuleId,
  //     text: chatData.text,
  //     author: chatData.author,
  //   },
  // });

  // scroll to the bottom on load
  useEffect(() => {
    scrollToBottom();
  }, []);

  // Listen for new messages from Socket.IO and set them immediately to the chat list
  useEffect(() => {
    socket.on("messageReceived", (message) => {
      // Handle the new message received from the server
      console.log("Received message from Socket.IO:", message);
      const messages = document.getElementById("messages");
      const item = document.createElement("li");
      item.innerHTML = `
      <div class="flex gap-3 justify-between">
        <h3>${message.author}</h3>
        <p>${message.date}</p>
      </div>
      ${
        message.author === name
          ? `<p class="flex justify-end rounded-xl bg-lightgray px-4 py-1 font-bold">${message.text}</p>`
          : `<p class="flex flex-col rounded-xl bg-white px-4 py-1.5">${message.text}</p>`
      }`;
      messages.appendChild(item);

      scrollToBottom();
    });
    // Clean up the event listener when the component unmounts
    return () => {
      socket.off("messageReceived");
    };
  }, []);

  // function to scroll to the bottom
  const scrollToBottom = () => {
    const chatBox = document.querySelector(".no-scrollbar");
    if (chatBox) {
      chatBox.style.scrollBehavior = "smooth"; // Enable smooth scrolling
      chatBox.scrollTop = chatBox.scrollHeight;
      chatBox.style.scrollBehavior = "auto"; // Reset to default behavior
    }
  };


  // if no chathistory, return a message
  if (!chatHistory)
    return (
      <div className="max-h-100 flex flex-col items-center justify-center overflow-scroll">
        <p>No chat found</p>
      </div>
    );

  // handle the sending of a message on submit
  const handleSendMessage = async (event) => {
    event.preventDefault();
    try {
      // check the console for the data
      console.log("Sending message:", chatData);

      // Emit the same message to the Socket.IO server immediately
      socket.emit("sendMessageToEventRoom", chatId, chatData);

      // use the mutation function toe create a new message on the server
      // const newMessage = await createMessage({
      //   variables: {
      //     capsuleId: chatData.capsuleId,
      //     text: chatData.text,
      //     author: chatData.author,
      //   },
      // });

      // reset the state after the message created and clear the form
      setChatData({
        ...chatData,
        text: "",
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };


  // return the chat history and the form to send a message
  return (
    <section className="container m-auto flex w-96 flex-col items-center justify-center mb-4">
      <h1 className="text-center font-extrabold">Chat w/ {friend.username}</h1>
      <div className="no-scrollbar flex h-[70vh] flex-col items-center justify-center overflow-y-scroll p-6">
        <ul id="messages" className="h-full">
          {/* map over the chat history and display the messages */}
          {/* {chatHistory ? chatHistory.chat.map((message) => (
            <li key={message._id}>
              <div className="flex justify-between gap-3">
                <h3>{message.author}</h3>
              </div>
              {message.author === name ? (
                <p className="flex justify-end rounded-xl bg-lightgray px-4 py-1 font-bold">
                  {message.text}
                </p>
              ) : (
                <p className="flex flex-col rounded-xl bg-white px-4 py-1.5">
                  {message.text}
                </p>
              )}
            </li>
          )): null} */}
        </ul>
      </div>
      <form
        className="flex w-full justify-between items-baseline gap-3 px-6 pt-3"
        onSubmit={handleSendMessage}
      >
        <input
          type="text"
          value={chatData.text}
          required
          placeholder="Message the Event"
          className="w-full resize"
          onChange={(e) =>
            setChatData(() => ({
              ...chatData,
              text: e.target.value,
            }))
          }
        />
        <button type="submit" className="btn btn-primary">
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
