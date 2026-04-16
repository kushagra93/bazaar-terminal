"use client";

type WSHandler = (event: { type: string; data: any }) => void;

let ws: WebSocket | null = null;
let handlers: WSHandler[] = [];
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export function connectWS() {
  if (ws?.readyState === WebSocket.OPEN) return;

  ws = new WebSocket("ws://localhost:8500/ws");

  ws.onopen = () => console.log("[WS] Connected");

  ws.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data);
      handlers.forEach((h) => h(parsed));
    } catch {}
  };

  ws.onclose = () => {
    console.log("[WS] Disconnected, reconnecting...");
    reconnectTimer = setTimeout(connectWS, 3000);
  };

  ws.onerror = () => ws?.close();
}

export function onWSEvent(handler: WSHandler) {
  handlers.push(handler);
  return () => {
    handlers = handlers.filter((h) => h !== handler);
  };
}

export function disconnectWS() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  ws?.close();
  ws = null;
  handlers = [];
}
