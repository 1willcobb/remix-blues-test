const { http, passthrough } = require("msw");
const { setupServer } = require("msw/node");


const miscHandlers = [
  http.post(`${process.env.REMIX_DEV_HTTP_ORIGIN}/ping`, () => passthrough()),
];

const server = setupServer(...miscHandlers);

server.listen({ onUnhandledRequest: "bypass" });
console.info("🔶 Mock server running");

process.once("SIGINT", () => server.close());
process.once("SIGTERM", () => server.close());
