# 🌊 JobTidal — Job & Placement Portal

A full-stack job portal web application where companies can post jobs, users can apply, and admins can manage everything from a dashboard.

🔗 **Live Site:** [https://jobtidalplatform.netlify.app](https://jobtidalplatform.netlify.app)

---

## 🚀 Features

- 🔐 **Authentication** — Register & Login with JWT tokens
- 👤 **Role-based Access** — User, Company, Admin roles
- 💼 **Browse Jobs** — Search and filter job listings
- 📩 **Apply for Jobs** — Submit applications with name, email, resume & note
- 🏢 **Post Jobs** — Company/Admin can post new job listings
- 📊 **Admin Dashboard** — View all jobs and applicants
- 🌙 **Dark Mode** — Toggle dark/light theme
- 📱 **Responsive** — Works on mobile and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| Frontend Hosting | Netlify |
| Backend Hosting | Render |

---

## 📁 Project Structure

```
JOBTIDAL/
├── index.html          # Frontend (single page app)
└── backend/
    ├── server.js       # Express backend
    ├── package.json    # Dependencies
    └── .env            # Environment variables (not committed)
```

---

## ⚙️ API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Health check |
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login and get token |
| GET | `/jobs` | Public | Get all jobs |
| POST | `/jobs` | Company/Admin | Post a new job |
| POST | `/apply/:id` | User (logged in) | Apply for a job |
| GET | `/applications/:id` | Admin only | View applications for a job |

---

## 🔧 Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/meshramshreya28-code/jobtidal.git
cd jobtidal
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
PORT=3000
```

Start the server:
```bash
node server.js
```

### 3. Setup Frontend
Open `index.html` in your browser, or use Live Server in VS Code.

Make sure this line in `index.html` points to your backend:
```js
const API = 'https://jobtidal-backend.onrender.com';
```

---

## 🌐 Deployment

| Service | Purpose | Link |
|---------|---------|------|
| Netlify | Frontend hosting | [netlify.com](https://netlify.com) |
| Render | Backend hosting | [render.com](https://render.com) |
| MongoDB Atlas | Cloud database | [mongodb.com/atlas](https://mongodb.com/atlas) |

---

## 👤 User Roles

| Role | Can Do |
|------|--------|
| `user` | Browse jobs, apply for jobs |
| `company` | Post jobs, browse jobs |
| `admin` | Everything + view all applications |

---

## 📸 Screenshots

> Live at: [https://jobtidalplatform.netlify.app](https://jobtidalplatform.netlify.app)

---

## 👩‍💻 Developer

**Shreya Meshram**
- GitHub: [@meshramshreya28-code](https://github.com/meshramshreya28-code)
- LinkedIn: [Shreya Meshram](https://www.linkedin.com/in/shreya-meshram)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).