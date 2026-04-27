/**
 * WebSocket helpers (socket.io-client).
 *
 * Each helper creates a new connection.
 * The component that calls it owns the lifecycle (connect / disconnect).
 *
 * socket.io URL shape: base + namespace
 *   "http://localhost:4004/rooms"   → namespace /rooms
 *   "http://localhost:4004/battles" → namespace /battles
 */
import { io, type Socket } from "socket.io-client";
import { getApiBase } from "./api-base";

export type { Socket };

/** Connect to the /rooms namespace. Used to know when the room is ready. */
export function createRoomsSocket(): Socket {
  return io(`${getApiBase()}/rooms`, { transports: ["websocket"] });
}

/** Connect to the /battles namespace. Used for online opponent turn updates. */
export function createBattlesSocket(): Socket {
  return io(`${getApiBase()}/battles`, { transports: ["websocket"] });
}
