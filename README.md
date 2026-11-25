# JobFinder – Job Portal

A complete job portal with registration, login, job listings, apply, and profile features.

Works **locally** and is ready for **one-click deploy on Vercel**.

## Features

- User registration & login (password hashed with SHA-256 + salt)
- Job categories & featured jobs
- Apply to jobs
- User profile with resume filename
- Pure Node.js backend (no external dependencies)
- Data stored in JSON (local file or `/tmp` on Vercel)

## Local Development

```bash
# No npm install needed
node server.js
# or
npm start
```

Open → http://localhost:5000

## Deploy to Vercel

### Option 1 – Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option 2 – GitHub
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import the repo
3. Deploy (zero configuration needed)

After deploy the live URL will work for both frontend and `/api/*` routes.

## Project Structure

```
jobfinder/
├── index.html          # Home / job listings
├── login.html
├── register.html
├── profile.html
├── style.css
├── home.js / login.js / script.js / profile.js
├── server.js           # Local full server
├── api/                # Vercel serverless functions
│   ├── register.js
│   ├── login.js
│   ├── apply.js
│   └── profile.js
├── lib/store.js        # Shared data layer
├── package.json
└── vercel.json
```

## API Endpoints

| Method | Endpoint       | Body                                      | Description          |
|--------|----------------|-------------------------------------------|----------------------|
| POST   | /api/register  | `{ name, email, password, phone }`        | Create account       |
| POST   | /api/login     | `{ email, password }`                     | Login                |
| POST   | /api/apply     | `{ user_id, job_id }`                     | Apply to a job       |
| POST   | /api/profile   | profile fields                            | Save / update profile|

## Notes

- On Vercel the data file lives in `/tmp` (ephemeral). For production you should replace the store with a real database (Postgres, MongoDB, Turso, etc.).
- Frontend falls back gracefully when the API is unreachable.
