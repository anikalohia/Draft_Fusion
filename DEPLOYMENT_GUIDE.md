# Draft Fusion Deployment Guide

This guide provides step-by-step instructions to deploy **Draft Fusion** (Frontend and Backend).

## Prerequisites

1.  **MongoDB Atlas**: A running cluster and a connection string.
2.  **GitHub Account**: Your code should be pushed to a GitHub repository.
3.  **Vercel Account**: For Frontend deployment.
4.  **Render or Railway Account**: For Backend deployment.

---

## 1. Environment Variables

Create the following environment variables in your deployment platforms.

### Backend (Render/Railway)
- `MONGODB_URI`: Your MongoDB Atlas connection string.
- `JWT_SECRET`: A random secret string for signing JWT tokens.
- `CLIENT_URL`: The URL of your deployed Frontend (e.g., `https://draft-fusion.vercel.app`).
- `PORT`: 5000 (Render provides this automatically, but you can set it).

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL`: The URL of your deployed Backend (e.g., `https://draft-fusion-server.onrender.com`).

---

## 2. Backend Deployment (Render)

1.  Log in to [Render](https://render.com/).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository.
4.  **Root Directory**: `server`
5.  **Environment**: `Node`
6.  **Build Command**: `npm install`
7.  **Start Command**: `npm start`
8.  Add the **Environment Variables** listed above.
9.  Deploy.

---

## 3. Frontend Deployment (Vercel)

1.  Log in to [Vercel](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Framework Preset**: Next.js
5.  **Root Directory**: `.` (The root of the repo)
6.  **Build Command**: `npm run build`
7.  **Output Directory**: `.next`
8.  Add the **Environment Variables** listed above.
    - *Note: You will need the Backend URL from Render to set `NEXT_PUBLIC_API_URL`.*
9.  Deploy.

---

## 4. Post-Deployment Steps

1.  Once the Frontend is deployed, copy its URL.
2.  Go back to your Backend deployment (Render/Railway) and update the `CLIENT_URL` environment variable with the Frontend URL.
3.  Redeploy the Backend if necessary.

---

## Local Development

To run the project locally:

1.  **Backend**:
    ```bash
    cd server
    npm install
    npm run dev
    ```
2.  **Frontend**:
    ```bash
    npm install
    npm run dev
    ```

Make sure to create `.env` files based on `.env.example` in both the root and `server` directories.
