import pickle
import numpy as np
import os

class CropPredictor:
    """
    A foolproof class to load the trained model and scaler, 
    and make crop recommendations based on soil/climate features.
    """
    def __init__(self, model_path=None, scaler_path=None):
        # By default, looks for the pkl files in the exact same folder as this script.
        base_dir = os.path.dirname(os.path.abspath(__file__))
        
        if model_path is None:
            model_path = os.path.join(base_dir, 'model.pkl')
        if scaler_path is None:
            scaler_path = os.path.join(base_dir, 'minmaxscaler.pkl')
            
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at: {model_path}. Make sure you copied model.pkl to the correct folder.")
        if not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Scaler file not found at: {scaler_path}. Make sure you copied minmaxscaler.pkl to the correct folder.")
            
        # Load models
        with open(model_path, 'rb') as f:
            self.model = pickle.load(f)
            
        with open(scaler_path, 'rb') as f:
            self.scaler = pickle.load(f)
            
        # Dictionary mapping prediction IDs to actual crop names
        self.crop_dict = {
            1: "Rice", 2: "Maize", 3: "Jute", 4: "Cotton", 5: "Coconut", 
            6: "Papaya", 7: "Orange", 8: "Apple", 9: "Muskmelon", 
            10: "Watermelon", 11: "Grapes", 12: "Mango", 13: "Banana",
            14: "Pomegranate", 15: "Lentil", 16: "Blackgram", 17: "Mungbean", 
            18: "Mothbeans", 19: "Pigeonpeas", 20: "Kidneybeans", 
            21: "Chickpea", 22: "Coffee"
        }

    def predict(self, N, P, K, temperature, humidity, ph, rainfall):
        """
        Takes 7 numeric features and returns the best crop name.
        All inputs must be numbers (float or int).
        """
        try:
            # 1. Prepare feature list in exact order
            feature_list = [float(N), float(P), float(K), float(temperature), float(humidity), float(ph), float(rainfall)]
            
            # 2. Reshape into a 2D array for sklearn
            single_pred = np.array(feature_list).reshape(1, -1)
            
            # 3. Apply the MinMax scaler (CRITICAL STEP - DO NOT SKIP)
            scaled_features = self.scaler.transform(single_pred)
            
            # 4. Predict
            prediction = self.model.predict(scaled_features)
            
            # 5. Map to string
            return self.crop_dict.get(prediction[0], "Unknown")
            
        except ValueError as e:
            raise ValueError(f"All inputs must be valid numbers. Error: {e}")
        except Exception as e:
            raise RuntimeError(f"An error occurred during prediction: {e}")

# Example Usage:
if __name__ == "__main__":
    predictor = CropPredictor()
    # Mock data: N=90, P=42, K=43, Temp=20.8, Hum=82, pH=6.5, Rain=202.9
    result = predictor.predict(90, 42, 43, 20.8, 82, 6.5, 202.9)
    print(f"Test Prediction: The recommended crop is {result}")
