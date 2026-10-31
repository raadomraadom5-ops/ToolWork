from flask import Flask, request, send_from_directory, jsonify
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONTENT_DIR = os.path.join(BASE_DIR, "content")

for folder in ["models", "decals", "sounds", "scripts", "images", "uploads"]:
    os.makedirs(os.path.join(CONTENT_DIR, folder), exist_ok=True)

ALLOWED_EXTENSIONS = {
    "model": (".rbxm", ".rbxmx"),
    "decal": (".png", ".jpg", ".jpeg", ".bmp", ".gif"),
    "sound": (".mp3", ".wav", ".ogg"),
    "script": (".lua", ".txt"),
    "image": (".png", ".jpg", ".jpeg", ".bmp", ".gif"),
}


def get_upload_folder(filename):
    name = filename.lower()
    if name.endswith(ALLOWED_EXTENSIONS["model"]):
        return "models"
    if name.endswith(ALLOWED_EXTENSIONS["decal"]):
        return "decals"
    if name.endswith(ALLOWED_EXTENSIONS["sound"]):
        return "sounds"
    if name.endswith(ALLOWED_EXTENSIONS["script"]):
        return "scripts"
    if name.endswith(ALLOWED_EXTENSIONS["image"]):
        return "images"
    return "uploads"


@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/styles.css")
def styles():
    return send_from_directory(BASE_DIR, "styles.css")


@app.route("/script.js")
def script():
    return send_from_directory(BASE_DIR, "script.js")


@app.route("/logo.png")
def logo():
    if os.path.exists(os.path.join(BASE_DIR, "logo.png")):
        return send_from_directory(BASE_DIR, "logo.png")
    return "", 404


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    filename = secure_filename(file.filename)
    if not filename:
        return jsonify({"error": "Empty filename"}), 400

    folder = get_upload_folder(filename)
    target_dir = os.path.join(CONTENT_DIR, folder)
    file_path = os.path.join(target_dir, filename)
    file.save(file_path)

    return jsonify({
        "status": "ok",
        "file": filename,
        "folder": folder,
        "url": f"/content/{folder}/{filename}"
    })


@app.route("/content/<path:path>")
def serve_content(path):
    return send_from_directory(CONTENT_DIR, path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
