# Boolbi - Service Connection Application

Boolbi is a service connection application that connects users with various services. The application uses Firebase for push notifications and provides a real-time connection for users and service providers. This app is built with Node.js, TypeScript, and Docker for containerization.

## Features

- **Push Notifications**: Firebase Cloud Messaging (FCM) to send real-time notifications to users.
- **Real-Time Communication**: Uses WebSockets or similar technologies for instant service connections.
- **Task Management**: Helps users connect to the right service provider and manage the service tasks.
- **User Profiles**: Allows users to create and manage profiles for better service matching.

## Prerequisites

Ensure you have the following tools installed before running the application:

- [Node.js](https://nodejs.org) (LTS version)
- [Docker](https://www.docker.com/products/docker-desktop)
- [Firebase](https://firebase.google.com) for push notifications.

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/boolbi.git
cd boolbi
````

### 2. Install Dependencies

Install the necessary Node.js dependencies:

```bash
npm install
```

### 3. Environment Variables

Copy the sample `.env.sample` file to a new `.env` file:

```bash
cp .env.sample .env
```

Update the `.env` file with the required variables for your project. This includes your **Firebase credentials**, and any other environment-specific configurations (like database connection, etc.).

### 4. Running the Application

#### Development Mode (with Nodemon)

To run the application in development mode with live-reloading:

```bash
npm run dev
```

#### Production Mode

To build and start the application in production:

```bash
npm run build
npm start
```

### 5. Docker Setup

If you want to run the application using Docker, make sure you have Docker installed. You can build and run the Docker container as follows:

#### Run the Docker 

```bash
docker compus up
```

This will run the application inside a container and map port from the container to port of ``.env` on your machine.

