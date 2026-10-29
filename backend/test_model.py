from transformers import pipeline
from PIL import Image

print("Loading Indian + Western Food AI model...")

classifier = pipeline(
    "image-classification",
    model="prithivMLmods/Indian-Western-Food-34"
)

print("Model loaded successfully!")

image_path = "oats.png.png"

image = Image.open(image_path).convert("RGB")

print("Image loaded successfully!")

result = classifier(image)

print("\nFood predictions:")

for prediction in result[:5]:
    print(
        prediction["label"],
        "->",
        round(prediction["score"] * 100, 2),
        "%"
    )