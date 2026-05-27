# API KOPMA UNNES

Backend service for KOPMA UNNES, built with Next.js App Router and API routes. This project powers the API system for `api.ukmkopmaunnes.com`.

---

## About

API KOPMA UNNES is a backend-focused web service developed to support the digital ecosystem of KOPMA UNNES. It provides API endpoints, authentication flow, admin access, file uploads, and server-side logic for organizational systems.

This project is designed to be maintainable, scalable, and suitable for production deployment.

---

## Project Structure

```bash
.
├── public/
│   ├── uploads/
│   ├── file.svg
│   ├── globe.svg
│   ├── logokopma1.png
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   └── app/
│       ├── admin/
│       ├── api/
│       ├── login/
│       ├── favicon.ico
│       ├── globals.css
│       ├── layout.js
│       └── page.js
├── lib/
├── proxy.js
├── .gitignore
├── README.md
├── eslint.config.mjs
├── generate-hash.js
├── jsconfig.json
├── next.config.mjs
├── package-lock.json
├── package.json
└── postcss.config.mjs
```

---

## Main Features

- API route handling with Next.js App Router
- Admin page
- Login page
- File upload storage
- Server-side utility functions
- Proxy configuration
- Password hash generation utility
- Production-ready project structure
- Public asset management

---

## Main Routes

| Route | Description |
|---|---|
| `/` | Main entry page |
| `/login` | Login page |
| `/admin` | Admin dashboard |
| `/api` | API route directory |

---

## Tech Stack

### Core
- Next.js
- React.js
- JavaScript
- Node.js

### Styling
- CSS
- PostCSS

### Development Tools
- ESLint
- Git & GitHub

### Deployment
- Vercel / VPS / Node.js Server

---

## Getting Started

### Clone Repository

```bash
git clone https://github.com/your-username/your-repository.git
```

### Navigate to Project Directory

```bash
cd your-repository
```

### Install Dependencies

```bash
npm install
```

---

## Running Development Server

Start the development server:

```bash
npm run dev
```

Open your browser:

```bash
http://localhost:3000
```

---

## Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

---

## Available Scripts

```bash
npm run dev
```
Run the application in development mode.

```bash
npm run build
```
Build the application for production.

```bash
npm run start
```
Start the production server.

```bash
npm run lint
```
Run ESLint checks.

---

## Environment Variables

Create a `.env.local` file in the root directory.

```env
NEXT_PUBLIC_APP_NAME=API_KOPMA_UNNES
NEXT_PUBLIC_BASE_URL=https://api.ukmkopmaunnes.com

DATABASE_URL=
JWT_SECRET=
ADMIN_USERNAME=
ADMIN_PASSWORD_HASH=
UPLOAD_DIR=public/uploads
```

Adjust the variables based on the production environment and backend requirements.

---

## Uploads Directory

Uploaded files are stored inside:

```bash
public/uploads/
```

Make sure the directory has proper read/write permissions when deployed on a VPS or custom Node.js server.

---

## Password Hash Utility

This project includes:

```bash
generate-hash.js
```

This file can be used to generate a hashed password for admin authentication.

Example usage:

```bash
node generate-hash.js
```

---

## Documentation Structure

Recommended documentation structure:

```bash
docs/
├── setup.md
├── deployment.md
├── architecture.md
├── api-reference.md
├── authentication.md
├── uploads.md
└── contribution.md
```

| File | Description |
|---|---|
| `setup.md` | Local installation and setup guide |
| `deployment.md` | Production deployment guide |
| `architecture.md` | System architecture and folder explanation |
| `api-reference.md` | API endpoint documentation |
| `authentication.md` | Login and authentication flow |
| `uploads.md` | File upload and storage documentation |
| `contribution.md` | Contribution workflow and coding standards |

---

## Deployment

This project can be deployed to:

- Vercel
- VPS with Node.js
- Docker-based server
- Reverse proxy environment using Nginx

Recommended production domain:

```bash
https://api.ukmkopmaunnes.com
```

Build command:

```bash
npm run build
```

Start command:

```bash
npm run start
```

---

## Production Notes

Before deploying to production:

- Configure environment variables
- Set secure `JWT_SECRET`
- Generate admin password hash
- Ensure upload directory permissions
- Enable HTTPS
- Configure reverse proxy if using VPS
- Restrict access to sensitive admin routes
- Validate all API inputs
- Monitor server logs regularly

---

## Security Recommendations

- Never commit `.env.local`
- Use strong admin credentials
- Store passwords as hashes
- Validate uploaded file types
- Limit upload file size
- Use HTTPS in production
- Rotate secrets periodically
- Protect admin routes with authentication middleware

---

## Repository

GitHub Repository:

```bash
https://github.com/your-username/your-repository
```

---

## Maintainer

KOPMA UNNES Development Team

---

## License

This project is developed for organizational and educational purposes under KOPMA UNNES.
