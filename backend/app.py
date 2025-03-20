from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename

from backend.old_files.populate_db import update_database
from rag_pipeline import generate_answer
# from neo4j_graph import Neo4jHandler
from elasticsearch import Elasticsearch
from FlagEmbedding import BGEM3FlagModel  # BGE-M3 Model for embeddings

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "test_data"
ALLOWED_EXTENSIONS = {"pdf"}
# neo4j_handler = Neo4jHandler()

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Elasticsearch Setup
es = Elasticsearch("http://localhost:9200")  # Ensure ES is running
index_name = "financial_docs"
embedder = BGEM3FlagModel("BAAI/bge-m3")  # Load BGE-M3 model for embedding queries


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/query", methods=["POST"])
def query_endpoint():
    data = request.get_json()
    if not data or "query_text" not in data:
        return jsonify({"error": "Missing 'query_text' in request body."}), 400

    query_text = data["query_text"]
    try:
        # Call Neo4jHandler to search graph relationships
        response_text = generate_answer(query_text)
        return jsonify({"response": response_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/upload", methods=["POST"])
def upload_endpoint():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        try:
            update_database()
        except Exception as e:
            return jsonify({"error": "Failed to update the database", "details": str(e)}), 500

        return jsonify({"message": f"File {filename} uploaded and processed successfully."}), 200
    else:
        return jsonify({"error": "Invalid file type. Only PDF files are allowed."}), 400


def get_embedding(text):
    return embedder.encode(text).tolist()  # Convert embeddings to a list


@app.route("/search", methods=["POST"])
def search_docs():
    data = request.get_json()
    if not data or "query_text" not in data:
        return jsonify({"error": "Missing 'query_text' in request body."}), 400

    query_text = data["query_text"]
    query_embedding = get_embedding(query_text)

    try:
        response = es.search(index=index_name, body={
            "query": {
                "script_score": {
                    "query": {"match": {"text": query_text}},
                    "script": {
                        "source": "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                        "params": {"query_vector": query_embedding}
                    }
                }
            }
        })

        results = [{"text": res["_source"]["text"], "score": res["_score"]} for res in response["hits"]["hits"]]
        return jsonify({"results": results})

    except Exception as e:
        return jsonify({"error": f"Failed to perform search: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
