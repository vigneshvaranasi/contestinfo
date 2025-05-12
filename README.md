# TrackCode API

Scrapes coding contest data, analyzes student performance, and delivers stats, rewinds, and insights from platforms like CodeChef, LeetCode, and Codeforces.

- **API Link** → [https://api.trackcode.in](https://api.trackcode.in/)
- **Frontend Repository** → https://github.com/pavancos/trackcode
- **Website** → [https://trackcode.in](https://trackcode.in/)
---

## Table of Contents

1. [Overview](#overview)
   - [Brief Description](#brief-description)
   - [Purpose of the Backend](#purpose-of-the-backend)
   - [Tech Stack](#tech-stack)
2. [Quick Start](#quick-start)
   - [Clone Instructions](#clone-instructions)
   - [Environment Variables (.env)](#environment-variables-env)
   - [Run Commands](#run-commands)
3. [API Endpoints](#api-endpoints)
4. [Contributors](#contributors)

---

## Overview

### Brief Description

TrackCode backend service powers a coding analytics platform by scraping and processing data from major competitive programming platforms like CodeChef, LeetCode, and Codeforces. It collects individual and batch performance data using scheduled scrapers, organizes the information in a structured database, and exposes APIs to serve personalized statistics, leaderboard views, contest analysis, and yearly rewind summaries for students.

### Purpose of the Backend

- Handle user authentication and authorization.
- Store and retrieve contest participation data.
- Provide APIs for frontend visualization.

### Tech Stack

- **Node.js** + **Express.js** – Core backend framework
- **MongoDB** – NoSQL database
- **Mongoose** – ODM for MongoDB

---

## Quick Start

### Clone Instructions
```bash
# Clone the repo
git clone <https://github.com/vigneshvaranasi/trackcode-api.git>
cd trackcode-api

# Install dependencies
npm install

# Create and configure .env file
cp .env.example .env

# Run the server
npm run dev
```

---

### Environment Variables (`.env`)

```
DB_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/trackcode?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
PORT=8000
API_USERNAME=your_clist_username
API_KEY=your_clist_api_key
REFRESH_KEY=your_refresh_secret
```

### Run Commands

```bash
npm run dev
```
---

## API Endpoints

> API Overview → **http://localhost:8000/v2**


| Module | Base Path | Description |
| --- | --- | --- |
| Batch Data | /batch | Endpoints for batch-related operations |
| Student Data | /student | Endpoints for student-related operations |
| Contest Data | /contest | Endpoints for contest-related operations |
| Upcoming Contests | /getUpcoming | Endpoints for fetching upcoming contests |
| Authentication | /auth | Endpoints for authentication-related operations |
| Admin | /admin | Endpoints for admin-specific operations |
| Developer | /dev | Endpoints for developer-specific operations |

> Health Check Route


| Method | Path | Description | Auth Required |
| --- | --- | --- | --- |
| GET | / | Welcome message for the Contest Info Server V2 | No |

> API for getting batch details → **http://localhost:8000/v2/batch**


| Method | Path | Description | Auth Required |
| --- | --- | --- | --- |
| GET | /health | Health check for the Batch Data endpoint | No |
| GET | /getYearsBranches | Fetch distinct years and branches of students | No |
| GET | /yearBranch | Fetch students by year and branch with performance | No |
| GET | /branch | Fetch students by branch with performance | No |
| GET | /year | Fetch students by year with performance | No |
| GET | /views | Fetch all available views | No |
| POST | /view | Fetch students for a specific view by view name | No |
| GET | / | Fetch all students with performance data | No |

> API for getting student details → **http://localhost:8000/v2/student**

| Method | Path | Description | Auth Required |
| --- | --- | --- | --- |
| GET | /health | Health check for the Student Data endpoint | No |
| GET | / | Fetch student details by roll number | No |

> API for getting contest details → **http://localhost:8000/v2/contest**


| Method | Path | Description | Auth Required |
| --- | --- | --- | --- |
| GET | /getContests | Fetch a paginated list of contests | No |
| GET | / | Fetch contest details by contest name | No |
| GET | /id/:id | Fetch contest details by contest ID | No |
| GET | /branch | Fetch contest participants filtered by branch | No |
| GET | /year | Fetch contest participants filtered by year | No |
| GET | /contestName/branch | Fetch contest participants filtered by year and branch | No |

> API for getting upcoming contests → **http://localhost:8000/v2/getUpcoming**


| Method | Path | Description | Auth Required |
| --- | --- | --- | --- |
| GET | /latest | Fetch and store the latest upcoming contests | No |
| GET | / | Fetch upcoming contests starting after the current date | No |

> API for authentication → **http://localhost:8000/v2/auth**


| Method | Path | Description | Auth Required |
| --- | --- | --- | --- |
| POST | /login | Login and get a JWT token | No |
| POST | /verify | Verify the validity of a JWT token | Yes |

> API for admin operations → **http://localhost:8000/v2/admin**


| Method | Path | Description | Auth Required |
| --- | --- | --- | --- |
| POST | /vmRefresh | Refresh all data from VM | Yes |
| GET | /batches | Get all batches with year, branch, and student count | Yes |
| POST | /students | Get all students in a batch by year and branch | Yes |
| POST | /newStudent | Create a new student | Yes |
| POST | /updateStudent | Update an existing student | Yes |
| PUT | /refreshStudent | Refresh data of a specific student | Yes |
| DELETE | /deleteStudent | Delete a specific student | Yes |
| DELETE | /deleteBatch | Delete all students in a batch | Yes |
| POST | /newView | Create a new view with a list of roll numbers | Yes |
| DELETE | /deleteView | Delete a specific view | Yes |
| POST | /addStudentsToView | Add students to an existing view | Yes |
| POST | /removeStudentsFromView | Remove students from an existing view | Yes |
| POST | /viewStudents | Fetch all students in a specific view | Yes |
| POST | /fullRefresh | Perform a full refresh of all data | Yes |
| POST | /rollRefresh | Refresh data of specific students by roll numbers | Yes |
| POST | /batchRefreshByBatch | Refresh data of a batch by year and branch | Yes |
| POST | /refreshView | Refresh data of a specific view | Yes |

> API for developer operations → **http://localhost:8000/v2/dev**


| Method | Path | Description | Auth Required |
| --- | --- | --- | --- |
| POST | /newAdmin | Create a new admin user | Yes |

---

## Contributors

Built by DevDuo
- [Vignesh Varanasi](https://github.com/vigneshvaranasi)
- [Pavan Kumar Chennupati](https://github.com/pavancos)

---

> Feel free to contribute or fork the project if you're interested in backend systems for developer platforms!
