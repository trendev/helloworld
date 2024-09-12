
# Node.js Express Server

This is a simple Node.js application using the Express framework, Docker and Kubernetes. It provides basic health-check routes and retrieves system information such as IP addresses and hostname.

## Features

- **Health check endpoint** to verify the status of the application.
- **System information endpoint** that returns the namespace, hostname, IP address, and a timestamp.
- **Logging** with `morgan` to monitor HTTP requests.
- Uses `os` module to retrieve network interface details.

## Prerequisites

- Node.js (v12.x or higher)
- npm (v6.x or higher)

## Installation

1. Clone this repository.

   ```bash
   git clone <repository_url>
   ```

2. Navigate to the project directory.

   ```bash
   cd <project_directory>
   ```

3. Install the dependencies.

   ```bash
   npm install
   ```

## Environment Variables

The application can use the following environment variables:

- `PORT`: Port on which the server will listen (default is `9000`).
- `MY_POD_NAMESPACE`: The namespace for the pod (defaults to `docker`).
- `MY_POD_NAME`: The hostname of the pod (defaults to system hostname).
- `MY_POD_IP`: The IP address of the pod (defaults to the machine's network interface addresses).

## Usage

1. To start the server, run the following command:

   ```bash
   node index.js
   ```

2. The application will be running on the port specified by the `PORT` environment variable (or `9000` by default).

## API Endpoints

### GET `/health`

This endpoint returns the health status of the server.

**Response:**

```json
{
  "status": "ok",
  "message": "we are up and running 😘"
}
```

### GET `/`

This endpoint returns system information such as the namespace, hostname, IP addresses, and a timestamp.

**Response:**

```json
{
  "status": "ok",
  "namespace": "docker",
  "hostname": "<hostname>",
  "ip": [
    { "eth0": "192.168.1.100" }
  ],
  "timestamp": 1684567890123
}
```

## Logging

The server uses the `morgan` library for request logging. Logs are printed in the console in the "dev" format.
