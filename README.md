# 🔗 Django URL Shortener API

![Python](https://img.shields.io/badge/Python-3.11-blue.svg)
![Django](https://img.shields.io/badge/Django-5.x-green.svg)
![DRF](https://img.shields.io/badge/DRF-3.x-red.svg)
![Status](https://img.shields.io/badge/status-Completed-brightgreen)

A clean, secure and token-authenticated **URL Shortener REST API** built using Django and Django REST Framework.

---

## 🚀 Features

- 🔐 User Registration and Token-based Authentication
- ✂️ URL Shortening with unique short codes
- 📊 URL Click Statistics per User
- 🔁 Redirection to original URL via short code
- 🧪 Postman/Testable Endpoints
- 🌱 Fully functional API backend – ready to plug into a frontend

---

## 🛠️ Tech Stack

- **Backend**: Django, Django REST Framework
- **Database**: SQLite (default, can be swapped with MySQL/PostgreSQL)
- **Auth**: Token-based Authentication via `rest_framework.authtoken`

---

## 📁 Project Structure

```
url_shortener/
├── shortener/
│   ├── migrations/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
├── url_shortener/
│   ├── settings.py
│   ├── urls.py
├── .env
├── db.sqlite3
├── requirements.txt
└── manage.py
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Shuvra-458/URL-Shortener.git
cd django-url-shortener
```

### 2️⃣ Setup Virtual Environment
```bash
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

### 3️⃣ Install Requirements
```bash
pip install -r requirements.txt
```

### 4️⃣ Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5️⃣ Start the Server
```bash
python manage.py runserver
```

---

## 🔐 Authentication

This project uses **Token-based Auth**:

- Get your token via `/login/`
- Then include it in the headers of all protected routes:
```
Authorization: Token your_token_here
```

---

## 📬 API Endpoints

| Method | Endpoint              | Description                     | Auth Required |
|--------|-----------------------|---------------------------------|---------------|
| POST   | `/register/`          | Register a new user             | ❌ No         |
| POST   | `/login/`             | Login and get token             | ❌ No         |
| POST   | `/logout/`            | Logout (invalidate token)       | ✅ Yes        |
| POST   | `/shorten/`           | Shorten a long URL              | ✅ Yes        |
| GET    | `/s/<short_code>/`    | Redirect to original URL        | ❌ No         |
| GET    | `/stats/`             | Get stats of user’s URLs        | ✅ Yes        |

---

## 📦 Example JSON Payloads

### Register
```json
POST /register/
{
  "username": "shuvrajyoti",
  "password": "supersecret"
}
```

### Login
```json
POST /login/
{
  "username": "shuvrajyoti",
  "password": "supersecret"
}
```

### Shorten URL
```json
POST /shorten/
Headers: Authorization: Token <your_token>
{
  "original_url": "https://www.example.com"
}
```

### Stats
```http
GET /stats/
Headers: Authorization: Token <your_token>
```

---

## 📄 License

This project is licensed under the MIT License.

---

## ✨ Author

**Shuvrajyoti Nayak**  
🔗 [GitHub](https://github.com/YOUR_USERNAME)  
📧 Email: your.email@example.com

---

> 💡 *Feel free to fork this repo, contribute or use this as a boilerplate for any URL-based microservice idea.*
