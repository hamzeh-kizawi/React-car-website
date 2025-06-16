from flask import Flask, jsonify, request, Response, stream_with_context
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


# configure JSON web token
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
app.config['JWT_REFRESH_COOKIE_PATH'] = '/refresh'
app.config['JWT_COOKIE_CSRF_PROTECT'] = True
app.config['JWT_COOKIE_SECURE'] = False  # make True in production with HTTPS
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


# Function to find closest car name match for a query
def find_closest_car_match(query, cars):
    all_names = [f"{car['brand']} {car['name']}" for car in cars]
    matches = difflib.get_close_matches(query.lower(), [name.lower() for name in all_names], n=1, cutoff=0.6)
    
    if matches:
        match_lower = matches[0]
        for name in all_names:
            if name.lower() == match_lower:
                return name
    return None

# Function to send a request to the DeepSeek api with retries
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
    

# to get all cars from the DB
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
    username = data.get('username') 
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"message": "Username, email, and password are required"}), 400

    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        # to check if a user with the same email already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            cursor.close()
            db.close()
            return jsonify({"message": "Email already registered. Please use a different email or login."}), 409 
        # hashing the password before storing it
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())


    except mysql.connector.Error as err: 
        print(f"Database Error during email check: {err}")
        if cursor: cursor.close()
        if db: db.close()
        return jsonify({"message": "Database error during registration process"}), 500

    db_conn = None 
    cursor = None
    try:
        db_conn = get_db()
        cursor = db_conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"message": "Email already registered. Please use a different email or login."}), 409
        cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
        if cursor.fetchone():
            return jsonify({"message": "Username already taken. Please choose another."}), 409
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        cursor_insert = db_conn.cursor() 
        cursor_insert.execute("INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
                              (username, email, hashed_password))
        db_conn.commit()
        cursor_insert.close()

        return jsonify({"message": "User registered successfully"}), 201

    except mysql.connector.Error as err:
        print(f"Database Error during registration: {err}")
        return jsonify({"message": "Registration failed due to a database error."}), 500
    finally:
        if cursor:
            cursor.close()
        if db_conn:
            db_conn.close()

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

# endpoint for guest feature
@app.route('/guest-login', methods=['POST'])
def guest_login():
    guest_identity = "guest_user"
    access_token = create_access_token(identity=guest_identity)
    refresh_token = create_refresh_token(identity=guest_identity)
    response = jsonify({"message": "Guest login successful"})
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    return response, 200

@app.route('/refresh', methods=['POST'])
@jwt_required(refresh=True) # needs a valid refresh token
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
    identity = get_jwt_identity()
    if identity == "guest_user":
        return jsonify(user={"id": None, "username": "Guest", "email": None}), 200

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE id = %s", (identity,))
    user = cursor.fetchone()
    cursor.close()
    db.close()
    return jsonify(user=user)

@app.route('/chatbot', methods=['POST'])
@jwt_required()
def chatbot():
    identity = get_jwt_identity()
    # prevent unauthorized users to access the chatbot
    if identity != "guest_user" and not isinstance(identity, int):
        print(f"[BLOCKED] Invalid identity accessing chatbot: {identity}")
        return jsonify({"response": "Unauthorized"}), 401

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
    - **Strictly stick to car-related topics.** If the user asks about anything unrelated to cars (e.g., politics, weather, personal opinions, general knowledge), you must politely decline. A good response would be: "As the SpeedAI assistant, my expertise is all about helping you find the perfect car from our inventory. Do you have any questions about our models?"
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
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_query}
        ],
        "temperature": 0.7,
        "max_tokens": 1500,
        "stream": True
    }

    try:
        api_key = os.getenv("DEEPSEEK_API_KEY")
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        api_response = requests.post(
            "https://api.deepseek.com/v1/chat/completions",
            headers=headers,
            json=data,
            stream=True
        )
        api_response.raise_for_status()

        def generate():
            for chunk in api_response.iter_content(chunk_size=None):
                if chunk:
                    yield chunk

        return Response(stream_with_context(generate()), content_type='text/event-stream')

    except requests.exceptions.RequestException as e:
        print(f"DeepSeek API Error: {e}")
        return jsonify({"response": "Sorry, I couldn't get a response from the chatbot. Please try again later."}), 500



