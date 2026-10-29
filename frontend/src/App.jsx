
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "http://127.0.0.1:5000";

const FOOD_OPTIONS = [
  "Oats",
  "Rice",
  "White Rice",
  "Idli",
  "Pakode",
  "Sprouts",
  "Salad",
  "Cucumber",
  "Paneer",
  "Chana",
  "Curd",
  "Fruit Salad",
  "Pav Bhaji",
  "Chai",
  "Momos",
  "Chicken Curry",
  "Crispy Chicken",
  "Fried Rice",
  "Omelette",
  "Samosa",
  "Pizza",
  "Baked Potato",
  "Donut",
  "Fries",
  "Hot Dog",
  "Sandwich",
  "Taco",
  "Taquito",
  "Apple Pie",
  "Burger",
  "Butter Naan",
  "Chapati",
  "Cheesecake",
  "Chole Bhature",
  "Dal Makhani",
  "Dhokla",
  "Ice Cream",
  "Jalebi",
  "Kaathi Rolls",
  "Kadai Paneer",
  "Kulfi",
  "Masala Dosa",
  "Paani Puri",
  "Sushi",
];

function App() {
  const [page, setPage] = useState("home");

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState("");
  const [tracked, setTracked] = useState(false);

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("foodTrackerHistory")) || [];
    } catch {
      return [];
    }
  });

  const [profile, setProfile] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    goalWeight: "",
    activity: "moderate",
  });

  const [saved, setSaved] = useState(false);

  const healthyFoods = [
    { name: "Idli", info: "Light and easy to digest", icon: "🍘" },
    { name: "Sprouts", info: "Rich in protein and fibre", icon: "🌱" },
    { name: "Salad", info: "Low calorie and nutritious", icon: "🥗" },
    { name: "Oats", info: "Good source of fibre", icon: "🥣" },
    { name: "Chana", info: "Protein and fibre rich", icon: "🫘" },
    { name: "Curd", info: "Good source of protein", icon: "🥛" },
    { name: "Paneer", info: "Rich in protein", icon: "🧀" },
    { name: "Fruit Salad", info: "Natural source of vitamins", icon: "🍎" },
  ];

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("foodTrackerProfile");
      if (savedProfile) setProfile(JSON.parse(savedProfile));
    } catch (error) {
      console.error("Unable to load profile:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("foodTrackerHistory", JSON.stringify(history));
  }, [history]);

  const totalCalories = history.reduce(
    (total, item) => total + Number(item.calories || 0),
    0
  );

  const calculateBMI = () => {
    const weight = Number(profile.weight);
    const height = Number(profile.height);

    if (!weight || !height) return null;

    const heightInMeter = height / 100;
    return (weight / (heightInMeter * heightInMeter)).toFixed(1);
  };

  const bmi = calculateBMI();

  const getBMICategory = () => {
    if (!bmi) return "Enter your height and weight";
    if (Number(bmi) < 18.5) return "Underweight";
    if (Number(bmi) < 25) return "Normal";
    if (Number(bmi) < 30) return "Overweight";
    return "Obesity";
  };

  const calculateCalorieGoal = () => {
    const age = Number(profile.age);
    const weight = Number(profile.weight);
    const height = Number(profile.height);

    if (!age || !weight || !height || !profile.gender) return 1800;

    let bmr;

    if (profile.gender === "female") {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    }

    let activityMultiplier = 1.375;

    if (profile.activity === "low") activityMultiplier = 1.2;
    if (profile.activity === "moderate") activityMultiplier = 1.375;
    if (profile.activity === "active") activityMultiplier = 1.55;

    const maintenanceCalories = bmr * activityMultiplier;
    let goalCalories = maintenanceCalories;

    if (profile.goalWeight && Number(profile.goalWeight) < weight) {
      goalCalories = maintenanceCalories - 300;
    }

    return Math.max(Math.round(goalCalories), 1200);
  };

  const calorieGoal = calculateCalorieGoal();

  const remainingCalories = Math.max(calorieGoal - totalCalories, 0);

  const progress = Math.min((totalCalories / calorieGoal) * 100, 100);

  const currentWeight = Number(profile.weight);
  const goalWeight = Number(profile.goalWeight);

  const weightRemaining =
    currentWeight && goalWeight
      ? Math.max(currentWeight - goalWeight, 0)
      : 0;

  // Select an image
  const handleImage = (e) => {
    const file = e.target.files && e.target.files[0];

    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setSelectedFood("");
    setTracked(false);

    // Allow the same image to be selected again
    e.target.value = "";
  };

  // Send the image to the Flask AI backend
  const analyzeFood = async () => {
    if (!image) {
      alert("Please select a food image first.");
      return;
    }

    setLoading(true);
    setResult(null);
    setSelectedFood("");
    setTracked(false);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.post(
        `${API_BASE}/analyze`,
        formData
      );

      const data = response.data;

      setResult(data);
      setSelectedFood(data.food || "");
    } catch (error) {
      console.error("Analysis error:", error);
      alert(
        "Unable to analyze the image. Check that the Flask backend is running and the API address is correct."
      );
    } finally {
      setLoading(false);
    }
  };

  // Confirm the chosen food and fetch its nutrition information
  const confirmFood = async () => {
    if (!result || !selectedFood || tracked) return;

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE}/nutrition`,
        { food: selectedFood }
      );

      const nutrition = response.data;

      setResult((previous) => ({
        ...previous,
        food: nutrition.food,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
      }));

      setHistory((previous) => [
        ...previous,
        {
          id: Date.now(),
          food: nutrition.food,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
        },
      ]);

      setTracked(true);
      alert("Food added to your history!");
    } catch (error) {
      console.error("Nutrition error:", error);
      alert(
        "Nutrition data not found for this food. Check the backend nutrition route and nutrition_data."
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteHistory = (id) => {
    setHistory((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const saveProfile = () => {
    localStorage.setItem("foodTrackerProfile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateProfile = (field, value) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <div className="app">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="brand" onClick={() => setPage("home")}>
          <span className="brand-icon">🥗</span>
          <span>
            AI Food
            <strong>Nutrition Tracker</strong>
          </span>
        </div>

        <div className="nav-links">
          <button
            className={page === "home" ? "nav-active" : ""}
            onClick={() => setPage("home")}
          >
            🏠 Home
          </button>

          <button
            className={page === "scan" ? "nav-active" : ""}
            onClick={() => setPage("scan")}
          >
            📷 Scan
          </button>

          <button
            className={page === "history" ? "nav-active" : ""}
            onClick={() => setPage("history")}
          >
            📊 History
          </button>

          <button
            className={page === "healthy" ? "nav-active" : ""}
            onClick={() => setPage("healthy")}
          >
            🥗 Healthy Food
          </button>

          <button
            className={page === "profile" ? "nav-active" : ""}
            onClick={() => setPage("profile")}
          >
            👤 Profile
          </button>
        </div>
      </nav>

      {/* HOME */}
      {page === "home" && (
        <main className="page home-page">
          <section className="hero-section">
            <div className="hero-content">
              <span className="hero-badge">✨ Smart Food Tracking</span>

              <h1>
                AI Food Image
                <br />
                <span>Recognition & Nutrition Tracker</span>
              </h1>

              <h2>Eat Smart. Track Better. Live Healthier.</h2>

              <p>
                Upload your food image and get basic nutritional
                information with the help of AI-powered food recognition.
              </p>

              <p className="motivation-line">
                “Every healthy choice is a step towards a better you.”
              </p>

              <button
                className="primary-button"
                onClick={() => setPage("scan")}
              >
                📷 Scan Your Food
              </button>
            </div>

          </section>

          <section className="dashboard-section">
            <div className="section-heading">
              <div>
                <span className="small-label">YOUR DAILY OVERVIEW</span>
                <h2>📊 Today's Nutrition</h2>
              </div>
              <p>Keep track of what you eat today.</p>
            </div>

            <div className="nutrition-card">
              <div className="nutrition-left">
                <div className="calorie-circle">
                  <strong>{totalCalories}</strong>
                  <span>kcal</span>
                </div>
              </div>

              <div className="nutrition-right">
                <h3>Daily Calorie Goal</h3>

                <div className="goal-number">
                  {calorieGoal}
                  <span> kcal</span>
                </div>

                <div className="progress">
                  <div
                    className="progress-value"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="progress-info">
                  <span>{Math.round(progress)}% completed</span>
                  <span>{remainingCalories} kcal remaining</span>
                </div>
              </div>
            </div>
          </section>

          <section className="quick-scan-section">
            <div className="quick-scan-card">
              <div className="quick-scan-icon">📷</div>

              <div className="quick-scan-text">
                <span className="small-label">QUICK SCAN</span>
                <h2>What did you eat today?</h2>
                <p>Upload a food image and let AI identify it for you.</p>
              </div>

              <button
                className="primary-button"
                onClick={() => setPage("scan")}
              >
                Start Scanning →
              </button>
            </div>
          </section>
        </main>
      )}

      {/* SCAN */}
      {page === "scan" && (
        <main className="page">
          <div className="page-heading">
            <span className="small-label">AI FOOD RECOGNITION</span>
            <h1>Scan Your Food 📷</h1>
            <p>
              Upload a food image and get basic nutritional information.
            </p>
          </div>

          <div className="scan-box">
            <div className="scan-icon">📷</div>
            <h2>Upload Food Image</h2>
            <p>Choose an image from your device or take a photo.</p>

            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
            />

            {preview && (
              <img
                src={preview}
                alt="Food preview"
                className="scan-preview"
              />
            )}

            <button
              type="button"
              className="primary-button"
              onClick={analyzeFood}
              disabled={loading}
            >
              {loading ? "⏳ Analyzing..." : "✨ Analyze Food"}
            </button>
          </div>

          {result && (
            <div className="result-box">
              <span className="result-label">AI RESULT</span>

              <h2>{result.food}</h2>

              <p className="confidence">
                AI Confidence:{" "}
                {Number(result.confidence || 0).toFixed(2)}%
              </p>

              <div className="food-selection">
                <label htmlFor="food-select">Correct food item:</label>

                <select
                  id="food-select"
                  value={selectedFood}
                  onChange={(e) => {
                    setSelectedFood(e.target.value);
                    setTracked(false);
                  }}
                  disabled={tracked || loading}
                >
                  <option value="">-- Select food --</option>

                  {!FOOD_OPTIONS.includes(result.food) &&
                    result.food && (
                      <option value={result.food}>
                        {result.food}
                      </option>
                    )}

                  {FOOD_OPTIONS.map((food) => (
                    <option key={food} value={food}>
                      {food}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={confirmFood}
                disabled={loading || tracked || !selectedFood}
              >
                {loading
                  ? "⏳ Please wait..."
                  : tracked
                  ? "✓ Food Added to History"
                  : "✓ Confirm Food & Track"}
              </button>

              <div className="nutrition-details">
                <div>
                  <span>🔥 Calories</span>
                  <strong>{result.calories ?? "--"} kcal</strong>
                </div>

                <div>
                  <span>💪 Protein</span>
                  <strong>{result.protein ?? "--"} g</strong>
                </div>

                <div>
                  <span>🌾 Carbohydrates</span>
                  <strong>{result.carbs ?? "--"} g</strong>
                </div>

                <div>
                  <span>🥑 Fat</span>
                  <strong>{result.fat ?? "--"} g</strong>
                </div>
              </div>

              {!tracked && (
                <p>
                  Select the correct food and confirm it to add the
                  nutrition details to your history.
                </p>
              )}
            </div>
          )}
        </main>
      )}

      {/* HISTORY */}
      {page === "history" && (
        <main className="page">
          <div className="page-heading">
            <span className="small-label">YOUR PROGRESS</span>
            <h1>Your Food Journey 📊</h1>
            <p>
              Every meal you track is one step closer to your goal.
            </p>
          </div>

          <div className="history-total">
            <div>
              <span>TOTAL CALORIES</span>
              <strong>{totalCalories}</strong>
              <small>kcal consumed</small>
            </div>

            <div className="history-total-icon">🔥</div>
          </div>

          {history.length === 0 ? (
            <div className="empty-box">
              <div className="empty-icon">🍽️</div>
              <h3>No food scanned yet</h3>
              <p>
                Start scanning your food to build your nutrition history.
              </p>

              <button
                className="primary-button"
                onClick={() => setPage("scan")}
              >
                Scan Food
              </button>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div className="history-card" key={item.id}>
                  <div className="history-food-icon">🍽️</div>

                  <div className="history-info">
                    <h3>{item.food}</h3>
                    <p>🔥 {item.calories} kcal</p>
                    <span>
                      Protein {item.protein}g&nbsp;•&nbsp;
                      Carbs {item.carbs}g&nbsp;•&nbsp;
                      Fat {item.fat}g
                    </span>
                  </div>

                  <button
                    className="delete-button"
                    onClick={() => deleteHistory(item.id)}
                    aria-label={`Delete ${item.food} from history`}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* HEALTHY FOOD */}
      {page === "healthy" && (
        <main className="page">
          <div className="page-heading">
            <span className="small-label">HEALTHY CHOICES</span>
            <h1>Choose Better. Feel Better. 🥗</h1>
            <p>
              Simple and nutritious food choices for your daily meals.
            </p>
          </div>

          <div className="healthy-grid">
            {healthyFoods.map((food) => (
              <div className="healthy-card" key={food.name}>
                <div className="food-icon">{food.icon}</div>
                <h3>{food.name}</h3>
                <p>{food.info}</p>
                <span className="healthy-tag">Healthy Choice</span>

                <button
                  className="primary-button"
                  onClick={() => {
                    setImage(null);
                    setPreview(null);
                    setResult({
                      food: food.name,
                      confidence: 0,
                      calories: null,
                      protein: null,
                      carbs: null,
                      fat: null,
                    });
                    setSelectedFood(food.name);
                    setTracked(false);
                    setPage("scan");
                  }}
                >
                  Track this food
                </button>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* PROFILE */}
      {/* PROFILE */}
{page === "profile" && (
  <main className="page profile-page">
    <div className="profile-header">
      <div className="profile-avatar">
        {profile.gender === "male"
          ? "👨🏻"
          : profile.gender === "female"
          ? "👩🏻"
          : "👤"}
      </div>
      
            <div>
              <span className="small-label">PERSONAL DASHBOARD</span>
              <h1>
                {profile.name
                  ? `Hi, ${profile.name}!`
                  : "Your Health, Your Journey 💚"}
              </h1>
              <p>Small steps every day lead to big changes.</p>
            </div>
          </div>

          <div className="profile-layout">
            <div className="profile-box">
              <div className="box-heading">
                <span>👤</span>
                <div>
                  <h2>Personal Details</h2>
                  <p>Update your information</p>
                </div>
              </div>

              <label>Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={profile.name}
                onChange={(e) => updateProfile("name", e.target.value)}
              />

              <label>Age</label>
              <input
                type="number"
                placeholder="Enter age"
                value={profile.age}
                onChange={(e) => updateProfile("age", e.target.value)}
              />

              <label>Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => updateProfile("gender", e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>

              <label>Weight (kg)</label>
              <input
                type="number"
                placeholder="Enter current weight"
                value={profile.weight}
                onChange={(e) => updateProfile("weight", e.target.value)}
              />

              <label>Height (cm)</label>
              <input
                type="number"
                placeholder="Enter height"
                value={profile.height}
                onChange={(e) => updateProfile("height", e.target.value)}
              />

              <label>Goal Weight (kg)</label>
              <input
                type="number"
                placeholder="Enter goal weight"
                value={profile.goalWeight}
                onChange={(e) =>
                  updateProfile("goalWeight", e.target.value)
                }
              />

              <label>Activity Level</label>
              <select
                value={profile.activity}
                onChange={(e) => updateProfile("activity", e.target.value)}
              >
                <option value="low">🪑 Low Activity</option>
                <option value="moderate">🚶 Moderate Activity</option>
                <option value="active">🏃 Active</option>
              </select>

              <button
                className="primary-button save-button"
                onClick={saveProfile}
              >
                💾 Save Profile
              </button>

              {saved && (
                <p className="saved-message">
                  ✓ Profile saved successfully!
                </p>
              )}
            </div>

            <div className="profile-right">
              <div className="health-summary-card">
                <div className="summary-icon">📊</div>

                <div>
                  <span className="summary-label">HEALTH METRIC</span>
                  <h3>Your BMI</h3>

                  {bmi ? (
                    <>
                      <div className="big-number">{bmi}</div>
                      <p className="bmi-category">{getBMICategory()}</p>
                    </>
                  ) : (
                    <p className="bmi-placeholder">
                      Enter height and weight
                    </p>
                  )}
                </div>
              </div>

              <div className="health-summary-card calorie-summary">
                <div className="summary-icon">🔥</div>

                <div>
                  <span className="summary-label">DAILY TARGET</span>
                  <h3>Daily Calorie Goal</h3>

                  <div className="big-number">
                    {calorieGoal}
                    <span className="unit"> kcal</span>
                  </div>

                  <p>Estimated daily requirement</p>
                </div>
              </div>

              <div className="weight-progress-card">
                <div className="progress-title">
                  <div>
                    <span className="summary-label">YOUR GOAL</span>
                    <h3>⚖️ Weight Goal</h3>
                  </div>

                  <strong>{currentWeight || "--"} kg</strong>
                </div>

                <div className="weight-values">
                  <span>
                    Current
                    <strong>{currentWeight || "--"} kg</strong>
                  </span>

                  <span>
                    Goal
                    <strong>{goalWeight || "--"} kg</strong>
                  </span>
                </div>

                <div className="weight-bar">
                  <div
                    className="weight-bar-fill"
                    style={{
                      width:
                        goalWeight &&
                        currentWeight &&
                        currentWeight > goalWeight
                          ? "20%"
                          : "100%",
                    }}
                  />
                </div>

                {currentWeight &&
                  goalWeight &&
                  currentWeight > goalWeight && (
                    <p className="weight-remaining">
                      🎯 {weightRemaining} kg to reach your goal
                    </p>
                  )}
              </div>

              <div className="today-summary-card">
                <div className="today-header">
                  <div>
                    <span className="summary-label">TODAY</span>
                    <h3>🍽️ Today's Calories</h3>
                  </div>
                  <span className="today-icon">🔥</span>
                </div>

                <div className="today-calories">
                  <strong>{totalCalories}</strong>
                  <span>/ {calorieGoal} kcal</span>
                </div>

                <div className="progress">
                  <div
                    className="progress-value"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p>{remainingCalories} kcal remaining today</p>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;