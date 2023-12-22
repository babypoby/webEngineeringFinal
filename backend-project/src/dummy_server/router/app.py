from flask import Flask, jsonify
import json
from flask_cors import CORS 

app = Flask(__name__)
CORS(app) 
geojson_paths = {
    'trainstations': 'src/dummy_server/resources/accessibility_1.geojson',
    'parkingspaces': 'src/dummy_server/resources/taz.behindertenparkplaetze_dav_p.json',
    'tramstations' : 'src/dummy_server/resources/tramstations.json'
}
@app.route('/api/data/<file_name>', methods=['GET'])
def get_geojson(file_name):
    try:
        file_path = geojson_paths.get(file_name)
        if file_path:
             with open(file_path, 'r') as file:
                geojson_data = json.load(file)
                return jsonify(geojson_data)
        else:
            return jsonify(error="GeoJSON file not found."), 404
    except FileNotFoundError:
        return jsonify(error="GeoJSON file not found."), 404
    except json.JSONDecodeError:
        return jsonify(error="Error decoding GeoJSON file."), 500

if __name__ == '__main__':
    app.run(host='localhost', port=8000, debug=True)
