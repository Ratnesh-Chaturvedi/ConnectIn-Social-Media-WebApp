# 🚀 Project Roadmap & Bug Tracker

This document outlines the core features to be implemented and active bugs that need to be resolved to ensure a smooth user experience.

---

## 🛠️ Features to Implement

### 0. Real-time Communication Upgrade
* **Goal:** Replace the current **Server-Sent Events (SSE)** with **WebSockets (Socket.io)** for more robust, two-way real-time messaging.
* **Alternative:** If WebSockets are not used, fix existing SSE stability issues (heartbeat/timeouts) to ensure the connection doesn't drop in production.

### 1. Profile page like tab section building 

---

## 🐞 Active Bug List

### Bug #1: Disconnected User Visibility
* **Description:** When a user is disconnected or removed from the "Connections" list, their previous messages still appear in the **Recent Messages** sidebar.
* **Expected Behavior:** Once a user is disconnected, their chat entry should be automatically hidden or removed from the Recent Messages view to protect privacy and maintain a clean UI.

### Bug #2: Comment Count Sync Error
* **Description:** The post displays a total comment count (e.g., "5 Comments"). However, when a comment is deleted, this number does not decrease.
* **Expected Behavior:** The comment count on the post should be dynamic. Deleting a comment must immediately update the UI to show the correct, reduced count.

---

