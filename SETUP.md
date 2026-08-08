# 🚀 STB Banking System - Setup Guide

## 📋 Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **MongoDB** 7.0+ ([Download](https://www.mongodb.com/try/download/community))
- **Flutter** 3.24+ ([Install](https://flutter.dev/docs/get-started/install))
- **Docker** (Optional) ([Download](https://www.docker.com/products/docker-desktop/))

---

## ⚙️ Environment Setup

### 1️⃣ Backend Configuration

```bash
cd stb-backend
cp .env.example .env
```

Edit `.env` and configure:
- **MongoDB URI**: Update if using remote database
- **JWT Secrets**: Change to strong random strings in production
- **SMTP Credentials**: Add your email provider credentials
- **Gemini API Key**: Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 2️⃣ Frontend Configuration (Optional)

```bash
cd dashboard_web_stb
# Create .env if needed for API URL overrides
echo "VITE_API_URL=http://localhost:3000" > .env
```

---

## 🏃 Running Locally (Recommended for Development)

### Terminal 1: Start MongoDB

```bash
# Option A: Using local MongoDB
mongod --dbpath ~/data/db

# Option B: Using Docker for MongoDB only
docker run -d -p 27017:27017 --name stb_mongo \
  -e MONGO_INITDB_ROOT_USERNAME=stb_admin \
  -e MONGO_INITDB_ROOT_PASSWORD=stb_secure_pass_2024 \
  mongo:7.0-jammy
```

### Terminal 2: Start Backend API

```bash
cd stb-backend
npm install
npm run start:dev
```

Backend runs on **http://localhost:3000**

### Terminal 3: Start Web Dashboard

```bash
cd dashboard_web_stb
npm install
npm run dev
```

Dashboard runs on **http://localhost:5173**

### Terminal 4: Start Mobile App

```bash
# iOS (requires macOS + Xcode)
flutter run -d ios

# Android
flutter run -d android

# Web
flutter run -d chrome
```

---

## 🐳 Running with Docker (Production)

### Build and start all services:

```bash
docker-compose up --build -d
```

### Services:
- **Backend API**: http://localhost:3000
- **Web Dashboard**: http://localhost:8080
- **MongoDB**: localhost:27017
- **Mongo Express** (dev): http://localhost:8081 (admin/admin123)

### Useful Docker commands:

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f dashboard

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up --build -d

# Stop and remove volumes (fresh start)
docker-compose down -v
```

---

## 📦 Project Structure

```
stb_mobile/
├── stb-backend/              # NestJS Backend API
│   ├── src/
│   ├── .env                  # ⚠️ NOT in git (create from .env.example)
│   └── .env.example          # Template for environment variables
├── dashboard_web_stb/        # React Web Dashboard
│   ├── src/
│   └── vite.config.ts
├── lib/                      # Flutter Mobile App
│   ├── screens/
│   ├── services/
│   └── models/
├── docker-compose.yml        # Docker orchestration
└── .gitignore                # ⚠️ .env files excluded from git
```

---

## 🔐 Security Notes

### ⚠️ **NEVER commit `.env` files to git!**

The `.gitignore` is configured to exclude:
- `.env`
- `.env.*`
- `stb-backend/.env`
- `dashboard_web_stb/.env`

### ✅ **Safe to commit:**
- `.env.example` (template without secrets)

### 🔑 **Production Checklist:**
- [ ] Change all JWT secrets to strong random strings
- [ ] Use production MongoDB with authentication
- [ ] Configure real SMTP credentials
- [ ] Enable HTTPS/TLS
- [ ] Set `NODE_ENV=production`
- [ ] Review CORS origins
- [ ] Enable rate limiting

---

## 🧪 Testing

```bash
# Backend tests
cd stb-backend
npm run test
npm run test:e2e

# Frontend tests
cd dashboard_web_stb
npm run test

# Flutter tests
flutter test
```

---

## 📚 API Documentation

Once backend is running, visit:
- **Swagger UI**: http://localhost:3000/api/v1
- **Health Check**: http://localhost:3000/api/v1/health

---

## 🆘 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# If using Docker
docker ps | grep mongo
docker logs stb_mongo
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Docker Build Issues
```bash
# Clean Docker cache
docker system prune -a --volumes

# Rebuild without cache
docker-compose build --no-cache
```

### Package Lock Sync Issues
```bash
# Regenerate package-lock.json
rm package-lock.json
npm install
```

---

## 📞 Support

For issues or questions:
- Backend: Check `stb-backend/README.md`
- Frontend: Check `dashboard_web_stb/README.md`
- Mobile: Check Flutter documentation

---

## 📝 License

STB Banking System © 2024
