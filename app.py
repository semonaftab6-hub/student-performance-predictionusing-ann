from flask import Flask, render_template

# Create Flask app
app = Flask(__name__)

# ---------------- ROUTES ---------------- #

@app.route('/')
def home():
    # Default page: Login page
    return render_template('login.html')

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/train')
def train():
    return render_template('train.html')

@app.route('/upload')
def upload():
    return render_template('upload.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/predict')
def predict():
    return render_template('predict.html')

# ---------------------------------------- #

# Run the app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
