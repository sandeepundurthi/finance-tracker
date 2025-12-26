# Personal Finance Tracker

A full-stack web application for tracking personal income and expenses with real-time balance calculation and spending analysis.

## ✨ Features

- **📊 Dashboard Overview**: Real-time balance, income, and expense tracking
- **💳 Transaction Management**: Add, view, and delete income/expense entries
- **📈 Visual Analytics**: Interactive charts for spending by category
- **🏷️ Smart Categorization**: Automatic categorization with icons
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **💾 Persistent Storage**: SQLite database for data persistence

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5 for responsive design
- Chart.js for data visualization
- Font Awesome for icons

**Backend:**
- Node.js with Express.js
- SQLite database
- RESTful API architecture

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)
- **Git** (for version control)
- **Modern web browser** (Chrome, Firefox, Safari)

## 🚀 Step-by-Step Installation Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/sandeepundurthi/finance-tracker.git
cd finance-tracker
```

### Step 2: Install Dependencies
```bash
# Navigate to backend directory
cd backend
```
# Install required packages
```
npm install
```
### Step 3: Start the Application

Option A: Development Mode (with auto-reload)
```
npm run dev
```
Option B: Production Mode
```
npm start
```
### Step 4: Access the Application
Open your web browser

Navigate to: http://localhost:3000

The application will load with sample data

📁 Project Structure
finance-tracker/
├── public/                    # Frontend files
│   ├── index.html            # Main HTML file
│   ├── css/
│   │   └── style.css         # Custom styles
│   └── js/
│       └── app.js            # Frontend JavaScript
├── backend/                   # Backend files
│   ├── server.js             # Express server
│   ├── database.js           # Database configuration
│   ├── package.json          # Dependencies
│   └── finance.db            # SQLite database (auto-generated)
└── README.md                 # This file

## Screenshots

<img width="1437" height="737" alt="Screenshot 2025-12-25 at 16 47 35" src="https://github.com/user-attachments/assets/3a38a156-5033-4798-a2e6-6473f99de29a" />
