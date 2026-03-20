# Complete Setup Guide — Government College Management System

## Prerequisites
- Node.js >= 18.x
- MySQL >= 8.0
- npm or yarn
- Git
- AWS Account (for production)

---

## STEP 1: Clone the Repository

```bash
git clone https://github.com/yourusername/college-management-system.git
cd college-management-system
```

---

## STEP 2: MySQL Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run the schema file
mysql -u root -p < database/schema.sql

# OR run manually:
mysql> SOURCE /path/to/database/schema.sql;
```

Verify tables:
```sql
USE college_db;
SHOW TABLES;
-- Should show: users, students, teachers, alumni, courses, attendance, marks,
--              assignments, submissions, rooms, bookings, surveys, survey_responses,
--              notifications, timetable, departments, announcements, audit_logs
```

---

## STEP 3: Backend Setup (Node.js/Express)

```bash
cd server
npm init -y

# Install dependencies
npm install express cors bcryptjs jsonwebtoken mysql2 multer dotenv
npm install --save-dev nodemon

# Create uploads directory
mkdir -p uploads/submission uploads/profile uploads/misc
```

Create `server/.env`:
```env
# Server
PORT=5000
NODE_ENV=development

# Database (Local)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=college_db
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production_2025
JWT_EXPIRES=7d

# OpenAI (for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Google Maps (for room mapping)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# AWS S3 (for file storage in production)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=college-management-files

# Email (optional notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password

# Frontend URL
CLIENT_URL=http://localhost:3000
```

Create `server/package.json` scripts:
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest --coverage"
  }
}
```

Start backend:
```bash
npm run dev
# Server runs on http://localhost:5000
# Test: curl http://localhost:5000/api/health
```

---

## STEP 4: Frontend Setup (React)

The frontend is a single `index.html` file in the project root using React via CDN. For production with React CLI:

```bash
# Create React App (for production build)
npx create-react-app client --template cra-template
cd client

# Install dependencies
npm install axios react-router-dom @mui/material chart.js react-chartjs-2
npm install tailwindcss @headlessui/react @heroicons/react
npm install react-hot-toast react-hook-form

# Setup Tailwind
npx tailwindcss init
```

Update `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_KEY=your-google-maps-key
REACT_APP_ENV=development
```

```bash
npm start
# React app runs on http://localhost:3000
```

---

## STEP 5: Google Maps Integration

In your frontend, replace the map placeholder with:

```javascript
// Install: npm install @react-google-maps/api
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const CAMPUS_ROOMS = [
  { id: 'R101', name: 'Room 101', lat: 12.9716, lng: 77.5946, type: 'Classroom' },
  { id: 'L101', name: 'CS Lab', lat: 12.9720, lng: 77.5950, type: 'Lab' },
  // ... add your actual campus coordinates
];

function CampusMap({ rooms }) {
  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        center={{ lat: 12.9716, lng: 77.5946 }}
        zoom={17}
      >
        {rooms.map(room => (
          <Marker
            key={room.id}
            position={{ lat: room.lat, lng: room.lng }}
            icon={{
              url: room.booked 
                ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
            }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}
```

---

## STEP 6: OpenAI Integration

```bash
npm install openai
```

Replace the demo AI response in `server/index.js`:

```javascript
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/ai/chat', authenticate, async (req, res) => {
  const { message, context } = req.body;
  
  // Fetch student context from DB
  const [studentData] = await db.query(
    `SELECT u.name, s.cgpa, s.semester, 
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('subject',c.name,'percent',att.pct)) FROM ...)
     FROM users u JOIN students s ON u.id = s.user_id WHERE u.id = ?`,
    [req.user.id]
  );
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are an academic assistant for Government College. 
                  Student: ${studentData[0].name}, CGPA: ${studentData[0].cgpa}.
                  Provide helpful, concise academic guidance.`
      },
      { role: 'user', content: message }
    ],
    max_tokens: 500
  });
  
  res.json({ reply: completion.choices[0].message.content });
});
```

---

## STEP 7: Test the Application

```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@college.edu","password":"admin123"}'

# Test students (use token from above)
curl http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Test health
curl http://localhost:5000/api/health
```

Open browser: `http://localhost:3000` (or open `index.html` for demo)

---

## STEP 8: AWS Deployment

### A) AWS RDS (MySQL)

