# Job Dashboard

Shows jobs from websites on a dashboard.

## What you need
1. Node.js 
2. MongoDB
3. Redis

## How to run

**Step 1: Start Server**
```bash
cd server
npm install
npm run dev
```

**Step 2: Start Worker**
```bash
cd server
npm run worker
```

**Step 3: Start Front**
```bash
cd client
npm install
npm run dev
```

**Step 4: Open browser**
Go to: `http://localhost:3001`

## Done!
You now have a job dashboard that updates by itself when cron job is run!
