"""
generate_dataset.py
Generates a synthetic but realistic house-price dataset (CSV) used to train
and evaluate the ML models for the AI Real Estate Price Predictor.

Run:
    python generate_dataset.py
Produces:
    house_data.csv  (in the same folder)
"""

import csv
import random
import os

random.seed(42)

LOCATIONS = [
    ("Downtown", 1.35), ("Suburb North", 1.05), ("Suburb South", 0.95),
    ("Riverside", 1.20), ("Industrial Zone", 0.75), ("Hill View", 1.40),
    ("City Center", 1.50), ("Countryside", 0.65), ("Tech Park Area", 1.25),
    ("Old Town", 0.85),
]

FURNISHING = ["Unfurnished", "Semi-Furnished", "Fully-Furnished"]

BASE_PRICE_PER_SQFT = 3200  # base currency unit per sqft


def make_row(i):
    area = random.randint(450, 4500)  # sqft
    bedrooms = random.randint(1, 6)
    bathrooms = max(1, min(bedrooms, random.randint(1, bedrooms + 1)))
    stories = random.randint(1, 4)
    parking = random.randint(0, 3)
    location, loc_multiplier = random.choice(LOCATIONS)
    furnishing = random.choice(FURNISHING)
    furnishing_multiplier = {"Unfurnished": 0.92, "Semi-Furnished": 1.0, "Fully-Furnished": 1.12}[furnishing]
    age_years = random.randint(0, 40)
    age_factor = max(0.6, 1 - age_years * 0.008)
    amenities_score = random.randint(0, 10)  # pool, gym, security, garden etc combined score

    noise = random.uniform(0.9, 1.1)

    price = (
        area * BASE_PRICE_PER_SQFT
        * loc_multiplier
        * furnishing_multiplier
        * age_factor
        * (1 + 0.03 * bedrooms)
        * (1 + 0.02 * bathrooms)
        * (1 + 0.015 * stories)
        * (1 + 0.01 * parking)
        * (1 + 0.02 * amenities_score)
        * noise
    )

    return {
        "id": i,
        "area": area,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "stories": stories,
        "parking": parking,
        "location": location,
        "furnishing": furnishing,
        "age_years": age_years,
        "amenities_score": amenities_score,
        "price": round(price, 2),
    }


def main():
    n_rows = 3000
    out_path = os.path.join(os.path.dirname(__file__), "house_data.csv")
    fieldnames = [
        "id", "area", "bedrooms", "bathrooms", "stories", "parking",
        "location", "furnishing", "age_years", "amenities_score", "price",
    ]
    with open(out_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for i in range(1, n_rows + 1):
            writer.writerow(make_row(i))

    print(f"Generated {n_rows} rows -> {out_path}")


if __name__ == "__main__":
    main()
