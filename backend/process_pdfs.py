import fitz  # PyMuPDF
import spacy
import re
import os
from collections import defaultdict

nlp = spacy.load("en_core_web_trf")  # Transformer-based NLP model

def extract_text(pdf_path):
    """Extracts text from a given PDF file."""
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text("text") + "\n"
    return text

def extract_entities(text):
    """Extracts named entities (ORG, PERSON, DATE, GPE, LEGAL_CASE, FINANCIAL_STATEMENT)."""
    doc = nlp(text)
    entities = defaultdict(set)

    for ent in doc.ents:
        label = ent.label_
        if label in {"ORG", "PERSON", "GPE", "DATE"}:
            entities[label].add(ent.text.strip().lower())

    return {key: list(value) for key, value in entities.items()}

def process_pdf(pdf_path):
    """Processes a single PDF."""
    print(f"Processing PDF: {pdf_path}...")
    text = extract_text(pdf_path)
    entities = extract_entities(text)

    return {
        "file": os.path.basename(pdf_path),
        "text": text,
        "entities": entities
    }

def process_directory(directory):
    """Processes all PDFs in a directory."""
    pdf_files = [f for f in os.listdir(directory) if f.endswith(".pdf")]
    return [process_pdf(os.path.join(directory, pdf)) for pdf in pdf_files]

if __name__ == "__main__":
    data_dir = "test_data/"
    all_pdfs_data = process_directory(data_dir)
    print(f"Processed {len(all_pdfs_data)} PDFs.")


# import fitz  # PyMuPDF
# import spacy
# import re
# import os
# from collections import defaultdict

# nlp = spacy.load("en_core_web_trf")  # Transformer-based NLP model

# def extract_text(pdf_path):
#     """Extracts text from a given PDF file."""
#     doc = fitz.open(pdf_path)
#     text = ""
#     for page in doc:
#         text += page.get_text("text") + "\n"
#     return text

# def extract_entities(text):
#     """Extracts named entities (ORG, PERSON, DATE, GPE, LEGAL_CASE, FINANCIAL_STATEMENT) from text."""
#     doc = nlp(text)
#     entities = defaultdict(set)

#     for ent in doc.ents:
#         label = ent.label_
#         if label in {"ORG", "PERSON", "GPE", "DATE"}:
#             entities[label].add(ent.text.strip().lower())

#     # Detect legal cases
#     legal_case_patterns = [
#         r"(Supreme Court of Pakistan|Islamabad High Court|Sindh High Court).*?case",
#         r"litigation.*?against.*?",
#     ]
#     for pattern in legal_case_patterns:
#         matches = re.findall(pattern, text, re.IGNORECASE)
#         entities["LEGAL_CASE"].update(matches)

#     # Detect financial statements (example: "Profit after Tax: Rs 85.3 billion")
#     financial_patterns = [
#         r"Profit after Tax of Rs ([\d,]+\.?\d*) billion",
#         r"Sales Revenue.*?Rs ([\d,]+\.?\d*) billion",
#     ]
#     for pattern in financial_patterns:
#         matches = re.findall(pattern, text, re.IGNORECASE)
#         entities["FINANCIAL_STATEMENT"].update([f"Rs {m} billion" for m in matches])

#     return {key: list(value) for key, value in entities.items()}  # Convert sets to lists

# def process_pdf(pdf_path):
#     """Processes a PDF file and extracts structured information."""
#     print(f"Processing PDF: {pdf_path}...")
#     text = extract_text(pdf_path)
#     entities = extract_entities(text)

#     return {
#         "file": os.path.basename(pdf_path),
#         "text": text,
#         "entities": entities
#     }

# def process_directory(pdf_directory):
#     """Processes all PDFs in a directory."""
#     pdf_files = [f for f in os.listdir(pdf_directory) if f.endswith(".pdf")]
#     processed_data = []
    
#     for pdf_file in pdf_files:
#         pdf_path = os.path.join(pdf_directory, pdf_file)
#         processed_data.append(process_pdf(pdf_path))

#     return processed_data

# if __name__ == "__main__":
#     data_dir = "fyp-backend/test_data/"
#     all_pdfs_data = process_directory(data_dir)
#     print(f"Processed {len(all_pdfs_data)} PDFs.")