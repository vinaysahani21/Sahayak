<div align="center">

# 🛡️ Sahaayak
The Modern Operating System for Local Home Services

Sahaayak is a hyper-local, on-demand marketplace connecting households with verified service professionals. Engineered for speed, trust, and scale, it features a multi-portal architecture serving Customers, Service Providers, and Platform Administrators.

</div>

## ✨ Key Features
### 1. The Admin Command Center
A "God-Tier" administrative workspace providing absolute control over platform operations.

- Identity Management: Unified directory to view, filter, and suspend/activate Customer and Provider accounts.

- KYC & Verification: Review and approve/revoke provider credentials with a single click.

- Dynamic Service Catalog: Manage platform service categories using a built-in visual FontAwesome icon picker.

- Master Ledger: Real-time tracking of all platform bookings, statuses, and transaction values.

- Financial Payouts: Review provider withdrawal requests, track platform commission, and mark bank transfers as settled.

### 🛠️ 2. The Provider Workspace
A dedicated SaaS-like dashboard empowering professionals to run their independent businesses.

- Service Catalog: Providers can add, price, and manage their specific offerings.

- Interactive Schedule: View upcoming appointments, track history, and generate final invoices for customers.

- Digital Wallet: Track lifetime earnings, view pending clearances, and request bank payouts.

- Actionable Dashboard: Real-time revenue charts, active job requests, and recent customer feedback.

### 👥 3. The Customer Experience
A frictionless, conversion-optimized interface for booking local help.

- Open Directory: Users can search and browse service categories without hitting a login wall.

- Verified Professionals: Customers see upfront pricing, background-check badges, and real community reviews.

- Instant Booking & Tracking: Streamlined booking flow and a premium timeline to track service status from request to invoice.

## 🏗️ Architecture & Technology Stack
### Frontend (Client)

- Framework: React.js (Vite)

- Styling: Tailwind CSS (Custom SaaS design system, frosted glass components, responsive off-canvas menus)

- Icons: FontAwesome 6

- Routing: React Router DOM (v6)

### Backend (Server)

- Language: PHP 8+ (RESTful API architecture)

### Database: MySQL

Security: Prepared statements (SQLi prevention), strict CORS headers, role-based access control, and "Soft Delete" data architecture to preserve historical ledgers.

## 🚀 Installation & Local Setup
### 1. Database Setup
- Create a new MySQL database named sahaayak.

- Import the provided sahaayak.sql file into your database.

- Update your connection.php file with your local database credentials.

### 2. Backend Setup (Ubuntu/Apache environments)
- If running on native Ubuntu Apache, ensure the web server has permission to save uploaded files (like profile pictures):

```Bash
# Navigate to your backend directory
cd /var/www/html/sahaayak/backend

# Create the uploads directory
sudo mkdir -p uploads/profiles

# Grant Apache ownership
sudo chown -R www-data:www-data uploads

# Set permissions
sudo chmod -R 775 uploads
```
### 3. Frontend Setup
Navigate to the frontend directory, install dependencies, and start the development server.

```Bash
cd frontend

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```
### 4. Environment Variables
- Ensure your src/constants/api.js points to your local PHP server:

```JavaScript
export const API_BASE_URL = "http://localhost/sahaayak/backend"; // Update according to your local path
```
## 🔒 Security Notes
Soft Deletes: Deleting a service or category does not permanently erase it from the database. It toggles an is_active flag to 0, ensuring that historical invoices and booking records never break.

File Uploads: Profile picture uploads use strict MIME-type checking and rename files using dynamic timestamps to prevent overwrites and execution of malicious scripts.

<div align="center">
<h3>Engineered by <b><i>Vinay Sahani</i></b>.</h3>
</div>