@app.route('/api/posts', methods=['POST'])
@jwt_required()
def create_post():
    current_user_id = get_jwt_identity()
    if current_user_id == "guest_user": 
        return jsonify({"message": "Guests are not allowed to create posts"}), 403

    data = request.get_json()
    car_id = data.get('car_id')
    title = data.get('title')
    content = data.get('content')

    if not car_id or not content:
        return jsonify({"message": "Car ID and content are required"}), 400

    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SET time_zone = '+00:00'")


        cursor.execute("SELECT id FROM cars WHERE id = %s", (car_id,))
        if cursor.fetchone() is None:
            if cursor: cursor.close()
            if db: db.close()
            return jsonify({"message": "Invalid Car ID"}), 404

        

        query = "INSERT INTO posts (user_id, car_id, title, content) VALUES (%s, %s, %s, %s)"
        cursor.execute(query, (current_user_id, car_id, title, content))
        db.commit()
        new_post_id = cursor.lastrowid

        if new_post_id is None : 
             print(f"Error: lastrowid is None after inserting post for user {current_user_id}")
             return jsonify({"message": "Error creating post, failed to get new post ID"}), 500

        # fetch the new created post to return to the frontend
        cursor.execute("""
            SELECT p.id, p.user_id, u.username, p.car_id, c.name as car_name, c.image as car_image,
                   p.title, p.content, p.created_at, p.updated_at
            FROM posts p
            JOIN users u ON p.user_id = u.id
            JOIN cars c ON p.car_id = c.id
            WHERE p.id = %s
        """, (new_post_id,))
        new_post = cursor.fetchone()
        
        if not new_post:
            print(f"Error: Could not fetch newly created post with ID {new_post_id}")
            return jsonify({"message": "Post created but could not be retrieved"}), 500

        return jsonify({"message": "Post created successfully", "post": new_post}), 201

    except mysql.connector.Error as err:
        print(f"Database Error creating post: {err}")
        return jsonify({"message": "Database error"}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


@app.route('/api/posts', methods=['GET'])
def get_all_posts():
    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SET time_zone = '+00:00'")

        query = """
            SELECT
                p.id, p.user_id, u.username, p.car_id, c.name AS car_name, c.image AS car_image,
                p.title, p.content, p.created_at, p.updated_at,
                (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id) AS comments_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            JOIN cars c ON p.car_id = c.id
            ORDER BY p.created_at DESC
        """

        cursor.execute(query)
        posts = cursor.fetchall()
        return jsonify(posts), 200

    except mysql.connector.Error as err:
        print(f"Database Error fetching posts: {err}")
        return jsonify({"message": "Database error"}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

@app.route('/api/posts/<int:post_id>', methods=['GET'])
def get_single_post(post_id):
    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SET time_zone = '+00:00'")

        post_query = """
            SELECT p.id, p.user_id, u.username, p.car_id, c.name AS car_name, c.image AS car_image,
                   p.title, p.content, p.created_at, p.updated_at
            FROM posts p
            JOIN users u ON p.user_id = u.id
            JOIN cars c ON p.car_id = c.id
            WHERE p.id = %s
        """
        cursor.execute(post_query, (post_id,))
        post = cursor.fetchone()

        if not post:
            return jsonify({"message": "Post not found"}), 404

        comments_query = """
            SELECT cm.id, cm.user_id, u.username, cm.content, cm.created_at, cm.updated_at
            FROM comments cm
            JOIN users u ON cm.user_id = u.id
            WHERE cm.post_id = %s
            ORDER BY cm.created_at ASC
        """
        cursor.execute(comments_query, (post_id,))
        comments = cursor.fetchall()

        post["comments"] = comments
        return jsonify(post), 200

    except mysql.connector.Error as err:
        print(f"Database Error fetching single post: {err}")
        return jsonify({"message": "Database error"}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


@app.route('/api/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(post_id):
    current_user_id = get_jwt_identity()
    if current_user_id == "guest_user":
        return jsonify({"message": "Guests are not allowed to comment"}), 403

    data = request.get_json()
    content = data.get('content')

    if not content:
        return jsonify({"message": "Comment content is required"}), 400

    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True) 
        cursor.execute("SET time_zone = '+00:00'")

        # make sure the post exists before adding a comment
        cursor.execute("SELECT id FROM posts WHERE id = %s", (post_id,))
        if cursor.fetchone() is None:
            return jsonify({"message": "Post not found"}), 404

        query = "INSERT INTO comments (post_id, user_id, content) VALUES (%s, %s, %s)"
        cursor.execute(query, (post_id, current_user_id, content))
        db.commit()
        new_comment_id = cursor.lastrowid


        cursor.execute("""
            SELECT cm.id, cm.post_id, cm.user_id, u.username, cm.content, cm.created_at, cm.updated_at
            FROM comments cm
            JOIN users u ON cm.user_id = u.id
            WHERE cm.id = %s
        """, (new_comment_id,))
        new_comment_data = cursor.fetchone()

        return jsonify({"message": "Comment created successfully", "comment": new_comment_data}), 201

    except mysql.connector.Error as err:
        print(f"Database Error creating comment: {err}")
        return jsonify({"message": "Database error"}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


@app.route('/api/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    current_user_id = get_jwt_identity()
    if current_user_id == "guest_user":
        return jsonify({"message": "Guests are not allowed to edit posts"}), 403

    data = request.get_json()
    title = data.get('title')      
    content = data.get('content')   
    car_id = data.get('car_id')     

    if not title and not content and not car_id:
        return jsonify({"message": "No update data provided (title, content, or car_id)"}), 400

    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SET time_zone = '+00:00'")

        cursor.execute("SELECT user_id FROM posts WHERE id = %s", (post_id,))
        post_data = cursor.fetchone()

        if not post_data:
            return jsonify({"message": "Post not found"}), 404

        if post_data['user_id'] != current_user_id:
            return jsonify({"message": "Forbidden: You are not the author of this post"}), 403

        if car_id:
            cursor.execute("SELECT id FROM cars WHERE id = %s", (car_id,))
            if cursor.fetchone() is None:
                return jsonify({"message": "Invalid new Car ID"}), 404

        update_fields = []
        update_values = []

        if title is not None:
            update_fields.append("title = %s")
            update_values.append(title)
        if content is not None: 
            update_fields.append("content = %s")
            update_values.append(content)
        if car_id:
            update_fields.append("car_id = %s")
            update_values.append(car_id)

        if not update_fields: 
            return jsonify({"message": "No valid fields to update"}), 400

        update_fields.append("updated_at = CURRENT_TIMESTAMP") 

        query = f"UPDATE posts SET {', '.join(update_fields)} WHERE id = %s"
        update_values.append(post_id)

        cursor.execute(query, tuple(update_values))
        db.commit()

        if cursor.rowcount == 0:
            pass


        cursor.execute("""
            SELECT p.id, p.user_id, u.username, p.car_id, c.name as car_name, c.image as car_image,
                   p.title, p.content, p.created_at, p.updated_at
            FROM posts p
            JOIN users u ON p.user_id = u.id
            JOIN cars c ON p.car_id = c.id
            WHERE p.id = %s
        """, (post_id,))
        updated_post = cursor.fetchone()

        return jsonify({"message": "Post updated successfully", "post": updated_post}), 200

    except mysql.connector.Error as err:
        print(f"Database Error updating post: {err}")
        return jsonify({"message": "Database error"}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()



@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    current_user_id = get_jwt_identity()
    if current_user_id == "guest_user":
        return jsonify({"message": "Guests are not allowed to delete posts"}), 403

    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True) 

        # check if the post exists and if the current user is the author of that post
        cursor.execute("SELECT user_id FROM posts WHERE id = %s", (post_id,))
        post_data = cursor.fetchone()

        if not post_data:
            return jsonify({"message": "Post not found"}), 404

        if post_data['user_id'] != current_user_id:
            return jsonify({"message": "Forbidden: You are not the author of this post"}), 403

        cursor.execute("DELETE FROM posts WHERE id = %s", (post_id,))
        db.commit()

        if cursor.rowcount == 0:
            return jsonify({"message": "Post not found or already deleted"}), 404

        return jsonify({"message": "Post deleted successfully"}), 200 

    except mysql.connector.Error as err:
        print(f"Database Error deleting post: {err}")
        return jsonify({"message": "Database error"}), 500
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


if __name__ == '__main__':
    app.run(debug=True, port=5000)
