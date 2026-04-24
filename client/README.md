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

### Client (`/client`)
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

## 🔄 Data Flow Specifics

### 1. Authentication Flow
1. **User Login:** Client sends credentials to `/api/auth/login`.
2. **JWT Issuance:** Server verifies and returns a signed JWT.
3. **Authorization:** The token is stored in `localStorage` and sent in the `Authorization: Bearer <token>` header for all subsequent requests.

### 2. Real-time Collaboration Flow
- **Joining:** When a user opens a document, they emit `join_document`. The server places them in a specific Socket.io room.
- **Typing Sync:** 
  - User A types → Tiptap `onUpdate` triggers → Socket emits `document_change`.
  - Server broadcasts `receive_change` to all room members except User A.
  - User B's editor receives JSON content → `editor.commands.setContent()` updates the view.
- **Conflict Handling:** Currently uses a high-frequency broadcast with cursor position preservation to minimize overlap.

### 3. Presence & Interaction Flow
- **Typing Indicators:** Real-time `typing` events trigger a floating UI that shows who is currently active.
- **Follow Mode:** User B clicks User A's avatar → Logic pulls User A's latest cursor index from Zustand → Editor scrolls User A's current position into view.

### 4. Sharing & Permissions
- **Granular Access:** The `Document` model tracks a `sharedWith` array.
- **Permissions:** The `Editor` component checks the user's role (Owner, Editor, or Viewer) on load. If the role is `Viewer`, the `editor.setEditable(false)` command is triggered, locking the document.

---

## 🌟 Advanced Features

- **Slash Commands:** Type `/` inside the editor to trigger a Neobrutalism menu for headings, tables, code blocks, and lists.
- **Export Engine:** Convert documents instantly to **PDF, Markdown, HTML, or JSON** via the Export dropdown.
- **Markdown Shortcuts:** Support for standard markdown input (e.g., typing `### ` transforms into an H3).
- **Auto-Save:** A 2-second debounce timer ensures all changes are persisted to MongoDB without manual saving.

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
   # Create a .env file with PORT, MONGO_URI, and JWT_SECRET
   npm start
   ```

3. **Setup Client**
   ```bash
   cd client
   npm install
   # Create a .env.local with NEXT_PUBLIC_API_URL
   npm run dev
   ```

---

## 📝 License
Distributed under the MIT License.
