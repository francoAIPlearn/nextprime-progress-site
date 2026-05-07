import json
import os
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from google.cloud import storage


app = Flask(__name__)

BUCKET_NAME = os.environ["REVIEW_BUCKET"]
OBJECT_NAME = os.environ.get("REVIEW_OBJECT", "reviews/test4-reviews.json")
ALLOWED_ORIGINS = {
    "https://francoaiplearn.github.io",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
}

storage_client = storage.Client()
bucket = storage_client.bucket(BUCKET_NAME)


def get_blob():
    return bucket.blob(OBJECT_NAME)


def utc_now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def add_cors_headers(response):
    origin = request.headers.get("Origin", "")
    if origin in ALLOWED_ORIGINS:
      response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Max-Age"] = "3600"
    return response


@app.after_request
def after_request(response):
    return add_cors_headers(response)


def load_reviews():
    blob = get_blob()
    if not blob.exists():
        return {}
    raw = blob.download_as_text()
    if not raw.strip():
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}


def save_reviews(payload):
    blob = get_blob()
    blob.upload_from_string(
        json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True),
        content_type="application/json",
    )


def normalize_review(review):
    item_id = str(review.get("itemId", "")).strip()
    if not item_id.startswith("test4-BFW-WATER4-"):
        raise ValueError("itemId is invalid")
    body = review.get("review") or {}
    normalized = {
        "checked": bool(body.get("checked", False)),
        "rating": max(0, min(5, int(body.get("rating", 0) or 0))),
        "comment": str(body.get("comment", ""))[:8000],
        "updatedAt": utc_now(),
    }
    is_empty = (not normalized["checked"]) and normalized["rating"] == 0 and normalized["comment"] == ""
    return item_id, None if is_empty else normalized


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "object": f"gs://{BUCKET_NAME}/{OBJECT_NAME}"})


@app.route("/api/reviews/<path:item_id>", methods=["GET"])
def get_review(item_id):
    reviews = load_reviews()
    return jsonify({"itemId": item_id, "review": reviews.get(item_id)})


@app.route("/api/reviews", methods=["POST", "OPTIONS"])
def update_review():
    if request.method == "OPTIONS":
        return ("", 204)
    payload = request.get_json(silent=True) or {}
    try:
        item_id, review = normalize_review(payload)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    reviews = load_reviews()
    if review is None:
        reviews.pop(item_id, None)
    else:
        reviews[item_id] = review
    save_reviews(reviews)
    return jsonify({"ok": True, "itemId": item_id, "review": review})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8080")))
