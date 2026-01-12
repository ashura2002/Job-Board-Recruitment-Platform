Job Board API

A comprehensive RESTful API for a job board platform that connects jobseekers with recruiters.
It supports user authentication, job postings, application management, skill tracking, and real-time notifications.

🚀 Features
JWT-based authentication
Job posting and search
Job application workflow
Skill management
Real-time notifications (WebSocket)
Role-based access control (Jobseeker, Recruiter, Admin)

Technology   Stack
Technology	  Purpose
Node.js	      Runtime environment
NestJS	      Backend framework
TypeScript	  Programming language
PostgreSQL	  Relational database
Prisma	      ORM for database operations
WebSocket	    Real-time notifications

API Modules

Users & Authentication
Handles authentication, user management, and admin operations.

Authentication
POST /auth/registration/jobseeker
POST /auth/registration/recruiter
POST /auth/registration/admin
POST /auth/login
POST /auth/logout
POST /auth/recover

User Management
GET    /users/current
PUT    /users/own-details
DELETE /users/own

Admin Operations
GET    /users/admin/jobseekers
GET    /users/admin/recruiters
GET    /users/admin/{id}
DELETE /users/admin/{id}
GET    /users/admin/deleted-account

Jobs
Manages job postings, search, and recruiter operations.

Public Endpoints
GET /jobs
GET /jobs/job-details/{id}
GET /jobs/search?query={keyword}

Recruiter Operations
POST   /jobs
GET    /jobs/own-posted-jobs
GET    /jobs/own-posted-jobs/{id}
PATCH  /jobs/own-posted-jobs/{id}
DELETE /jobs/own-posted-jobs/{id}

Applicant Management
GET /jobs/applications/{jobId}
GET /jobs/applications/{jobId}/{applicationId}

Admin Operations
DELETE /jobs/admin/{id}

Applications
Handles the job application lifecycle.

Jobseeker Operations
POST   /applications
GET    /applications/me
GET    /applications/me/{id}
PATCH  /applications/{id}/cancel
DELETE /applications/me/{id}
GET    /applications/my-cancelled-applications

Recruiter Operations
PATCH /applications/{id}/status

Notifications
Real-time notification system using WebSocket.

REST Endpoints
POST   /notifications
GET    /notifications
GET    /notifications/{id}
PATCH  /notifications/{id}
DELETE /notifications/{id}

WebSocket Events
notification:new   → New notification received
notification:read  → Notification marked as read


Skills
Manages jobseeker skills.

Jobseeker Operations
POST   /skills
GET    /skills/own
GET    /skills/details/{id}
PUT    /skills/{id}
DELETE /skills/{id}

Admin Operations
GET /skills/admin
GET /skills/admin/{id}


Authentication
This API uses JWT (JSON Web Token) authentication.
Include the token in the request header: Authorization: Bearer {{accessToken}}


User Roles
Role	      Description                    	  Access Level
Jobseeker	  Users looking for employment	    Apply for jobs, manage skills
Recruiter	  Users posting job opportunities	  Manage jobs & applications
Admin	      Platform administrators	          Full system access


Database
PostgreSQL + Prisma ORM
Prisma provides:
Type-safe database access
Schema migrations
🔗 Relationship management
Core Entities
User – Role-based user accounts
Job – Job postings
Application – Job applications with status tracking
Skill – Jobseeker skills
Notification – User notifications with read state


Getting Started

Clone the Repository
git clone <repository-url>
cd job-board-api

Install Dependencies
npm install

Configure Environment Variables
DATABASE_URL=
JWT_SECRET=

Run Database Migrations
npx prisma migrate dev

Start the Server
npm run start:dev

Base URL
http://localhost:8000



