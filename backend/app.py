from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import os
import bcrypt
import requests
import openai
import json
import difflib
from dotenv import load_dotenv
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    JWTManager,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies
)
from datetime import timedelta
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

load_dotenv()

app = Flask(__name__)

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
app.config['JWT_REFRESH_COOKIE_PATH'] = '/refresh'
app.config['JWT_COOKIE_CSRF_PROTECT'] = True
app.config['JWT_COOKIE_SECURE'] = False  # use true in production with HTTPS
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)

jwt = JWTManager(app)

connection_config = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME")
}

def get_db():
    return mysql.connector.connect(**connection_config)

def find_closest_car_match(query, cars):
    all_names = [f"{car['brand']} {car['name']}" for car in cars]
    matches = difflib.get_close_matches(query.lower(), [name.lower() for name in all_names], n=1, cutoff=0.6)
    
    if matches:
        match_lower = matches[0]
        for name in all_names:
            if name.lower() == match_lower:
                return name
    return None


def send_request_with_retries(url, headers, data, retries=3, delay=2):
    session = requests.Session()
    retry = Retry(
        total=retries,
        backoff_factor=delay,
        status_forcelist=[500, 502, 503, 504],
        allowed_methods=["POST"] 
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)

    try:
        response = session.post(url, headers=headers, json=data, timeout=60)
        response.raise_for_status()
        return response
    except requests.exceptions.RequestException as e:
        print(f"DeepSeek API Error: {e}")
        return None


@app.route('/cars', methods=['GET'])
def get_cars():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM cars")
    cars = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(cars)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = data['password']

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
                  (username, email, hashed_password))
    db.commit()
    cursor.close()
    db.close()

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    db.close()

    if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        access_token = create_access_token(identity=user['id'])
        refresh_token = create_refresh_token(identity=user['id'])
        response = jsonify({"message": "Login successful", "user": user})
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
        return response, 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@app.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    response = jsonify({"message": "Token refreshed"})
    set_access_cookies(response, access_token)
    return response, 200

@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = jsonify({"message": "Logout successful"})
    unset_jwt_cookies(response)
    return response, 200

@app.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    db.close()
    return jsonify(user=user)

@app.route('/chatbot', methods=['POST'])
def chatbot():
    user_query = request.json.get('query', '').strip()
    if not user_query:
        return jsonify({"response": "Please provide a query."}), 400

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, name, brand, type, model_year, price, fuel_type,
            horsepower, seating_capacity, description
            FROM cars
        """)
        cars = cursor.fetchall()
        cursor.close()
        db.close()

        if not cars:
            return jsonify({"response": "It seems our inventory is currently empty. Please check back later!"}), 200

    except mysql.connector.Error as err:
        print(f"Database Chatbot Fetch Error: {err}")
        return jsonify({"response": "Sorry, I'm having trouble accessing the car inventory right now. Please try again later."}), 500

    closest_car_name = find_closest_car_match(user_query, cars)
    if closest_car_name:
        user_query = f"Tell me about the {closest_car_name}"

    car_list = "\n".join([
        f"{car['brand']} {car['name']} ({car['model_year']}) - {car['type']}, {car['fuel_type']}, {car['horsepower']} HP, ${car['price']}"
        for car in cars
    ])

    system_prompt = f"""
    You are a friendly and knowledgeable car sales assistant named SpeedAI.

    Your job is to help users explore cars from our inventory. You should sound helpful, conversational, and human — like you're talking to a friend.

    Car Inventory:
    {car_list}

    Your task:
    - Use the full message history to understand context and follow-up questions.
    - If a user asks about "it", "that car", or similar, refer to the last mentioned car in their previous messages.
    - If a specific car is mentioned (e.g., "BMW 320i"), respond with detailed info from the inventory.
    - If the car is not found, reply with: "Sorry, we don't have that car in our inventory. Here are some similar options:" and suggest 2–3 alternatives.
    - Handle small typos and case differences.

    Important Style Instructions:
    - When recommending multiple cars, don’t just list them. Use friendly transitions like:
        - "Or you might like..."
        - "On the other hand, if you're after more space..."
        - "If you prefer performance, then consider..."
        - "Another great option is..."
    - Make each recommendation feel like a natural suggestion in a conversation.
    - Add brief descriptions of the car’s benefits (e.g., “great for families,” “powerful yet efficient,” “a fun ride for city driving”).
    - Don't repeat the brand twice (say "BMW 320i" not "BMW BMW 320i").
    - Use emojis sparingly for warmth, like 🚗, 🏎️, or 😊 — but only one or two per response.
    - If you recommend 2 or more cars, always follow up with: "Would you like me to open the search bar and show full details for these models? Just reply with 'yes'." This helps users quickly explore their options.
    """





    api_key = os.getenv("DEEPSEEK_API_KEY")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "deepseek-reasoner",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_query}
        ],
        "temperature": 0.7,
        "max_tokens": 1500
    }

    response = send_request_with_retries(
        "https://api.deepseek.com/v1/chat/completions",
        headers=headers,
        data=data,
        retries=5,
        delay=3
    )

    if response and response.ok:
        return jsonify({"response": response.json()["choices"][0]["message"]["content"].strip()}), 200

    return jsonify({"response": "Sorry, I couldn't get a response from the chatbot. Please try again later."}), 500



if __name__ == '__main__':
    app.run(debug=True, port=5000)