# Chat App

A real-time chat application built on the [Laravel](https://laravel.com) framework. 

## Features

- **Real-Time Messaging:** Instant communication with minimal latency using event broadcasting.
- **User Authentication:** Secure login, registration, and session management.
- **Chat Rooms & Direct Messages:** Organize and maintain specific conversations easily.
- **Responsive UI:** Fully optimized for desktop, tablet, and mobile browsers.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- PHP >= 8.1
- [Composer](https://getcomposer.org/)
- [Node.js & NPM](https://nodejs.org/)
- A database engine (e.g., MySQL, PostgreSQL, SQLite)

## Installation and Setup

Follow the instructions below to get your local environment set up:

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repository-url>
   cd chat_app
   ```

2. **Install PHP dependencies**:
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**:
   ```bash
   npm install
   ```

4. **Environment Setup**:
   Duplicate the `.env.example` file to create your local `.env` configuration.
   ```bash
   cp .env.example .env
   ```
   Generate the application key:
   ```bash
   php artisan key:generate
   ```
   *Make sure to configure your database (`DB_*`) settings, and select a `BROADCAST_DRIVER` (such as `pusher` or `reverb`) in the `.env` file for real-time capabilities.*

5. **Run Migrations**:
   ```bash
   php artisan migrate
   ```

6. **Compile Assets & Start the Server**:
   ```bash
   npm run dev
   php artisan serve
   ```
   *If using WebSockets, be sure to also start your WebSocket server alongside the application (e.g., `php artisan reverb:start`).*

## License

This project is open-sourced software licensed under the MIT license.
