# Crop Prediction Feature Integration Guide

This folder contains everything you need to copy the Crop Prediction feature to your other project without errors. 
Follow these foolproof instructions exactly as written.

## Folder Contents
- `model.pkl`: The trained machine learning model.
- `minmaxscaler.pkl`: The scaler used to normalize inputs.
- `crop_predictor.py`: A ready-to-use Python class that perfectly handles loading the model and making predictions.
- `frontend_assets/`: A folder containing the HTML templates and static files (images/CSS) from the original project.

---

## Step 1: Copy the files
1. Copy `model.pkl`, `minmaxscaler.pkl`, and `crop_predictor.py` into your new project. **They must be placed in the exact same folder as each other.**
2. If your new project is a Flask/Django app, copy the contents of `frontend_assets/templates` into your project's `templates` folder, and `frontend_assets/static` into your project's `static` folder.

## Step 2: Install Exact Dependencies
This is the #1 cause of errors. The model uses `pickle` which breaks if the library versions don't match exactly. Open your terminal in the new project and run:

```bash
pip install scikit-learn==1.3.2 numpy==1.26.4 pandas==2.1.4
```
*(If you are using a requirements.txt file in your new project, add these specific versions to it.)*

## Step 3: Integrate the Backend Code
In your new project (e.g., your new `app.py` or routing file), import the helper class we provided:

```python
from crop_predictor import CropPredictor

# Initialize the predictor once when your app starts
try:
    predictor = CropPredictor()
    print("Crop model loaded successfully!")
except Exception as e:
    print(f"Failed to load crop model: {e}")

# Inside your route/API endpoint that handles the form submission:
# @app.route('/predict_crop', methods=['POST'])
# def predict_crop():
    # 1. Extract values from your form
    N = request.form.get('Nitrogen')
    P = request.form.get('Phosporus')
    K = request.form.get('Potassium')
    temp = request.form.get('Temperature')
    humidity = request.form.get('Humidity')
    ph = request.form.get('Ph')
    rainfall = request.form.get('Rainfall')
    
    # 2. Get the prediction
    try:
        recommended_crop = predictor.predict(N, P, K, temp, humidity, ph, rainfall)
        result_message = f"{recommended_crop} is the best crop to be cultivated right there."
    except Exception as e:
        result_message = f"Error: {e}"
        
    # 3. Send it to the frontend
    # return render_template('your_template.html', result=result_message, crop=recommended_crop)
```

## Step 4: Integrate the Frontend (Keeping Your Theme Consistent)
The `frontend_assets` folder contains the original raw HTML. However, to keep your new project's frontend theme consistent, **do not just copy-paste the old HTML file.** Instead, integrate these elements into your existing web pages and style them using your current project's CSS (like Bootstrap, Tailwind, or your custom styles).

You need to ensure two things in your new frontend:

1. **The Form:** You can design the form to look however you want (use your project's CSS classes for styling), but it **must** submit these 7 specific field names so your backend can read them. Here is the barebones structure you need to adapt to your theme:
```html
<!-- Add your own classes to style this form consistently with your project -->
<form action="/predict_crop" method="POST" class="your-custom-form-class">
    <!-- Style the inputs using your project's standard input classes -->
    <input type="number" name="Nitrogen" class="your-input-class" required>
    <input type="number" name="Phosporus" class="your-input-class" required>
    <input type="number" name="Potassium" class="your-input-class" required>
    <input type="number" name="Temperature" step="0.01" class="your-input-class" required>
    <input type="number" name="Humidity" step="0.01" class="your-input-class" required>
    <input type="number" name="Ph" step="0.01" class="your-input-class" required>
    <input type="number" name="Rainfall" step="0.01" class="your-input-class" required>
    
    <!-- Style the button to match your theme -->
    <button type="submit" class="your-btn-class">Predict</button>
</form>
```

2. **The Output:** When the backend returns the result, display it using your project's UI components (like a nice styled card, modal, or alert box). The images are located in `static/images/crops/`. 

```html
{% if result %}
    <!-- Style this result container to match your theme -->
    <div class="your-result-card-class">
        <h2 class="your-heading-class">{{ result }}</h2>
        <img src="{{ url_for('static', filename='images/crops/' + crop.lower() + '.jpg') }}" alt="crop image" class="your-image-class">
    </div>
{% endif %}
```
*(Note: Some original images had weird casing like `Jute.jpg` or `kidneybeans.jpg`. Make sure the image filenames in your static folder map perfectly to the crop names, or rename the images to all-lowercase to make it easier).*

## Troubleshooting
- **"ModuleNotFoundError" or "UserWarning"**: You didn't install `scikit-learn==1.3.2`. 
- **"ValueError: Expected 2D array"**: You tried to bypass `crop_predictor.py` and passed a flat list to the model. Use the `CropPredictor` class!
- **"FileNotFoundError"**: The `model.pkl` and `minmaxscaler.pkl` files are not in the same directory as `crop_predictor.py`.
