import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useParams, isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { useEffect, useState} from "react";
import { getFollowing } from "~/models/userFollow.server";

import { requireUserId } from "~/session.server";

import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  return { userId };
};

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const { id, userid } = useParams();

  useEffect(() => {
    const myId = encodeURIComponent(id); // Ensure userId is URL-safe
    const friendId = encodeURIComponent(userid);
    const ws = new WebSocket(`ws://localhost:3333?myId=${myId}&friendId=${friendId}`);
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'status') {
        console.log(`Friend is now ${data.status}`);
      } else {
        console.log("Message From Server: ", data.message);
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [id, userid]);

  const sendMessage = () => {
    if (socket && input) {
      const message = JSON.stringify({ message: input });
      console.log("Sending message: ", message);
      socket.send(message);
      setInput("");
    }
  };

  return (
    <div className="p-2 flex flex-col h-full bg-orange-200">
      <div className="flex flex-grow flex-col-reverse overflow-hidden ">
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <div className=" bg-slate-200 w-full">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendMessage} className="btn btn-sm btn-neutral">
          Send
        </button>
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
