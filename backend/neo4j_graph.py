from neo4j import GraphDatabase

NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "Llamar-FYP-gr@ph"

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def add_pdf_to_graph(file_name, content):
    with driver.session() as session:
        session.run(
            "CREATE (d:Document {name: $name, content: $content})",
            name=file_name, content=content[:500]  # Store part of content
        )

def query_graph():
    with driver.session() as session:
        result = session.run("MATCH (d:Document) RETURN d.name, d.content LIMIT 5")
        for record in result:
            print(f"📄 {record['d.name']} - {record['d.content']}")

query_graph()
