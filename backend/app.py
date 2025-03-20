from flask import Flask, request, jsonify
from flask_cors import CORS
from query_data import query_rag
import os
from werkzeug.utils import secure_filename
from neo4j_handler import Neo4jHandler
from process_pdfs import process_pdf, process_directory
from populate_db import update_database
import chromadb
from sentence_transformers import SentenceTransformer

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "test_data"
ALLOWED_EXTENSIONS = {"pdf"}
neo4j_handler = Neo4jHandler()

# chroma_client = chromadb.PersistentClient(path="chroma/")
# collection = chroma_client.get_or_create_collection(name="documents")
# model = SentenceTransformer("all-MiniLM-L6-v2")

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

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
        response_text = query_rag(query_text)
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
            # pdf_data = process_pdf(file_path)
            # neo4j_handler.process_and_store(pdf_data)
        except Exception as e:
            return jsonify({"error": "Failed to update the database", "details": str(e)}), 500
        
        return jsonify({"message": f"File {filename} uploaded and processed successfully."}), 200
    
    else:
        return jsonify({"error": "Invalid file type. Only PDF files are allowed."}), 400

# @app.route("/process_all", methods=["POST"])
# def process_all_pdfs():
#     """Processes all PDFs in the directory and adds them to Neo4j."""
#     try:
#         all_pdfs_data = process_directory(UPLOAD_FOLDER)
#         for pdf_data in all_pdfs_data:
#             neo4j_handler.process_and_store(pdf_data)

#         return jsonify({"message": f"Processed {len(all_pdfs_data)} PDFs and updated Neo4j."}), 200
#     except Exception as e:
#         return jsonify({"error": "Failed to process all PDFs", "details": str(e)}), 500

# @app.route("/search", methods=["POST"])
# def search():
#     """Hybrid search using both Neo4j and ChromaDB."""
#     data = request.get_json()
#     if not data or "query_text" not in data:
#         return jsonify({"error": "Missing 'query_text' in request body."}), 400

#     query_text = data["query_text"]

#     try:
#         # Query Neo4j
#         neo4j_results = neo4j_handler.query_graph(query_text)

#         # Query ChromaDB
#         embedding = model.encode(query_text).tolist()
#         chroma_results = collection.query(
#             query_embeddings=[embedding], n_results=3
#         )["metadatas"]

#         return jsonify({
#             "neo4j_results": neo4j_results,
#             "semantic_results": chroma_results
#         })
#     except Exception as e:
#         return jsonify({"error": "Search failed", "details": str(e)}), 500
    

if __name__ == "__main__":
    app.run(debug=True, port=5000)
