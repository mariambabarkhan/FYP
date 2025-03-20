from elasticsearch import Elasticsearch
from flagembedding import BGEM3EmbeddingFunction  # BGE-M3 model

# Connect to Elasticsearch
es = Elasticsearch("http://localhost:9200")

index_name = "financial_docs"

# Load embedding model
embedder = BGEM3EmbeddingFunction("BAAI/bge-m3")

def get_embedding(text):
    return embedder.encode(text).tolist()  # Convert to list for Elasticsearch

def search(query):
    query_embedding = get_embedding(query)

    response = es.search(index=index_name, body={
        "query": {
            "script_score": {
                "query": {"match": {"text": query}},
                "script": {
                    "source": "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                    "params": {"query_vector": query_embedding}
                }
            }
        }
    })

    results = response["hits"]["hits"]
    for res in results:
        print(f"Match: {res['_source']['text']}")

if __name__ == "__main__":
    search("financial risk analysis")
