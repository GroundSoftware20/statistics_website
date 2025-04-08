import os
from flask import Flask, render_template, jsonify
import pandas as pd

app = Flask(__name__)
EXCEL_FILE_PATH = os.path.join(app.root_path, "static", "data", "input_data.xlsx")
@app.route('/api/get-excel-data', methods=['GET'])
def get_excel_data():
    try:
        # Read the Excel file
        data = pd.read_excel(EXCEL_FILE_PATH)
        data.columns = data.columns.astype(str)
        data.fillna("", inplace=True)

        # Convert the DataFrame to a dictionary (convert to JSON-friendly format)
        data_dict = data.to_dict(orient='records')  # Each row becomes a dictionary

        return jsonify(data_dict)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def HOME():  
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)