from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
from PIL import Image

app = Flask(__name__)
CORS(app)

print("Loading AI food recognition model...")

classifier = pipeline(
    "image-classification",
    model="vishnudas08/food101-vit-model"
)

print("AI model loaded successfully!")


# Nutrition data per serving
nutrition_data = {
    "chicken_wings": {
        "calories": "203 kcal",
        "protein": "18 g",
        "carbs": "0 g",
        "fat": "14 g"
    },

    "pizza": {
        "calories": "285 kcal",
        "protein": "12 g",
        "carbs": "36 g",
        "fat": "10 g"
    },

    "hamburger": {
        "calories": "295 kcal",
        "protein": "17 g",
        "carbs": "24 g",
        "fat": "14 g"
    },

    "french_fries": {
        "calories": "312 kcal",
        "protein": "3 g",
        "carbs": "41 g",
        "fat": "15 g"
    },

    "fried_rice": {
        "calories": "163 kcal",
        "protein": "4 g",
        "carbs": "25 g",
        "fat": "5 g"
    }
}


@app.route("/")
def home():
    return "AI Food Nutrition Tracker Backend is Running!"


@app.route("/analyze", methods=["POST"])
def analyze_food():

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]

    try:
        # Open uploaded image
        image = Image.open(image_file).convert("RGB")

        # AI prediction
        predictions = classifier(image)

        # Highest confidence prediction
        food_name = predictions[0]["label"]
        confidence = predictions[0]["score"]

        # Get nutrition information
        nutrition = nutrition_data.get(
            food_name,
            {
                "calories": "Not available",
                "protein": "Not available",
                "carbs": "Not available",
                "fat": "Not available"
            }
        )

        result = {
            "food": food_name,
            "confidence": round(confidence * 100, 2),
            "calories": nutrition["calories"],
            "protein": nutrition["protein"],
            "carbs": nutrition["carbs"],
            "fat": nutrition["fat"]
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)