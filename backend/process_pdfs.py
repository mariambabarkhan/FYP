from elasticsearch import Elasticsearch
import fitz  # PyMuPDF
import os
from FlagEmbedding import BGEM3FlagModel
from llama_index.core.node_parser import SentenceSplitter

# Elasticsearch Configuration
ELASTICSEARCH_URL = "http://localhost:9200"
INDEX_NAME = "financial_docs"

# Connect to Elasticsearch
es = Elasticsearch(ELASTICSEARCH_URL)
if es.ping():
    print("Connected to Elasticsearch ✅")
else:
    raise Exception("Failed to connect to Elasticsearch ❌")

# Define Index Mapping (Only run once)
index_mapping = {
    "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 0
    },
    "mappings": {
        "properties": {
            "text": {"type": "text"},
            "embedding": {"type": "dense_vector", "dims": 1024}  # BGE-M3 uses 1024-dim vectors
        }
    }
}

if not es.indices.exists(index=INDEX_NAME):
    es.indices.create(index=INDEX_NAME, body=index_mapping)
    print(f"Index '{INDEX_NAME}' created ✅")
else:
    print(f"Index '{INDEX_NAME}' already exists ✅")

# Load BGE-M3 model (only once to avoid reloading every time)
bge_model = BGEM3FlagModel("BAAI/bge-m3")


def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text("text") + "\n"
    return text


def get_embedding(text):
    """Generate BGE-M3 embedding for the text."""
    return bge_model.encode(text)


def process_pdfs(data_dir="data"):
    """Process all PDFs in the specified directory and index them into Elasticsearch."""
    for filename in os.listdir(data_dir):
        if filename.endswith(".pdf"):
            pdf_path = os.path.join(data_dir, filename)
            text = extract_text_from_pdf(pdf_path)

            # Chunk text using LlamaIndex
            splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)
            chunks = splitter.split_text(text)

            for chunk in chunks:
                embedding = get_embedding(chunk)

                # Store in Elasticsearch
                es.index(index=INDEX_NAME, body={
                    "text": chunk,
                    "embedding": embedding
                })
            print(f"✅ Indexed {filename} successfully!")


if __name__ == "__main__":
    process_pdfs()