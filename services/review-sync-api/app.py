import json
import os
import uuid
from datetime import datetime, timezone
from urllib.parse import quote

from flask import Flask, Response, jsonify, request
from google.cloud import storage


app = Flask(__name__)

BUCKET_NAME = os.environ["REVIEW_BUCKET"]
OBJECT_NAME = os.environ.get("REVIEW_OBJECT", "reviews/test4-reviews.json")
ATTACHMENT_PREFIX = os.environ.get("REVIEW_ATTACHMENT_PREFIX", "reviews/test4-attachments")
MAX_ATTACHMENT_BYTES = int(os.environ.get("REVIEW_MAX_ATTACHMENT_BYTES", str(15 * 1024 * 1024)))
PUBLIC_BASE_URL = os.environ.get("PUBLIC_BASE_URL", "").rstrip("/")
ALLOWED_ORIGINS = {
    "https://francoaiplearn.github.io",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
}

storage_client = storage.Client()
bucket = storage_client.bucket(BUCKET_NAME)


def get_blob():
    return bucket.blob(OBJECT_NAME)


def get_attachment_blob(object_path):
    return bucket.blob(object_path)


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


def normalize_item_id(value):
    item_id = str(value or "").strip()
    if not item_id.startswith("test4-BFW-WATER4-"):
        raise ValueError("itemId is invalid")
    return item_id


def attachment_download_url(item_id, attachment_id):
    path = f"/api/reviews/{quote(item_id, safe='')}/attachments/{quote(attachment_id, safe='')}"
    if PUBLIC_BASE_URL:
        return f"{PUBLIC_BASE_URL}{path}"
    return path


def normalize_review(review):
    item_id = normalize_item_id(review.get("itemId", ""))
    body = review.get("review") or {}
    normalized = {
        "checked": bool(body.get("checked", False)),
        "rating": max(0, min(5, int(body.get("rating", 0) or 0))),
        "comment": str(body.get("comment", ""))[:8000],
        "updatedAt": utc_now(),
    }
    is_empty = (not normalized["checked"]) and normalized["rating"] == 0 and normalized["comment"] == ""
    return item_id, None if is_empty else normalized


def decorate_review(item_id, review):
    if not review:
        return None
    payload = dict(review)
    attachments = []
    for attachment in review.get("attachments", []) or []:
        item = dict(attachment)
        item["downloadUrl"] = attachment_download_url(item_id, item["id"])
        attachments.append(item)
    payload["attachments"] = attachments
    return payload


def delete_attachments(review):
    for attachment in (review or {}).get("attachments", []) or []:
        object_path = attachment.get("objectPath")
        if object_path:
            get_attachment_blob(object_path).delete()


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "object": f"gs://{BUCKET_NAME}/{OBJECT_NAME}", "attachmentPrefix": ATTACHMENT_PREFIX})


@app.route("/api/reviews/<path:item_id>", methods=["GET"])
def get_review(item_id):
    reviews = load_reviews()
    return jsonify({"itemId": item_id, "review": decorate_review(item_id, reviews.get(item_id))})


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
    existing = reviews.get(item_id) or {}
    if review is None:
        delete_attachments(existing)
        reviews.pop(item_id, None)
    else:
        review["attachments"] = existing.get("attachments", []) or []
        reviews[item_id] = review
    save_reviews(reviews)
    return jsonify({"ok": True, "itemId": item_id, "review": decorate_review(item_id, reviews.get(item_id))})


@app.route("/api/reviews/<path:item_id>/attachments", methods=["POST", "OPTIONS"])
def upload_attachment(item_id):
    if request.method == "OPTIONS":
        return ("", 204)
    try:
        item_id = normalize_item_id(item_id)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "file is required"}), 400
    data = file.read()
    if not data:
        return jsonify({"error": "file is empty"}), 400
    if len(data) > MAX_ATTACHMENT_BYTES:
        return jsonify({"error": f"file exceeds {MAX_ATTACHMENT_BYTES} bytes"}), 413

    attachment_id = uuid.uuid4().hex[:12]
    original_name = os.path.basename(file.filename or "attachment.bin") or "attachment.bin"
    object_path = f"{ATTACHMENT_PREFIX}/{item_id}/{attachment_id}-{original_name}"
    get_attachment_blob(object_path).upload_from_string(
        data,
        content_type=file.mimetype or "application/octet-stream",
    )

    reviews = load_reviews()
    review = reviews.get(item_id) or {"checked": False, "rating": 0, "comment": "", "updatedAt": utc_now(), "attachments": []}
    attachments = review.get("attachments", []) or []
    attachments.append({
        "id": attachment_id,
        "name": original_name,
        "size": len(data),
        "type": file.mimetype or "application/octet-stream",
        "objectPath": object_path,
        "uploadedAt": utc_now(),
    })
    review["attachments"] = attachments
    review["updatedAt"] = utc_now()
    reviews[item_id] = review
    save_reviews(reviews)
    return jsonify({"ok": True, "itemId": item_id, "review": decorate_review(item_id, review)})


@app.route("/api/reviews/<path:item_id>/attachments/<attachment_id>", methods=["GET", "DELETE", "OPTIONS"])
def attachment_detail(item_id, attachment_id):
    if request.method == "OPTIONS":
        return ("", 204)
    reviews = load_reviews()
    review = reviews.get(item_id)
    if not review:
        return jsonify({"error": "review not found"}), 404
    attachments = review.get("attachments", []) or []
    match = next((attachment for attachment in attachments if attachment.get("id") == attachment_id), None)
    if not match:
        return jsonify({"error": "attachment not found"}), 404

    if request.method == "DELETE":
        object_path = match.get("objectPath")
        if object_path:
            get_attachment_blob(object_path).delete()
        review["attachments"] = [attachment for attachment in attachments if attachment.get("id") != attachment_id]
        review["updatedAt"] = utc_now()
        if not review["attachments"] and not review.get("checked") and int(review.get("rating", 0) or 0) == 0 and not review.get("comment"):
            reviews.pop(item_id, None)
            current = None
        else:
            reviews[item_id] = review
            current = review
        save_reviews(reviews)
        return jsonify({"ok": True, "itemId": item_id, "review": decorate_review(item_id, current)})

    blob = get_attachment_blob(match["objectPath"])
    if not blob.exists():
        return jsonify({"error": "attachment object missing"}), 404
    payload = blob.download_as_bytes()
    response = Response(payload, mimetype=match.get("type") or "application/octet-stream")
    response.headers["Content-Disposition"] = f'inline; filename="{match.get("name", "attachment")}"'
    response.headers["Cache-Control"] = "private, max-age=300"
    return response


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8080")))
