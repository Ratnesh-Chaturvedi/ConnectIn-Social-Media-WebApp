# 🚀 Project Roadmap & Bug Tracker

This document outlines the core features to be implemented and active bugs that need to be resolved to ensure a smooth user experience.

---

## 🛠️ Features to Implement

### 0. Real-time Communication Upgrade
* **Goal:** Replace the current **Server-Sent Events (SSE)** with **WebSockets (Socket.io)** for more robust, two-way real-time messaging.
* **Alternative:** If WebSockets are not used, fix existing SSE stability issues (heartbeat/timeouts) to ensure the connection doesn't drop in production.


---

## 🐞 Active Bug List

### Bug #1: Disconnected User Visibility
* **Description:** When a user is disconnected or removed from the "Connections" list, their previous messages still appear in the **Recent Messages** sidebar.
* **Expected Behavior:** Once a user is disconnected, their chat entry should be automatically hidden or removed from the Recent Messages view to protect privacy and maintain a clean UI.

---

