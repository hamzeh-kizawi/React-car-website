React & Flask Car Dealership Website (SpeedAI)

This is a full-stack web application for a car dealership, featuring a rich user interface, a complete backend API, and an integrated AI chatbot for customer assistance

Features
-Car Showcase: Browse and search through a detailed inventory of cars.
-User Authentication: Secure user registration and login system using JWT (JSON Web Tokens)
-Discussion Forum: Authenticated users can create, edit, and delete posts, and comment on discussions
-AI Chatbot: An intelligent chatbot (powered by DeepSeek) to answer user questions about the car inventory
-Contact Form: Integrated EmailJS form for users to send messages directly
-RESTful API: A well-structured Flask backend serving data to the frontend
Tech Stack
-Frontend: React (with Vite)
-Backend: Flask (Python), mysql-connector-python
-Database: MySQL
-External APIs:
-DeepSeek AI for the chatbot
-EmailJS for the contact form

Prerequisites

Before you begin, you need to have some software installed on your computer:

-Node.js: This is a JavaScript runtime that lets you run the frontend part of the project

-Download Node.js (download the LTS version: https://nodejs.org/en/)

-Python: This is the programming language for the backend
Download Python (https://www.python.org/downloads/)

-MySQL Server: This is the database where all data (users, cars, posts) is stored
Download MySQL Community Server(https://dev.mysql.com/downloads/mysql/)

-During installation, remember the username and password you set for the 'root' user
MySQL Workbench: A graphical tool that makes it easier to manage your database.
Download MySQL Workbench (https://dev.mysql.com/downloads/workbench/)

Setup Instructions:

Follow these steps carefully to get the project running on your local machine.

1. Clone the Repository
   First, download the project files to your computer.

git clone https://github.com/hamzeh-kizawi/React-car-website.git
cd React-car-website

2. API Key Setup (!!!Important!!!)

You need to get API keys from two external services for the project to be fully functional.:

-EmailJS (for the contact form):

Go to the EmailJS website and create a free account (https://www.emailjs.com/)
Add a new email service (e.g., Gmail).
Create a new email template.
From your account dashboard, find your Service ID, Template ID, and Public Key. Keep these handy.
if you find it hard to find the IDs and the Public Key you can check this video on youtube(https://www.youtube.com/watch?v=Nm_IHH4iOx4&ab_channel=techM)

-DeepSeek AI (for the chatbot):

Go to the DeepSeek Platform website and sign up (https://www.deepseek.com/)
You have to pay at least $2 which is the minimum amount to get the API Key
Navigate to the "API Keys" section
Create a new secret key. Copy this key and save it somewhere safe

3. Backend Setup (Flask Server)
   This part sets up the server and the database

Navigate to the backend folder:

cd backend
Create and activate a Python virtual environment: A virtual environment keeps the project's Python packages separate from your global ones.

# For Windows

python -m venv venv
.\venv\Scripts\activate

# For macOS/Linux

python3 -m venv venv
source venv/bin/activate
Install the required Python packages:

After that type:

pip install -r requirements.txt

-Set up the database:

Open MySQL Workbench and connect to your local database server (using the username and password you set during installation)
Create a new database by clicking the "create a new schema" icon. Name it exactly car_website, a Youtube video to help you(https://www.youtube.com/watch?v=x_ez4IlSGOE&ab_channel=AmitThinks)
Go to File > Open SQL Script... and select the schema.sql file located in backend/database. Click the lightning bolt icon to run the script. This will create all the necessary tables.
Do the same for the seed.sql file (File > Open SQL Script...). Run it to populate the cars table with the initial data.

Configure your secret keys:

In the backend folder, create a copy of .env.example and name it .env.
Open the new .env file and fill in your details:

DB_HOST=localhost
DB_USER=your_mysql_user # example, 'root'
DB_PASSWORD=your_mysql_password # the password you set for MySQL
DB_NAME=car_website
JWT_SECRET_KEY=generate_a_strong_random_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here # paste your key from DeepSeek
Run the Backend Server:

flask run
Keep this terminal open. The backend is now running at http://127.0.0.1:5000.

4. Frontend Setup

This part sets up the user interface.

Open a new terminal. Navigate to the frontend folder:

# From the project's root directory

cd my-app
Install the required packages:

npm install

Configure your secret keys:

In the my-app folder, create a copy of .env.example and name it .env.

Open the new .env file and fill in your EmailJS credentials:
Ini, TOML

VITE_EMAILJS_SERVICE_ID=your_service_id # Paste from EmailJS
VITE_EMAILJS_TEMPLATE_ID=your_template_id # Paste from EmailJS
VITE_EMAILJS_PUBLIC_KEY=your_public_key # Paste from EmailJS
Run the Frontend App:

npm run dev

The React application will now be running. Your browser should open to http://localhost:5173. You can now use the website!
