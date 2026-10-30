from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
from PIL import Image
import sqlite3

app = Flask(__name__)
CORS(app)
# SQLite Database Setup
def init_db():
    conn = sqlite3.connect("food_history.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS food_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            food_name TEXT NOT NULL,
            calories REAL,
            protein REAL,
            carbs REAL,
            fat REAL,
            scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

init_db()

print("Loading AI Food Model...")

classifier = pipeline(
    "image-classification",
    model="prithivMLmods/Indian-Western-Food-34"
)

print("AI Food Model loaded successfully!")


# =========================================================
# NUTRITION DATA
# =========================================================

nutrition_data = {

    "Crispy Chicken": {
        "calories": 280,
        "protein": 22,
        "carbs": 15,
        "fat": 16
    },

    "Pakode": {
        "calories": 250,
        "protein": 6,
        "carbs": 30,
        "fat": 12
    },

    "Momos": {
        "calories": 180,
        "protein": 7,
        "carbs": 25,
        "fat": 6
    },

    "Chai": {
        "calories": 60,
        "protein": 2,
        "carbs": 8,
        "fat": 2
    },

    "Idli": {
        "calories": 58,
        "protein": 2,
        "carbs": 12,
        "fat": 0.4
    },

    "Pizza": {
        "calories": 266,
        "protein": 11,
        "carbs": 33,
        "fat": 10
    },

    "Pav Bhaji": {
        "calories": 300,
        "protein": 8,
        "carbs": 45,
        "fat": 10
    },

    "Omelette": {
        "calories": 154,
        "protein": 11,
        "carbs": 1,
        "fat": 11
    },

    "Baked Potato": {
        "calories": 160,
        "protein": 4,
        "carbs": 37,
        "fat": 0.2
    },

    "Rice": {
        "calories": 205,
        "protein": 4,
        "carbs": 45,
        "fat": 0.4
    },

    "Dal Rice": {
        "calories": 300,
        "protein": 10,
        "carbs": 50,
        "fat": 7
    },

    "Chapati": {
        "calories": 120,
        "protein": 3,
        "carbs": 18,
        "fat": 3
    },

    "Bhakri": {
        "calories": 180,
        "protein": 5,
        "carbs": 35,
        "fat": 2
    },

    "Dosa": {
        "calories": 168,
        "protein": 4,
        "carbs": 25,
        "fat": 6
    },

    "Vada": {
        "calories": 140,
        "protein": 3,
        "carbs": 15,
        "fat": 7
    },

    "Samosa": {
        "calories": 262,
        "protein": 5,
        "carbs": 24,
        "fat": 17
    },

    "Poha": {
        "calories": 180,
        "protein": 4,
        "carbs": 30,
        "fat": 5
    },

    "Upma": {
        "calories": 190,
        "protein": 5,
        "carbs": 30,
        "fat": 6
    },

    "Biryani": {
        "calories": 350,
        "protein": 12,
        "carbs": 45,
        "fat": 13
    },

    "Chicken Curry": {
        "calories": 250,
        "protein": 25,
        "carbs": 8,
        "fat": 14
    },

    "Chicken Tikka": {
        "calories": 220,
        "protein": 30,
        "carbs": 5,
        "fat": 9
    },

    "Pasta": {
        "calories": 300,
        "protein": 10,
        "carbs": 45,
        "fat": 10
    },

    "Burger": {
        "calories": 295,
        "protein": 17,
        "carbs": 30,
        "fat": 12
    },

    "Sandwich": {
        "calories": 250,
        "protein": 10,
        "carbs": 30,
        "fat": 9
    },

    "Noodles": {
        "calories": 300,
        "protein": 8,
        "carbs": 42,
        "fat": 11
    },

    "Dhokla": {
        "calories": 160,
        "protein": 7,
        "carbs": 25,
        "fat": 4
    },

    # -------- HEALTHY FOOD ITEMS --------

    "Sprouts": {
        "calories": 80,
        "protein": 7,
        "carbs": 12,
        "fat": 1
    },

    "Chana": {
        "calories": 164,
        "protein": 9,
        "carbs": 27,
        "fat": 3
    },

    "Paneer": {
        "calories": 265,
        "protein": 18,
        "carbs": 6,
        "fat": 20
    },

    "Curd": {
        "calories": 98,
        "protein": 11,
        "carbs": 4,
        "fat": 4
    },

    "Soyabean": {
        "calories": 173,
        "protein": 17,
        "carbs": 10,
        "fat": 9
    },

    "Salad": {
        "calories": 50,
        "protein": 2,
        "carbs": 10,
        "fat": 0.5
    },

    "Oats": {
        "calories": 150,
        "protein": 5,
        "carbs": 27,
        "fat": 3
    },

    "Fruit Salad": {
        "calories": 100,
        "protein": 1,
        "carbs": 25,
        "fat": 0.5
    },
    "Cucumber": {
    "calories": 16,
    "protein": 0.7,
    "carbs": 3.6,
    "fat": 0.1
},

"Chole Bhature": {
    "calories": 400,
    "protein": 12,
    "carbs": 55,
    "fat": 15
},

"Fried Rice": {
    "calories": 250,
    "protein": 6,
    "carbs": 35,
    "fat": 8
},

"Dal": {
    "calories": 180,
    "protein": 9,
    "carbs": 25,
    "fat": 5
},

"Raita": {
    "calories": 80,
    "protein": 4,
    "carbs": 6,
    "fat": 4
},

"Paratha": {
    "calories": 260,
    "protein": 6,
    "carbs": 35,
    "fat": 10
},

"Puri": {
    "calories": 100,
    "protein": 2,
    "carbs": 15,
    "fat": 4
},

"Misal Pav": {
    "calories": 350,
    "protein": 12,
    "carbs": 45,
    "fat": 14
},

"French Fries": {
    "calories": 312,
    "protein": 3.4,
    "carbs": 41,
    "fat": 15
},

"Soup": {
    "calories": 80,
    "protein": 3,
    "carbs": 12,
    "fat": 2
},

"Boiled Egg": {
    "calories": 78,
    "protein": 6,
    "carbs": 0.6,
    "fat": 5
},

"Egg Curry": {
    "calories": 220,
    "protein": 12,
    "carbs": 8,
    "fat": 15
}

}



    # =========================================================
# AI LABEL MAPPING
# =========================================================

food_mapping = {

    "idli": "Idli",

    "pakode": "Pakode",
    "pakora": "Pakode",

    "pizza": "Pizza",

    "pav bhaji": "Pav Bhaji",
    "pav_bhaji": "Pav Bhaji",

    "omelette": "Omelette",
    "omelet": "Omelette",

    "chai": "Chai",
    "tea": "Chai",

    "momos": "Momos",
    "momo": "Momos",

    "samosa": "Samosa",

    "dosa": "Dosa",

    "vada": "Vada",

    "poha": "Poha",

    "upma": "Upma",

    "rice": "Rice",
    "white rice": "Rice",
    "steamed rice": "Rice",

    "dal rice": "Dal Rice",

    "chapati": "Chapati",
    "roti": "Chapati",

    "bhakri": "Bhakri",

    "biryani": "Biryani",

    "chicken curry": "Chicken Curry",

    "chicken tikka": "Chicken Tikka",

    "pasta": "Pasta",

    "burger": "Burger",

    "sandwich": "Sandwich",

    "noodles": "Noodles",

    "dhokla": "Dhokla",

    "baked potato": "Baked Potato",
    "potato": "Baked Potato",

    "crispy chicken": "Crispy Chicken",
    "fried chicken": "Crispy Chicken",

    # -------- HEALTHY FOOD MAPPING --------

    "sprouts": "Sprouts",
    "sprout": "Sprouts",

    "chana": "Chana",
    "chickpeas": "Chana",

    "paneer": "Paneer",
    "cottage cheese": "Paneer",

    "curd": "Curd",
    "yogurt": "Curd",

    "soyabean": "Soyabean",
    "soybean": "Soyabean",

    "salad": "Salad",
    "vegetable salad": "Salad",

    "oats": "Oats",

    "fruit salad": "Fruit Salad",

    "cucumber": "Cucumber",

    "chole bhature": "Chole Bhature",
    "chole_bhature": "Chole Bhature",

    "fried rice": "Fried Rice",
    "fried_rice": "Fried Rice",

    "dal": "Dal",

    "raita": "Raita",

    "paratha": "Paratha",

    "puri": "Puri",

    "misal pav": "Misal Pav",
    "misal_pav": "Misal Pav",

    "french fries": "French Fries",
    "fries": "French Fries",

    "soup": "Soup",

    "boiled egg": "Boiled Egg",
    "boiled_egg": "Boiled Egg",

    "egg curry": "Egg Curry",
    "egg_curry": "Egg Curry"
}

# =========================================================
# NUTRITION ROUTE
# =========================================================


@app.route("/nutrition", methods=["POST"])
def get_nutrition():
    data = request.get_json(silent=True) or {}
    food_name = data.get("food", "").strip()

    nutrition = nutrition_data.get(food_name)

    if nutrition is None:
        return jsonify({
            "error": f"Nutrition data not found for {food_name}"
        }), 404

    conn = sqlite3.connect("food_history.db")
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO food_history
        (food_name, calories, protein, carbs, fat)
        VALUES (?, ?, ?, ?, ?)
    """, (
        food_name,
        nutrition["calories"],
        nutrition["protein"],
        nutrition["carbs"],
        nutrition["fat"]
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "food": food_name,
        "calories": nutrition["calories"],
        "protein": nutrition["protein"],
        "carbs": nutrition["carbs"],
        "fat": nutrition["fat"]
    })

# =========================================================
# FOOD HISTORY ROUTE
# =========================================================

@app.route("/history", methods=["GET"])
def get_history():
    conn = sqlite3.connect("food_history.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM food_history
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()
    history = [dict(row) for row in rows]

    conn.close()

    return jsonify(history)


# =========================================================
# HOME ROUTE
# =========================================================

@app.route("/")
def home():
    return "AI Food Nutrition Tracker Backend is Running!"


# =========================================================
# ANALYZE FOOD
# =========================================================

@app.route("/analyze", methods=["POST"])
def analyze_food():

    if "image" not in request.files:
        return jsonify({
            "error": "No image uploaded"
        }), 400

    file = request.files["image"]

    try:

        # Convert uploaded image to RGB
        image = Image.open(file).convert("RGB")

        # AI prediction
        predictions = classifier(image)

        # Print predictions in terminal
        print("AI PREDICTIONS:", predictions[:10])

        # Get top prediction
        top_prediction = predictions[0]

        original_label = top_prediction["label"]

        confidence = top_prediction["score"] * 100

        # Convert AI label to our food name
        food_name = food_mapping.get(
            original_label.lower(),
            original_label
        )

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

        # Return result to frontend
        return jsonify({

            "food": food_name,

            "original_prediction": original_label,

            "confidence": round(confidence, 2),

            "calories": nutrition["calories"],

            "protein": nutrition["protein"],

            "carbs": nutrition["carbs"],

            "fat": nutrition["fat"],

            "top_predictions": [

                {
                    "food": food_mapping.get(
                        p["label"].lower(),
                        p["label"]
                    ),

                    "confidence": round(
                        p["score"] * 100,
                        2
                    )
                }

                for p in predictions[:5]

            ]

        })

    except Exception as e:

        print("ERROR:", str(e))

        return jsonify({
            "error": str(e)
        }), 500


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)