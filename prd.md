
# Product Requirements Document (PRD)

## Product Name

**Draft Fusion**

## 1. Product Overview

Draft Fusion is a **real-time collaborative document and code editor** that allows multiple users to **edit the same document simultaneously**. The platform is designed for developers, teams, and students who need **live collaboration similar to Google Docs but optimized for technical writing and coding**.

Users can create documents, share them with others, and collaborate in real time with visible cursor presence, live updates, and instant synchronization.

The product will feature a **Neobrutalism-style UI** that emphasizes bold typography, strong borders, vibrant colors, and minimalistic but expressive components.

---

# 2. Product Goals

### Primary Goals

* Enable **real-time collaborative editing**
* Provide **fast and smooth synchronization**
* Support **technical writing and code editing**
* Create a **visually distinctive UI using Neobrutalism**

### Secondary Goals

* Easy document sharing
* Persistent document storage
* Multi-user collaboration visibility
* Scalable architecture

---

# 3. Target Users

### Developers

Developers collaborating on code snippets or documentation.

### Students

Students collaborating on assignments, notes, or group projects.

### Technical Writers

Teams writing documentation together.

---

# 4. Core Features

## 4.1 Authentication

Users must be able to create and manage accounts.

**Capabilities**

* User signup
* User login
* JWT based authentication
* Logout
* Secure session management

**Data Stored**

* username
* email
* password (hashed)
* created_at

---

## 4.2 Document Creation

Users can create new collaborative documents.

**Capabilities**

* Create document
* Name document
* Save document content
* Open existing document
* Delete document

**Document Fields**

* document_id
* title
* content
* owner_id
* created_at
* updated_at

---

## 4.3 Real-Time Collaboration

Core functionality of the platform.

**Capabilities**

* Multiple users editing same document
* Live content synchronization
* Cursor presence indicators
* Live typing indicators
* Conflict-free updates

**Technology**

* WebSockets (Socket.io)
* Operational Transform (optional)
* CRDT (optional advanced implementation)

---

## 4.4 Live Cursor Tracking

Each collaborator can see where others are typing.

**Features**

* Unique cursor color per user
* Display username near cursor
* Cursor updates in real time

---

## 4.5 Document Sharing

Users can invite others to collaborate.

**Capabilities**

* Share document via link
* Add collaborators
* Read / write permissions

---

## 4.6 Auto Save

Documents automatically save changes.

**Behavior**

* Save after inactivity (2 seconds)
* Save on user disconnect

---

## 4.7 Version History (Optional v2 Feature)

Users can view document history.

**Capabilities**

* Restore previous versions
* Timeline of edits

---

# 5. User Flow

## User Registration

User → Signup → Account Created → Redirect to Dashboard

---

## Creating a Document

Dashboard → Click "New Document" → Editor Opens → Document Created

---

## Real-Time Editing

User A edits → Change sent via WebSocket → Backend syncs → User B sees update instantly

---

## Sharing

Open Document → Click Share → Generate Link → Send Link

---

# 6. System Architecture

## Frontend

Framework: **Next.js**

Responsibilities

* UI rendering
* Editor interface
* WebSocket connection
* Cursor tracking
* API communication

Libraries

* React
* Tailwind CSS
* Socket.io Client
* Monaco Editor / CodeMirror

---

## Backend

Framework: **Express.js**

Responsibilities

* API management
* Authentication
* Document storage
* WebSocket server
* Collaboration sync

Libraries

* Express
* Socket.io
* JWT
* bcrypt

---

## Database

Database: **MongoDB**

Collections

### Users

```
{
 id
 username
 email
 password_hash
 created_at
}
```

### Documents

```
{
 id
 title
 content
 owner_id
 collaborators
 created_at
 updated_at
}
```

---

# 7. API Endpoints

## Authentication

POST `/api/auth/signup`

POST `/api/auth/login`

GET `/api/auth/profile`

---

## Documents

POST `/api/docs/create`

GET `/api/docs/:id`

PUT `/api/docs/:id`

DELETE `/api/docs/:id`

GET `/api/docs/user/:userId`

---

# 8. Real-Time Communication

Using **Socket.io**

### Events

Join Document

```
join_document
```

Send Changes

```
document_change
```

Receive Changes

```
receive_change
```

Cursor Movement

```
cursor_update
```

User Join

```
user_joined
```

User Leave

```
user_left
```

---

# 9. UI / UX Design

## Design Style

**Neobrutalism**

### Key Characteristics

* Thick black borders
* High contrast colors
* Bold typography
* Box shadows
* Flat elements
* Playful UI

---

## Color Palette

Primary

```
#FF4D4D
```

Secondary

```
#4D7CFE
```

Background

```
#F9F9F9
```

Accent

```
#FFD700
```

Borders

```
#000000
```

---

## Typography

Heading Font

```
Inter / Space Grotesk
```

Editor Font

```
JetBrains Mono
```

---

# 10. Main Pages

## Landing Page

Features

* Product introduction
* Call to action
* Login / Signup

---

## Dashboard

Features

* List of documents
* Create document button
* Recent documents

---

## Editor Page

Features

* Code editor
* Active collaborators
* Cursor indicators
* Share button
* Document title

---

# 11. Performance Requirements

Real-time latency

```
< 200ms update propagation
```

Document loading

```
< 1 second
```

Concurrent users

```
50+ per document (initial target)
```

---

# 12. Security

Requirements

* JWT authentication
* Password hashing (bcrypt)
* Rate limiting
* Input validation
* CORS protection

---

# 13. Future Enhancements

### v2

* Syntax highlighting
* Video/audio collaboration
* AI code suggestions
* Commenting system
* File attachments
* GitHub integration

---

# 14. Tech Stack Summary

Frontend

```
Next.js
React
Tailwind CSS
Socket.io Client
Monaco Editor
```

Backend

```
Express.js
Node.js
Socket.io
JWT
bcrypt
```

Database

```
MongoDB
```

---

# 15. Success Metrics

Key Metrics

User metrics

* Daily active users
* Number of documents created

Collaboration metrics

* Avg collaborators per doc
* Avg editing session length

Performance

* Sync latency
* Server response time

---

💡 **Ruthless mentor advice for your interview (important):**

Right now **Draft Fusion can become your strongest project** if you add **3 features**:

1️⃣ **Live cursors**
2️⃣ **Presence detection (who is online)**
3️⃣ **Conflict resolution (CRDT / OT)**

Without these, interviewers will think it's just **Socket + text sync**.

With these, it becomes **a real collaborative system**.

---
