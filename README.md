Job Board API
A comprehensive RESTful API for a job board platform that connects jobseekers with recruiters. This API supports user authentication, job postings, applications management, skill tracking, and real-time notifications.

TECHNOLOGY   PURPOSE
Node.js    -  Runtime environment
NestJs     - Backend Framework
TypeScript  -  Programming language 
PostgreSQL - Relational database
Prisma - ORM for database operations 
WebSocket - Real-time notifications

API Modules
🔐 USERS
Handles all user-related operations including authentication and account management.
Authentication Endpoints:
POST /auth/registration/jobseeker - Register as a jobseeker
POST /auth/registration/recruiter - Register as a recruiter
POST /auth/registration/admin - Register as an admin
POST /auth/login - User login (returns JWT token)
POST /auth/logout - User logout
POST /auth/recover - Account recovery

User Management:
GET /users/current - Get current authenticated user
PUT /users/own-details - Update own profile details
DELETE /users/own - Delete own account

Admin Operations:
GET /users/admin/jobseekers - Get all jobseekers
GET /users/admin/recruiters - Get all recruiters
GET /users/admin/{id} - Get user by ID
DELETE /users/admin/{id} - Delete user by ID
GET /users/admin/deleted-account - View all deleted accounts




💼 JOBS
Manages job postings, searches, and recruiter-specific operations.
Public Endpoints:
GET /jobs - Get all available jobs
GET /jobs/job-details/{id} - Get job details by ID
GET /jobs/search?query={keyword} - Search jobs by keyword

Recruiter Operations:
POST /jobs - Create a new job posting
GET /jobs/own-posted-jobs - Get all own posted jobs
GET /jobs/own-posted-jobs/{id} - Get specific own posted job
PATCH /jobs/own-posted-jobs/{id} - Update own posted job
DELETE /jobs/own-posted-jobs/{id} - Delete own posted job

Applicant Management:
GET /jobs/applications/{jobId} - Get all applicants for a job
GET /jobs/applications/{jobId}/{applicationId} - Get specific applicant

Admin Operations:
DELETE /jobs/admin/{id} - Delete any job posting




📝 APPLICATIONS
Handles the job application workflow for jobseekers and recruiters.
Jobseeker Operations:
POST /applications - Apply for a job
GET /applications/me - Get all own applications
GET /applications/me/{id} - Get specific application
PATCH /applications/{id}/cancel - Cancel application
DELETE /applications/me/{id} - Delete unhired application
GET /applications/my-cancelled-applications - View cancelled applications

Recruiter Operations:
PATCH /applications/{id}/status - Update application status (accept/reject)




🔔 NOTIFICATIONS
Real-time notification system with WebSocket support.
REST Endpoints:
POST /notifications - Create notification
GET /notifications - Get all notifications
GET /notifications/{id} - Get specific notification
PATCH /notifications/{id} - Mark as read
DELETE /notifications/{id} - Delete notification

WebSocket Events:
notification:new - New notification received
notification:read - Notification marked as read


🎯 SKILLS
Skill management for jobseeker profiles.
Jobseeker Operations:
POST /skills - Add a new skill
GET /skills/own - Get all own skills
GET /skills/details/{id} - Get skill by ID
PUT /skills/{id} - Update skill
DELETE /skills/{id} - Delete skill

Admin Operations:
GET /skills/admin - Get all skills (platform-wide)
GET /skills/admin/{id} - Get any skill by ID

Authentication
This API uses JWT (JSON Web Token) for authentication. After successful login, include the token in the Authorization header:
Authorization: Bearer {{accessToken}}

User Roles
ROLES       DESCRIPTIONS                   Access Level
Jobseeker - Users looking for employment - Users looking for employment
Recruiter - Users posting job opportunities - Create/manage job postings, review applications, update statuses
Admin - Platform administrators - Full access to all users, jobs, and platform data

Database
PostgreSQL + Prisma
This API leverages PostgreSQL as the relational database with Prisma ORM for type-safe database operations.
Key Features:
Type Safety - Prisma generates TypeScript types from your database schema
Migrations - Version-controlled database schema changes
Relations - Easy handling of one-to-many and many-to-many relationships

Core Entities:
User - Stores user accounts with role differentiation
Job - Job postings created by recruiters
Application - Links jobseekers to jobs with status tracking
Skill - Skills associated with jobseeker profiles
Notification - User notifications with read status


Getting Started
Clone the repository and install dependencies
Configure environment variables (database URL, JWT secret)
Run Prisma migrations: npx prisma migrate dev
Start the server: npm run start:dev
Base URL: http://localhost:8000

