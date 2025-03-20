from neo4j import GraphDatabase
from process_pdfs import process_pdf, process_directory

class Neo4jHandler:
    def __init__(self, uri="bolt://localhost:7687", user="neo4j", password="Llamar-FYP-gr@ph"):
        """Initialize Neo4j connection."""
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        """Closes the Neo4j database connection."""
        self.driver.close()

    def add_entity(self, entity_type, name):
        """Adds an entity node to the Neo4j graph if it doesn't already exist."""
        with self.driver.session() as session:
            query = f"MERGE (e:{entity_type} {{name: $name}})"
            session.run(query, name=name)

    def add_relationship(self, entity1, entity2, relationship):
        """Creates a relationship between two entities in the graph."""
        with self.driver.session() as session:
            query = """
                MATCH (a {name: $entity1}), (b {name: $entity2})
                MERGE (a)-[r:RELATIONSHIP {type: $relationship}]->(b)
            """
            session.run(query, entity1=entity1, entity2=entity2, relationship=relationship)

    def process_and_store(self, pdf_data):
        """Processes PDF entity data and stores it in Neo4j."""
        print(f"Storing entities from {pdf_data['file']} in Neo4j...")

        # Add entities to the graph
        for entity_type, entities in pdf_data["entities"].items():
            for entity in entities:
                self.add_entity(entity_type, entity)

        # Establish relationships
        for org in pdf_data["entities"].get("ORG", []):
            for case in pdf_data["entities"].get("LEGAL_CASE", []):
                self.add_relationship(org, case, "INVOLVED_IN")

            for person in pdf_data["entities"].get("PERSON", []):
                self.add_relationship(org, person, "ASSOCIATED_WITH")

            for financial in pdf_data["entities"].get("FINANCIAL_STATEMENT", []):
                self.add_relationship(org, financial, "GENERATED")

        print(f"Graph updated with data from {pdf_data['file']}!")

if __name__ == "__main__":
    neo4j_handler = Neo4jHandler()
    neo4j_handler.process_directory("test_data/")
    neo4j_handler.close()

# import time
# from watchdog.observers import Observer
# from watchdog.events import FileSystemEventHandler
# from neo4j import GraphDatabase
# from process_pdfs import process_pdf, process_directory

# class Neo4jHandler:
#     def __init__(self, uri="bolt://localhost:7687", user="neo4j", password="Llamar-FYP-gr@ph"):
#         """Initialize Neo4j connection."""
#         self.driver = GraphDatabase.driver(uri, auth=(user, password))

#     def close(self):
#         """Closes the Neo4j database connection."""
#         self.driver.close()

#     def add_entity(self, entity_type, name):
#         """Adds an entity node to the Neo4j graph if it doesn't already exist."""
#         with self.driver.session() as session:
#             query = f"MERGE (e:{entity_type} {{name: $name}})"
#             session.run(query, name=name)

#     def add_relationship(self, entity1, entity2, relationship):
#         """Creates a relationship between two entities in the graph if they don't already exist."""
#         with self.driver.session() as session:
#             query = """
#                 MATCH (a {name: $entity1}), (b {name: $entity2})
#                 MERGE (a)-[r:RELATIONSHIP {type: $relationship}]->(b)
#             """
#             session.run(query, entity1=entity1, entity2=entity2, relationship=relationship)

#     def process_and_store(self, pdf_data):
#         """Processes PDF entity data and stores it in Neo4j."""
#         print(f"Storing entities from {pdf_data['file']} in Neo4j...")

#         # Add entities to the graph
#         for entity_type, entities in pdf_data["entities"].items():
#             for entity in entities:
#                 self.add_entity(entity_type, entity)

#         # Establish relationships
#         for org in pdf_data["entities"].get("ORG", []):
#             for case in pdf_data["entities"].get("LEGAL_CASE", []):
#                 self.add_relationship(org, case, "INVOLVED_IN")

#             for person in pdf_data["entities"].get("PERSON", []):
#                 self.add_relationship(org, person, "ASSOCIATED_WITH")

#             for financial in pdf_data["entities"].get("FINANCIAL_STATEMENT", []):
#                 self.add_relationship(org, financial, "GENERATED")

#         print(f"Graph updated with data from {pdf_data['file']}!")

#     def process_directory(self, directory):
#         """Processes all PDFs in a directory."""
#         pdfs_data = process_directory(directory)
#         for pdf_data in pdfs_data:
#             self.process_and_store(pdf_data)

# # ====== Auto Update Graph when New PDFs are Added ======
# class PDFWatcher(FileSystemEventHandler):
#     def __init__(self, neo4j_handler, directory):
#         self.neo4j_handler = neo4j_handler
#         self.directory = directory

#     def on_created(self, event):
#         """Triggers when a new file is added to the directory."""
#         if event.src_path.endswith(".pdf"):
#             print(f"New file detected: {event.src_path}")
#             pdf_data = process_pdf(event.src_path)
#             self.neo4j_handler.process_and_store(pdf_data)

# def watch_directory(directory, neo4j_handler):
#     """Monitors a directory for new PDFs and updates Neo4j automatically."""
#     event_handler = PDFWatcher(neo4j_handler, directory)
#     observer = Observer()
#     observer.schedule(event_handler, directory, recursive=False)
#     observer.start()
    
#     print(f"Watching directory: {directory} for new PDFs...")
    
#     try:
#         while True:
#             time.sleep(5)
#     except KeyboardInterrupt:
#         observer.stop()
#     observer.join()

# # ====== Run the Graph Update ======
# if __name__ == "__main__":
#     data_dir = "fyp-backend/test_data/"
    
#     neo4j_handler = Neo4jHandler()
#     neo4j_handler.process_directory(data_dir)  # Process existing PDFs

#     # Start watching for new PDFs
#     watch_directory(data_dir, neo4j_handler)

#     neo4j_handler.close()