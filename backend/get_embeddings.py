from langchain_ollama import OllamaEmbeddings

def get_embedding_function():
    # embeddings = OllamaEmbeddings(model="nomic-embed-text")
    embeddings = OllamaEmbeddings(model="all-minilm")
    return embeddings

# import nltk
# from sentence_transformers import SentenceTransformer
# import chromadb

# nltk.download("punkt")

# model = SentenceTransformer("all-MiniLM-L6-v2")  # Small, efficient model

# def chunk_text(text, max_length=500):
#     sentences = nltk.sent_tokenize(text)
#     chunks = []
#     current_chunk = ""

#     for sentence in sentences:
#         if len(current_chunk) + len(sentence) < max_length:
#             current_chunk += sentence + " "
#         else:
#             chunks.append(current_chunk.strip())
#             current_chunk = sentence + " "

#     if current_chunk:
#         chunks.append(current_chunk.strip())

#     return chunks

# def generate_embeddings(text_chunks):
#     return [model.encode(chunk) for chunk in text_chunks]

# def process_and_store_embeddings(text, collection):
#     chunks = chunk_text(text)
#     embeddings = generate_embeddings(chunks)

#     for i, emb in enumerate(embeddings):
#         collection.add(
#             ids=[str(i)],
#             embeddings=[emb],
#             metadatas=[{"text": chunks[i]}]
#         )

#     return len(chunks)

# # Example usage
# if __name__ == "__main__":
#     chroma_client = chromadb.PersistentClient(path="chroma/")
#     collection = chroma_client.get_or_create_collection(name="documents")
#     text = "This is an example document. It contains several sentences."
#     num_chunks = process_and_store_embeddings(text, collection)
#     print(f"Stored {num_chunks} text chunks as embeddings.")
