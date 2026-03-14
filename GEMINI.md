# 🔐 Password Manager (Cofre de Palavras-Passe)

Project context and instructional guidance for the Password Manager full-stack application.

## 🚀 Project Overview

The Password Manager is a secure full-stack application designed for managing and storing user credentials. It features a robust security architecture including master password hashing and per-item encryption for vault entries.

### 🏗️ Architecture & Tech Stack

- **Backend:** ASP.NET Core Web API (C#, .NET 10)
  - **Database:** PostgreSQL via Entity Framework Core (Npgsql)
  - **Authentication:** JWT (JSON Web Tokens)
  - **Security:** BCrypt for password hashing, AES-256 for vault encryption.
- **Frontend:** React 18 (TypeScript)
  - **Build Tool:** Vite
  - **Routing:** React Router DOM
  - **State Management:** React Context (AuthContext)
  - **UI/Feedback:** SweetAlert2, Vanilla CSS
- **Infrastructure:** Docker & Docker Compose

## 🛠️ Building and Running

### 🐳 Using Docker (Recommended)
From the root directory:
```bash
docker-compose up --build
```
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **PostgreSQL:** Port `5432`

### 💻 Manual Execution (Local Development)

#### Backend
```bash
cd backend
dotnet restore
dotnet ef database update # Applies migrations to the database
dotnet run
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

- **Backend (xUnit):** `dotnet test` (Run from `backend/` or `backend/PasswordManagerAPI.Tests/`)
- **Frontend (Vitest):** `npm run test` (Run from `frontend/`)

## 🛡️ Security Architecture

- **User Authentication:** Master passwords are never stored in plain text. **BCrypt** is used for secure hashing during registration and login.
- **Vault Encryption:** Sensitive credentials (passwords for other sites) are encrypted using **AES-256**.
- **Initialization Vector (IV):** A unique, random IV is generated for *every* encryption operation and prepended to the ciphertext.
- **JWT Protection:** All `/api/vault` endpoints require a valid `Authorization: Bearer <token>` header.

## 📁 Key Directories

- `backend/`: ASP.NET Core API project.
  - `Controllers/`: API endpoints (`AuthController`, `VaultController`).
  - `Services/`: Core logic (`EncryptionService`, `TokenService`).
  - `Models/`: Entity definitions (`User`, `VaultItem`).
  - `Data/`: DB Context and Migrations.
- `frontend/`: React application.
  - `src/pages/`: Dashboard, Login, Register views.
  - `src/context/`: Auth state management.
  - `src/services/`: API communication (Axios).

## 📝 Development Conventions

- **Code Style:** Standard C# and React (functional components) naming conventions.
- **API Design:** RESTful endpoints under `/api/`.
- **Formatting:** ESLint and Prettier are configured for the frontend.
- **Database:** Migrations should be generated via `dotnet ef migrations add <Name>` when schema changes occur.
