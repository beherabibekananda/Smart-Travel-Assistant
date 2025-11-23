import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import pickle
import os

class DietCompatibilityModel:
    def __init__(self):
        self.model = None
        self.vectorizer = None

    def train(self):
        """
        Trains a simple Logistic Regression model on synthetic data.
        """
        # Synthetic Data Generation
        data = [
            # VEG
            ("paneer butter masala veg indian creamy", "VEG", 1),
            ("chicken curry non-veg spicy", "VEG", 0),
            ("dal makhani veg lentils", "VEG", 1),
            ("beef burger non-veg", "VEG", 0),
            ("vegetable biryani veg rice", "VEG", 1),
            
            # VEGAN
            ("paneer butter masala veg dairy", "VEGAN", 0),
            ("salad fresh vegetables vegan", "VEGAN", 1),
            ("chicken wings non-veg", "VEGAN", 0),
            ("tofu stir fry vegan", "VEGAN", 1),
            ("milkshake dairy", "VEGAN", 0),

            # JAIN
            ("onion rings veg onion", "JAIN", 0),
            ("garlic bread veg garlic", "JAIN", 0),
            ("jain paneer veg no onion no garlic", "JAIN", 1),
            ("fruit salad veg", "JAIN", 1),
            ("potato fries veg root", "JAIN", 0), # Simplified assumption

            # NON_VEG_NO_BEEF
            ("chicken curry non-veg", "NON_VEG_NO_BEEF", 1),
            ("beef steak non-veg beef", "NON_VEG_NO_BEEF", 0),
            ("mutton biryani non-veg", "NON_VEG_NO_BEEF", 1),
            ("pork ribs non-veg", "NON_VEG_NO_BEEF", 1),
            ("veg burger veg", "NON_VEG_NO_BEEF", 1),

            # LOW_CARB
            ("rice bowl carbs", "LOW_CARB", 0),
            ("grilled chicken protein healthy", "LOW_CARB", 1),
            ("pasta italian carbs", "LOW_CARB", 0),
            ("salad greens healthy", "LOW_CARB", 1),
            ("pizza dough carbs", "LOW_CARB", 0),

            # DIABETIC_FRIENDLY
            ("chocolate cake sugar sweet", "DIABETIC_FRIENDLY", 0),
            ("oats porridge healthy fiber", "DIABETIC_FRIENDLY", 1),
            ("soda sugar drink", "DIABETIC_FRIENDLY", 0),
            ("grilled fish healthy protein", "DIABETIC_FRIENDLY", 1),
            ("white bread refined carbs", "DIABETIC_FRIENDLY", 0),
        ]

        # Expand dataset slightly by repeating
        data = data * 10

        df = pd.DataFrame(data, columns=["text", "diet_type", "label"])

        # Feature Engineering: Combine text + diet_type
        # We'll just append diet_type to text to let TF-IDF pick up the interaction
        # A better way would be separate features, but this is simple and effective for this scale.
        df["feature_text"] = df["text"] + " " + df["diet_type"]

        X = df["feature_text"]
        y = df["label"]

        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer()),
            ('clf', LogisticRegression())
        ])

        self.pipeline.fit(X, y)
        print("Diet Compatibility Model trained.")

    def predict(self, diet_type: str, menu_text: str) -> float:
        """
        Predicts compatibility score (probability of being suitable).
        """
        if not self.pipeline:
            self.train()
        
        feature_text = menu_text + " " + diet_type
        # Get probability of class 1 (Suitable)
        prob = self.pipeline.predict_proba([feature_text])[0][1]
        return prob

diet_model = DietCompatibilityModel()
