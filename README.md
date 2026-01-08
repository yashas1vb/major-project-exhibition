# CollabCode IDE

A powerful collaborative coding environment designed for seamless real-time development.

## Tech Stack

This project utilizes a modern technology stack to ensure performance, scalability, and a great user experience.

### Frontend
- **React**: Library for building user interfaces.
- **Vite**: Next Generation Frontend Tooling for fast build times.
- **TypeScript**: Typed superset of JavaScript for better code quality.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **shadcn-ui**: Reusable components built with Radix UI and Tailwind CSS.
- **Zustand**: A small, fast, and scalable bearbones state-management solution.
- **React Query**: Powerful asynchronous state management for fetching and caching data.
- **Socket.io Client**: For real-time bi-directional communication (collaborative features).
- **Monaco Editor**: The code editor that powers VS Code, providing a rich editing experience.
- **Fabric.js**: HTML5 canvas library, used for the interactive whiteboard.

### Backend
- **Node.js**: JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **TypeScript**: Brings static typing to the backend for robust application logic.
- **MongoDB (with Mongoose)**: NoSQL database for flexible data modeling and persistence.
- **Socket.io**: Enables real-time, bidirectional and event-based communication.
- **Passport.js**: Authentication middleware for Node.js (specifically `passport-google-oauth20` strategy).
- **JWT (JSON Web Tokens)**: For secure transmission of information between parties.


## APIs Used

### 1. Judge0 API
- **Purpose**: Remote Code Execution (RCE).
- **Why it's used**: To securely execute user-submitted code in an isolated environment. It supports multiple programming languages and returns the output (stdout, stderr) to the frontend, enabling the "Run Code" functionality in the IDE.

### 2. Google OAuth 2.0 API
- **Purpose**: User Authentication.
- **Why it's used**: To provide a secure and frictionless sign-in experience. Users can log in using their existing Google accounts, eliminating the need to management separate credentials and enhancing security.



## Getting Started

To run this project locally, follow these steps:

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   ```

2. **Navigate to the project directory**
   ```bash
   cd <YOUR_PROJECT_NAME>
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
