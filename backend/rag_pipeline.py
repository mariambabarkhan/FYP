from elasticsearch import Elasticsearch
from ctransformers import AutoModelForCausalLM
from FlagEmbedding import BGEM3FlagModel

embedder = BGEM3FlagModel('BAAI/bge-m3', use_fp16=True)

# Connect to Elasticsearch
es = Elasticsearch("http://localhost:9200")

# Load Mistral 7B Model
llm = AutoModelForCausalLM.from_pretrained("TheBloke/Mistral-7B-Instruct-v0.2-GGUF", model_type="mistral")

def search_financial_data(query):
    """Hybrid search in Elasticsearch."""
    query_vector = embedder.encode(query).tolist()

    search_query = {
        "query": {
            "bool": {
                "should": [
                    {"match": {"text": query}},  # Keyword search
                    {"script_score": {  # Vector search
                        "query": {"match_all": {}},
                        "script": {
                            "source": "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                            "params": {"query_vector": query_vector}
                        }
                    }}
                ]
            }
        }
    }

    results = es.search(index="financial_reports", body=search_query)
    return results["hits"]["hits"]

def generate_answer(query):
    """Retrieves data & generates answer using Mistral 7B."""
    docs = search_financial_data(query)
    context = " ".join([doc["_source"]["text"] for doc in docs])
    prompt = f"Context: {context}\n\nQuestion: {query}\nAnswer: "
    response = llm.generate(prompt)
    return response