```bash
# In AWS Console:
1. Go to RDS → Create database
2. Choose MySQL 8.0
3. Template: Free tier (dev) or Production (prod)
4. DB identifier: college-db
5. Username: admin
6. Password: YourSecurePassword123!
7. VPC: Same as your EC2
8. Public access: No (private)
9. Security group: Allow port 3306 from EC2

# After creation, note the endpoint:
# college-db.xxxxxxxx.ap-south-1.rds.amazonaws.com

# Run schema on RDS:
mysql -h college-db.xxxxxxxx.ap-south-1.rds.amazonaws.com -u admin -p < database/schema.sql
```

### B) AWS EC2 (Backend)

```bash
# Launch EC2:
# AMI: Ubuntu 22.04 LTS
# Type: t3.small (dev) / t3.medium (prod)
# Security Group: Allow ports 22, 80, 443, 5000

# SSH into EC2:
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone project
git clone https://github.com/yourusername/college-management-system.git
cd college-management-system/server

# Install PM2 (process manager)
sudo npm install -g pm2

# Setup environment
nano .env
# (fill in your RDS endpoint, JWT secret, OpenAI key, etc.)

# Install dependencies
npm install --production

# Start with PM2
pm2 start index.js --name "college-api"
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/college-api
```

Nginx config (`/etc/nginx/sites-available/college-api`):
```nginx
server {
    listen 80;
    server_name api.college.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /uploads/ {
        alias /home/ubuntu/college-management-system/server/uploads/;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/college-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup HTTPS with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.college.yourdomain.com
```

### C) AWS S3 (Frontend)

```bash
# Build React app
cd client
npm run build

# Create S3 bucket
aws s3 mb s3://college-management-frontend

# Enable static website hosting
aws s3 website s3://college-management-frontend \
  --index-document index.html \
  --error-document index.html

# Make bucket public
aws s3api put-bucket-policy --bucket college-management-frontend \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{"Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::college-management-frontend/*"}]
  }'

# Upload build files
aws s3 sync build/ s3://college-management-frontend

# Setup CloudFront for HTTPS (optional but recommended)
# Create CloudFront distribution pointing to S3 bucket
```

---

## STEP 9: GitHub CI/CD (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy College Management System

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install & Test Backend
        run: |
          cd server
          npm install
          npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/college-management-system
            git pull origin main
            cd server
            npm install --production
            pm2 restart college-api

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Build Frontend
        env:
          REACT_APP_API_URL: ${{ secrets.API_URL }}
        run: |
          cd client
          npm install
          npm run build
      - name: Deploy to S3
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1
      - run: aws s3 sync client/build/ s3://${{ secrets.S3_BUCKET }} --delete
      - run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DIST_ID }} --paths "/*"
```

### GitHub Secrets to configure:
```
EC2_HOST          = your-ec2-public-ip
EC2_SSH_KEY       = (paste your .pem file contents)
API_URL           = https://api.college.yourdomain.com/api
AWS_ACCESS_KEY_ID = your-aws-key
AWS_SECRET_ACCESS_KEY = your-aws-secret
S3_BUCKET         = college-management-frontend
CF_DIST_ID        = your-cloudfront-distribution-id (optional)
```

---

## STEP 10: GitHub Push Commands

```bash
# Initialize git (if not done)
git init
git remote add origin https://github.com/yourusername/college-management-system.git

# Initial commit
git add .
git commit -m "feat: Initial commit - Government College Management System v2.0

- React.js + Tailwind CSS frontend with 4 role dashboards
- Node.js + Express.js REST API backend
- MySQL database with complete schema (20+ tables)
- JWT authentication with role-based access
- Smart room booking system
- AI-powered chatbot and performance summaries
- Survey & feedback analytics
- Alumni network module
- Attendance & marks management
- GitHub Actions CI/CD pipeline
- AWS deployment ready (EC2 + S3 + RDS)"

git branch -M main
git push -u origin main

# Future commits
git add .
git commit -m "fix: Update attendance calculation logic"
git push

# Feature branch workflow
git checkout -b feature/ai-chatbot
git add .
git commit -m "feat: Add OpenAI GPT-4 chatbot integration"
git push origin feature/ai-chatbot
# Create Pull Request on GitHub → Merge to main → CI/CD auto-deploys
```

---

## Environment Files Summary

### server/.env (never commit!)
```
PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME,
JWT_SECRET, OPENAI_API_KEY, GOOGLE_MAPS_API_KEY,
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME
```

### client/.env
```
REACT_APP_API_URL, REACT_APP_GOOGLE_MAPS_KEY
```

Add to `.gitignore`:
```
node_modules/
.env
.env.local
server/uploads/
*.log
build/
dist/
```
