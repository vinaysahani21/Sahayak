# Sahaayak: Hyper-Local On-Demand Home Services Platform

Sahaayak is a full-stack, hyper-local service marketplace (similar to Urban Company) built to bridge the gap between local service providers and customers. It features a premium "tech-giant" aesthetic, a multi-step partner onboarding process, secure Razorpay payment integration, and a comprehensive dashboard for both providers and customers.

# 🚀 Features

For Customers:

Elite Search: Browse verified professionals with a high-end, filtered search experience.
Secure Booking: Multi-step checkout with address management and date/time slot selection.
Live Tracking: Real-time job status tracking via an interactive activity timeline.
Integrated Payments: Secure checkout using Razorpay with automated platform commission splitting.

For Providers:

Business Dashboard: Comprehensive overview of revenue, jobs completed, and average ratings.
Smart Schedule: Daily job management with map integration and "Complete & Bill" workflow.
Wallet & Payouts: Track earnings, pending settlements, and request bank transfers directly.
Service Catalog: Manage personal service offerings, pricing, and descriptions.

# 🛠️ Tech Stack

Frontend: React.js, Tailwind CSS, Vite, Lucide/FontAwesome Icons.
Backend: PHP (OOP & Prepared Statements for Security).
Database: MySQL.
Payments: Razorpay API Integration.
Authentication: Custom JWT-like session management with local storage persistence.

# 📂 Project Structure
Plaintext
Sahaayak-App/
├── frontend/              # React.js source code (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components (Dialog, Sidebar, etc.)
│   │   ├── pages/         # Page components (Customer, Provider, Admin)
│   │   └── constants/     # API URLs and Status definitions
│   └── .env               # Frontend environment variables
├── backend/               # PHP API files
│   ├── admin/             # Admin management endpoints
│   ├── user/              # Customer-specific logic (Search, Booking, Razorpay)
│   ├── provider/          # Provider business logic
│   ├── connection.php     # MySQL Database connection
│   └── .env               # Backend sensitive credentials
└── DB/                    # Database Export
    └── sahayak.sql        # Database schema and seed data

# 🏁 Getting Started

Follow these steps to set up the project locally on your machine.

1. Prerequisites
XAMPP / WAMP installed for PHP and MySQL.
Node.js (v16+) and npm installed for the React frontend.
Razorpay Test Keys (Sign up at Razorpay Dashboard).

2. Database Setup
Open phpMyAdmin.
Create a new database named sahayak.
Import the DB/sahayak.sql file provided in the repository.

3. Backend Configuration
Move the backend/ folder to your htdocs directory (e.g., C:\xampp\htdocs\Sahaayak-BE).
Create a .env file in the root of the backend folder:

Code snippet
RAZORPAY_KEY_ID=rzp_test_your_id
RAZORPAY_KEY_SECRET=your_secret_key
Ensure connection.php has your correct database credentials (username, password).

4. Frontend Configuration
Open the frontend/ folder in your terminal.

Install dependencies:

npm install
Create a .env file in the frontend/ root:

Code snippet
VITE_API_BASE_URL=http://localhost/Sahaayak-BE/
VITE_RAZORPAY_KEY_ID=rzp_test_your_id
Start the development server:

npm run dev

# 🛡️ Security Measures

Environment Variables: Sensitive API keys are never hardcoded and are managed via .env.
SQL Injection Prevention: All PHP endpoints utilize MySQLi prepared statements.
CORS Protection: Secure headers implemented to control API access.
Role-Based Access Control (RBAC): Layout wrappers ensure users can only access dashboards corresponding to their role.

# Developed By Vinay Sahani