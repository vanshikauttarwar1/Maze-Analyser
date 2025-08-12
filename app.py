# import os
# import base64
# import random
# import json # Import the json library
# from flask import Flask, render_template, request, jsonify
# import openai

# # --- Load the .env file ---
# from dotenv import load_dotenv
# load_dotenv()
# # ---

# app = Flask(__name__)

# # --- CONFIGURE THE OPENROUTER CLIENT ---
# openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
# if not openrouter_api_key:
#     raise ValueError("OPENROUTER_API_KEY not found in .env file. Please add it.")

# client = openai.OpenAI(
#     api_key=openrouter_api_key,
#     base_url="https://openrouter.ai/api/v1"
# )
# # ---

# # --- LOAD LOCAL MAZE IMAGES ---
# @app.route('/generate-maze', methods=['POST'])
# def generate_maze():
#     try:
#         print("Received request to load a local maze...")
#         maze_dir = os.path.join(app.static_folder, 'mazes')
#         maze_files = [f for f in os.listdir(maze_dir) if f.endswith(('.png', '.jpg', '.jpeg'))]
#         if not maze_files:
#             return jsonify({'error': 'No maze images found in the static/mazes folder.'}), 404
#         random_maze_filename = random.choice(maze_files)
#         maze_path = os.path.join(maze_dir, random_maze_filename)
#         with open(maze_path, "rb") as image_file:
#             image_bytes = image_file.read()
#         print(f"Successfully loaded maze: {random_maze_filename}")
#         base64_image = base64.b64encode(image_bytes).decode('utf-8')
#         image_data_url = f"data:image/png;base64,{base64_image}"
#         return jsonify({'image_data_url': image_data_url})
#     except Exception as e:
#         print(f"An error occurred while loading a local maze: {e}")
#         return jsonify({'error': str(e)}), 500

# # --- OPENROUTER FREE TIER FOR PATH EVALUATION ---
# @app.route('/evaluate-path', methods=['POST'])
# def evaluate_path():
#     try:
#         print("Received request to evaluate path with OpenRouter's free tier...")
#         data = request.get_json()
#         base_maze_image = data.get('base_maze_image')
#         user_path_image = data.get('user_path_image')

#         # --- FIX: Using the Qwen model ID as you selected ---
#         model_to_use = "qwen/qwen-2.5-vl-72b-instruct:free"

#         prompt = (
#             "You are a hyper-precise maze evaluation AI. Your task is to analyze two images: a base maze and a maze with a user's blue path. The start points are letters (A, B, C) and the end is a red arrow."
#             "**You must follow these three rules in order:**"
#             "**Rule 1: Check for Wall Crossings.**"
#             "- First, examine the user's blue path. Does ANY part of the blue line touch or cross ANY black wall? Be extremely strict. Even a tiny overlap is a failure."
#             "- If it touches a wall, the user loses. The reason is 'invalid_path'."
#             "**Rule 2: Check for Shortest Path.**"
#             "- If the path is valid (does not touch any walls), you must now determine if it is the SHORTEST possible path from a start letter to the red arrow."
#             "- Mentally solve the maze to find the most efficient route. Compare the user's path length to the optimal path length."
#             "- If the user's path is valid but is longer than the shortest possible route, the user loses. The reason is 'not_shortest'."
#             "**Rule 3: Check for Win Condition.**"
#             "- If the path is valid (Rule 1) AND it is the shortest possible path (Rule 2), the user wins."
#             "**RESPONSE FORMAT:**"
#             "You MUST respond ONLY with a single, clean JSON object. Do not add any text or markdown like ```json."
#             "- If the user wins (valid and shortest path):"
#             "  `{\"result\": \"win\"}`"
#             "- If the user's path touches a wall:"
#             "  `{\"result\": \"lose\", \"reason\": \"invalid_path\"}`"
#             "- If the path is valid but NOT the shortest:"
#             "  `{\"result\": \"lose\", \"reason\": \"not_shortest\", \"correct_path\": [{\"x\": startX, \"y\": startY}, ..., {\"x\": endX, \"y\": endY}]}`"
#             "**CRITICAL INSTRUCTION for `correct_path`:**"
#             "When you provide the `correct_path` for a 'not_shortest' loss, you MUST solve the maze perfectly. Your generated path CANNOT cross walls. This is the most important rule."
#         )

#         response = client.chat.completions.create(
#             model=model_to_use,
#             messages=[
#                 {
#                     "role": "user",
#                     "content": [
#                         {"type": "text", "text": prompt},
#                         {"type": "image_url", "image_url": {"url": base_maze_image}},
#                         {"type": "image_url", "image_url": {"url": user_path_image}}
#                     ]
#                 }
#             ],
#             max_tokens=1500
#         )
        
