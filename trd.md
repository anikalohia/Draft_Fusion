

# Technical Requirements Document (TRD)

## Project Name

**Draft Fusion**

## Version

1.0

---

# 1. System Overview

Draft Fusion is a **real-time collaborative document and code editor** that enables multiple users to **edit a document simultaneously with live synchronization**.

The system uses **WebSocket-based communication to synchronize document changes instantly across clients**.

The architecture follows a **modern full-stack approach**:

* **Frontend:** Next.js
* **Backend:** Node.js with Express
* **Database:** MongoDB
* **Realtime Layer:** Socket.io
* **Editor Engine:** Monaco Editor / CodeMirror

---

# 2. System Architecture

```
Client (Next.js)
     |
     | REST API
     v
Backend API (Express.js)
     |
     | WebSocket
     v
Realtime Server (Socket.io)
     |
     v
MongoDB Database
```

### Components

1. Frontend (Next.js)
2. Backend API (Express)
3. Realtime Collaboration Layer
4. Database Layer
5. Authentication System

---

# 3. Technology Stack

## Frontend

Framework

```
Next.js 14
```

Libraries

```
React
Tailwind CSS
Socket.io-client
Monaco Editor
Axios
```

---

## Backend

Runtime

```
Node.js
```

Framework

```
Express.js
```

Libraries

```
Socket.io
jsonwebtoken
bcrypt
mongoose
cors
dotenv
```

---

## Database

Database

```
MongoDB
```

ODM

```
Mongoose
```

---

# 4. Project Structure

## Frontend

```
frontend/
 ├─ app/
 │   ├─ page.tsx
 │   ├─ dashboard/
 │   ├─ editor/[id]/
 │
 ├─ components/
 │   ├─ Editor.tsx
 │   ├─ CursorIndicator.tsx
 │   ├─ Navbar.tsx
 │   ├─ Sidebar.tsx
 │
 ├─ services/
 │   ├─ api.ts
 │   ├─ socket.ts
 │
 ├─ styles/
 │   ├─ globals.css
```

---

## Backend

```
backend/
 ├─ controllers/
 │   ├─ authController.js
 │   ├─ documentController.js
 │
 ├─ models/
 │   ├─ User.js
 │   ├─ Document.js
 │
 ├─ routes/
 │   ├─ authRoutes.js
 │   ├─ documentRoutes.js
 │
 ├─ sockets/
 │   ├─ collaboration.js
 │
 ├─ middleware/
 │   ├─ authMiddleware.js
 │
 ├─ config/
 │   ├─ db.js
 │
 ├─ server.js
```

---

# 5. Database Schema

## Users Collection

```
User {
  _id: ObjectId
  username: String
  email: String
  password: String
  createdAt: Date
}
```

---

## Documents Collection

```
Document {
  _id: ObjectId
  title: String
  content: String
  owner: ObjectId
  collaborators: [ObjectId]
  createdAt: Date
  updatedAt: Date
}
```

---

# 6. Real-Time Collaboration Architecture

Communication uses **WebSockets via Socket.io**.

Each document has its own **socket room**.

Example:

```
room = document_id
```

Users joining the document connect to that room.

---

## Collaboration Flow

```
User A edits document
       |
Editor detects change
       |
Socket emits "document_change"
       |
Server receives change
       |
Server broadcasts change
       |
Other users receive update
       |
Editor updates content
```

---

# 7. WebSocket Events

### Join Document

Event

```
join_document
```

Payload

```
{
 documentId
 userId
}
```

---

### Document Change

Event

```
document_change
```

Payload

```
{
 documentId
 delta
}
```

---

### Receive Change

Event

```
receive_change
```

Payload

```
{
 delta
}
```

---

### Cursor Update

Event

```
cursor_update
```

Payload

```
{
 userId
 position
}
```

---

### User Join

Event

```
user_joined
```

---

### User Leave

Event

```
user_left
```

---

# 8. REST API Specifications

## Authentication

### Signup

POST

```
/api/auth/signup
```

Body

```
{
 username
 email
 password
}
```

---

### Login

POST

```
/api/auth/login
```

Response

```
{
 token
 user
}
```

---

### Profile

GET

```
/api/auth/profile
```

---

# 9. Document API

### Create Document

POST

```
/api/docs
```

---

### Get Document

GET

```
/api/docs/:id
```

---

### Update Document

PUT

```
/api/docs/:id
```

---

### Delete Document

DELETE

```
/api/docs/:id
```

---

### Get User Documents

GET

```
/api/docs/user/:userId
```

---

# 10. Authentication Mechanism

Authentication will use **JWT tokens**.

Flow

```
User logs in
     |
Server verifies credentials
     |
Server generates JWT
     |
Client stores token
     |
Token sent in Authorization header
```

Header format

```
Authorization: Bearer <token>
```

---

# 11. Editor Integration

Editor options

```
Monaco Editor
or
CodeMirror
```

Editor must support

* syntax highlighting
* code formatting
* cursor tracking
* change detection

Change detection example

```
editor.onDidChangeModelContent()
```

---

# 12. Auto Save System

Auto save triggers when:

```
2 seconds after last edit
```

Implementation

```
debounce(saveDocument, 2000)
```

---

# 13. Security Requirements

### Password Security

Passwords must be hashed using

```
bcrypt
```

---

### API Protection

Protected routes must use middleware

```
authMiddleware
```

---

### CORS

Backend must enable

```
cors()
```

---

### Rate Limiting (Recommended)

Prevent abuse using

```
express-rate-limit
```

---

# 14. Performance Requirements

Latency

```
< 200 ms sync delay
```

Concurrent users

```
50 users per document
```

Document load time

```
< 1 second
```

---

# 15. UI Implementation

Design Style

```
Neobrutalism
```

Design characteristics

* thick borders
* bold fonts
* flat components
* strong shadows
* vibrant colors

Example CSS

```
border: 4px solid black;
box-shadow: 6px 6px 0 black;
```

---

# 16. Deployment Architecture

Hosting

Frontend

```
Vercel
```

Backend

```
Render / Railway
```

Database

```
MongoDB Atlas
```

---

# 17. Logging

Logs must capture

* API requests
* socket connections
* errors

Recommended library

```
winston
```

---

# 18. Error Handling

All APIs must return structured responses.

Example

```
{
 success: false,
 message: "Document not found"
}
```

---

# 19. Testing Requirements

Testing types

Unit Testing

```
Jest
```

API Testing

```
Supertest
```

Manual Testing

* document collaboration
* socket connection
* auth flow

---

# 20. Future Technical Enhancements

### CRDT-based syncing

Conflict-free collaboration system.

---

### Offline editing

Allow users to edit offline and sync later.

---

### AI integration

Auto summarize documents.

---

### Comments system

Inline document comments.

---

# Important Advice (For Your Interview)

Right now your project is **good**.

But if you add these **3 technical features**, it becomes **EPAM / product company level**:

1️⃣ **Operational Transform or CRDT syncing**
2️⃣ **Live cursor presence**
3️⃣ **User presence system**

Then you can explain **system design** like Google Docs.

Interviewers LOVE that.

---
