# Job Importer Server

Simple job import system with Redis and MongoDB.

Setup:
1. npm install
2. Configure MongoDB/Redis URLs in the existing .env file
3. npm run dev (start server)
4. npm run worker (start worker in another terminal)

API:
- GET /api/feeds - list feeds
- POST /api/feeds - add feed
- GET /api/jobs - list jobs
- GET /api/import-logs - view import history 