#         # Clean and parse the AI's response on the server
#         ai_response_text = response.choices[0].message.content
#         print(f"Raw AI Response: {ai_response_text}")

#         start = ai_response_text.find('{')
#         end = ai_response_text.rfind('}') + 1
#         json_string = ai_response_text[start:end]
        
#         result_dict = json.loads(json_string)
        
#         return jsonify(result_dict)

#     except Exception as e:
#         print(f"Error evaluating path with OpenRouter: {e}")
#         return jsonify({'error': 'Failed to evaluate path with OpenRouter.'}), 500

# @app.route('/')
# def index():
#     return render_template('index.html')

# if __name__ == '__main__':
#     app.run(debug=True, port=5001)




import os
import base64
import random
import json
from flask import Flask, render_template, request, jsonify
import openai

# --- Load the .env file ---
from dotenv import load_dotenv
load_dotenv()
# ---

app = Flask(__name__)

# --- CONFIGURE THE OPENROUTER CLIENT ---
openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
if not openrouter_api_key:
    raise ValueError("OPENROUTER_API_KEY not found in .env file. Please add it.")

client = openai.OpenAI(
    api_key=openrouter_api_key,
    base_url="https://openrouter.ai/api/v1"
)
# ---

# --- LOAD LOCAL MAZE IMAGES ---
@app.route('/generate-maze', methods=['POST'])
def generate_maze():
    try:
        print("Received request to load a local maze...")
        maze_dir = os.path.join(app.static_folder, 'mazes')
        maze_files = [f for f in os.listdir(maze_dir) if f.endswith(('.png', '.jpg', '.jpeg'))]
        if not maze_files:
            return jsonify({'error': 'No maze images found in the static/mazes folder.'}), 404
        random_maze_filename = random.choice(maze_files)
        maze_path = os.path.join(maze_dir, random_maze_filename)
        with open(maze_path, "rb") as image_file:
            image_bytes = image_file.read()
        print(f"Successfully loaded maze: {random_maze_filename}")
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        image_data_url = f"data:image/png;base64,{base64_image}"
        return jsonify({'image_data_url': image_data_url})
    except Exception as e:
        print(f"An error occurred while loading a local maze: {e}")
        return jsonify({'error': str(e)}), 500

# --- OPENROUTER FREE TIER FOR PATH EVALUATION ---
@app.route('/evaluate-path', methods=['POST'])
def evaluate_path():
    try:
        print("Received request to evaluate path with OpenRouter's free tier...")
        data = request.get_json()
        base_maze_image = data.get('base_maze_image')
        user_path_image = data.get('user_path_image')

        # Using the Gemma model which is less likely to be rate-limited
        model_to_use = "openai/gpt-4o"
        
        prompt = (
            "You are a judge with strict rukes for maze evaluator for a kids' game. You will see two images: a base maze and the same maze with a user's blue path."
            "Your ONLY job is to determine if the user's path is valid if not you should provide true  path in the maze field in red color. Your generated path CANNOT cross walls."
            
            "A path is VALID if and only if it meets BOTH of these conditions:"
            "1. No Wall Crossings: The blue path must NEVER touch or cross any black wall. Be extremely strict. Even a tiny overlap is a failure."
            "2. Completion: The path must start at a letter (A, B, or C) and successfully reach the end point (the red arrow)."

            "RESPONSE FORMAT:"
            "You MUST respond ONLY with a single, clean JSON object. Do not add any text or markdown like ```json."

            "- If the path is VALID (meets BOTH conditions above):"
            "  `{\"result\": \"win\"}`"
            
            "- If the path is INVALID (fails EITHER condition above):"
            "  `{\"result\": \"lose\", \"reason\": \"invalid_path\", \"correct_path\": [...]}`"

            "CRITICAL INSTRUCTION:"
            "If the user loses, you MUST provide the true  path in the maze field in red color. Your generated path CANNOT cross walls."
            "If the user click generate , erase or play again button you should start eveluation from the start you should not save previous path memory"
        )

        response = client.chat.completions.create(
            model=model_to_use,
            messages=[
                {"role": "user", "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": base_maze_image}},
                    {"type": "image_url", "image_url": {"url": user_path_image}}
                ]}
            ],
            max_tokens=1500,
            temperature=0.0
        )
        
        
        ai_response_text = response.choices[0].message.content
        
        
        print(f"Raw AI Response Text: {ai_response_text}")

        start = ai_response_text.find('{')
        end = ai_response_text.rfind('}') + 1
        json_string = ai_response_text[start:end]
        
        result_dict = json.loads(json_string)
        
        return jsonify(result_dict)

    except Exception as e:
        print(f"Error evaluating path with OpenRouter: {e}")
        return jsonify({'error': 'Failed to evaluate path with OpenRouter.'}), 500

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5001)