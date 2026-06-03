# Draft Fusion 🚀

**Draft Fusion** is a high-performance, real-time collaborative document and code editor. It combines the seamless multi-user experience of Google Docs with the technical power of a code-friendly editor, all wrapped in a bold **Neobrutalism** design.

---

## 🏗️ Technical Architecture

Draft Fusion is built on a modern full-stack architecture designed for low-latency synchronization and persistent storage.

- **Frontend:** Next.js 15 (App Router), Tiptap Editor, Tailwind CSS, Zustand.
- **Backend:** Node.js, Express.js.
- **Real-time Layer:** Socket.io (WebSockets).
- **Database:** MongoDB (Mongoose).
- **Authentication:** JWT (Stateless) & Bcrypt (Password Hashing).

---

## 📂 Code Structure

### Frontend (Root)
- **`app/`**: Next.js App Router.
  - **`documents/[id]/`**: The core editor page, including the header, toolbar, and Tiptap integration.
  - **`context/`**: Auth providers managing user sessions.
  - **`store/`**: Zustand stores for global editor state (e.g., tracking remote cursor positions).
- **`components/ui/`**: A library of Neobrutalism-styled components (buttons, modals, inputs).
- **`lib/`**: Shared utilities like `socket.ts` for centralized WebSocket connection.
- **`hooks/`**: Custom React hooks for mobile detection and editor logic.

### Server (`/server`)
- **`sockets/`**: The heartbeat of the app. Handles room management, content broadcasts, typing indicators, and cursor sync.
- **`controllers/`**: Logical handlers for Auth, Document CRUD, and Sharing.
- **`Models/`**: Mongoose schemas for `User` and `Document`.
- **`passport/`**: Custom authentication middleware for protecting API routes.
- **`config/`**: Database connection and environment setup.

---

## 🚀 Deployment

For detailed deployment instructions for Vercel and Render, please refer to:
👉 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Installation

1. **Clone the Repo**
   ```bash
   git clone https://github.com/anikalohia/Draft_Fusion.git
   ```

2. **Setup Server**
   ```bash
   cd server
   npm install
   # Create a .env file based on .env.example
   npm start
   ```

3. **Setup Frontend**
   ```bash
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

---

## 📝 License
Distributed under the MIT License.
