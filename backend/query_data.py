import argparse
from langchain_community.vectorstores import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain_community.llms.ollama import Ollama
from get_embeddings import get_embedding_function

CHROMA_PATH = "chroma"

PROMPT_TEMPLATE = """
Answer the question based only on the following context:

{context}

---

Answer the question based on the above context: {question}
"""

def query_rag(query_text: str):
    embedding_function = get_embedding_function()
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

    results = db.similarity_search_with_score(query_text, k=5)

    context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query_text)

    model = Ollama(model="mistral")
    response_text = model.invoke(prompt)

    sources = [doc.metadata.get("id", None) for doc, _score in results]
    formatted_response = f"Response: {response_text}\nSources: {sources}"
    print(formatted_response)
    return response_text

# def query_neo4j(entity_name):
#     with neo4j_handler.driver.session() as session:
#         result = session.run(f"MATCH (e {{name: '{entity_name}'}}) RETURN e")
#         return [record["e"]["name"] for record in result]

# def query_chromadb(query_text):
#     results = collection.query(query_text, n_results=3)
#     return [res["text"] for res in results]

# def query_pipeline(query_text):
#     neo4j_results = query_neo4j(query_text)

#     if neo4j_results:
#         print("Structured knowledge found in Neo4j:", neo4j_results)
#         return neo4j_results

#     print("Fallback to ChromaDB for similarity search.")
#     return query_chromadb(query_text)

# # Example Usage
# query_text = "Who is mentioned in the document?"
# response = query_pipeline(query_text)
# print(response)
