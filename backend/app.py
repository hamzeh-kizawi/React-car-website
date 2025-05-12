from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import os
import bcrypt
import requests 
import openai 
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


load_dotenv()

app = Flask(__name__)


CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
app.config['JWT_REFRESH_COOKIE_PATH'] = '/refresh'
app.config['JWT_COOKIE_CSRF_PROTECT'] = True
app.config['JWT_COOKIE_SECURE'] = False  # Use True in production with HTTPS
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
    user_query = request.json.get('query')
    if not user_query:
        return jsonify({"response": "Please provide a valid query."}), 400

    # Fetch car data from the database
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM cars")
    cars = cursor.fetchall()
    cursor.close()
    db.close()

    # Prepare car data for DeepSeek
    car_list = "\n".join([
        f"Brand: {car['brand']}\nModel: {car['name']}\nType: {car['type']}\nYear: {car['model_year']}\n"
        f"Price: ${car['price']}\nFuel Type: {car['fuel_type']}\nHorsepower: {car['horsepower']} HP\n"
        f"Description: {car['description']}\nSeating Capacity: {car['seating_capacity']}\n---"
        for car in cars
    ])

    # DeepSeek V3 API Call
    api_key = os.getenv("DEEPSEEK_API_KEY")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "deepseek-reasoner",
        "messages": [
            {
                "role": "system",
                "content": (
                    f"You are a car sales assistant. Use only the following car inventory data:\n\n{car_list}\n\n"
                    "Rules:\n"
                    "- Only respond with information from this car list.\n"
                    "- If the information is not present, reply with 'Sorry, I couldn't find the information you requested.'"
                )
            },
            {"role": "user", "content": user_query}
        ],
        "temperature": 0.7,
        "max_tokens": 1000
    }

    try:
        response = requests.post(
            "https://api.deepseek.com/v1/chat/completions",
            headers=headers,
            json=data
        )

        response.raise_for_status()
        response_data = response.json()
        
        choices = response_data.get("choices", [])
        if choices and "message" in choices[0] and "content" in choices[0]["message"]:
            assistant_message = choices[0]["message"]["content"]
            return jsonify({"response": assistant_message}), 200
        
        return jsonify({"response": "No response from DeepSeek."}), 200
    
    except requests.exceptions.RequestException as e:
        print("DeepSeek API Error:", str(e))
        return jsonify({"response": "Error connecting to DeepSeek."}), 500



if __name__ == '__main__':
    app.run(debug=True, port=5000)