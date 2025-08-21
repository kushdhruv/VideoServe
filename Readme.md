# Chai Aur Backend

A Node.js backend project built with Express, MongoDB, and Cloudinary for user management, authentication, file uploads, and video handling.

## Features

- User registration and authentication (JWT-based)
- Password change and secure cookie-based sessions
- File uploads (avatars, cover images) with Cloudinary integration
- Video and subscription models
- Modular code structure with controllers, models, routes, and middlewares
- MongoDB database connection using Mongoose
- CORS and cookie handling
- Error and response handling utilities

## Project Structure

 ├── .env # Environment variables ├── package.json # Project metadata and dependencies ├── src/ │ ├── app.js # Express app setup │ ├── index.js # Entry point, server start │ ├── constants.js # App constants (e.g., DB name) │ ├── controllers/ # Route controllers (user logic) │ ├── db/ # Database connection logic │ ├── middlewares/ # Express middlewares (auth, multer) │ ├── models/ # Mongoose models (User, Video, Subscription) │ ├── routes/ # Express route definitions │ └── utils/ # Utility classes (ApiError, ApiResponse, etc.) └── public/ # Static files (uploads, temp


## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB instance (local or cloud)
- Cloudinary account (for file uploads)

### Installation

1. Clone the repository:
    ```sh
    git clone <repo-url>
    cd basic3
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory with the following variables:
    ```
    PORT=8000
    MONGODB_URI=<your-mongodb-uri>
    CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
    CLOUDINARY_API_KEY=<your-cloudinary-api-key>
    CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
    _TOKENACCESS_SECRET=<your-access-token-secret>
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
    REFRESH_TOKEN_EXPIRY=7d
    CORS_ORIGIN=http://localhost:3000
    ```

4. Start the development server:
    ```sh
    npm run dev
    ```

    The server will run at [http://localhost:8000](http://localhost:8000).

## API Endpoints

- `POST /api/v1/users/register` — Register a new user (with avatar and optional cover image)
- `POST /api/v1/users/login` — Login with email/username and password
- `POST /api/v1/users/logout` — Logout user (requires authentication)
- `POST /api/v1/users/refresh-token` — Refresh JWT tokens
- `POST /api/v1/users/change-password` — Change password (requires authentication)
- `GET /api/v1/users/current-user` — Get current user details (requires authentication)
- `PATCH /api/v1/users/update-account` — Update user details (requires authentication)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

ISC

---

**Author:** Dhruv
