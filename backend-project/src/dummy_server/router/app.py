from flask import Flask, jsonify
import json
from flask_cors import CORS 

app = Flask(__name__)
CORS(app) 

@app.route('/api/data', methods=['GET'])
def get_geojson():
    try:
        with open('/Users/linusmeiehofer/Documents/Code/FundamentalsWebEngineering/lmeierhoefer_project_flask/backend-project/src/dummy_server/resources/accessibility_1.geojson', 'r') as file:
            geojson_data = json.load(file)
            return jsonify(geojson_data)
    except FileNotFoundError:
        return jsonify(error="GeoJSON file not found."), 404
    except json.JSONDecodeError:
        return jsonify(error="Error decoding GeoJSON file."), 500

if __name__ == '__main__':
    app.run(host='localhost', port=8000, debug=True)
