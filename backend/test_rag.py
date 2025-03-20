from query_data import query_rag
import io
import pytest
from app import app

# Fixture to get the test client
@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_query_endpoint_success(client, monkeypatch):
    # Override query_rag to return a dummy response containing the expected substring.
    def dummy_query_rag(query_text: str):
        return "Response: Dummy response containing expected text and extra details."
    
    # Patch the query_rag function used in the endpoint.
    monkeypatch.setattr("query_data.query_rag", dummy_query_rag)
    
    # Prepare a valid JSON payload with a query.
    payload = {"query_text": "dummy query"}
    response = client.post("/query", json=payload)
    assert response.status_code == 200
    json_data = response.get_json()
    assert "response" in json_data

def test_query_endpoint_missing_query(client):
    # Send a request without the required "query_text".
    response = client.post("/query", json={})
    assert response.status_code == 400
    json_data = response.get_json()
    assert "error" in json_data

def test_upload_endpoint_no_file(client):
    # Test the upload endpoint with no file in the request.
    response = client.post("/upload", data={})
    assert response.status_code == 400
    json_data = response.get_json()
    assert "error" in json_data

def test_upload_endpoint_invalid_file_extension(client):
    # Create a dummy file with an invalid extension (e.g. .txt)
    data = {
        "file": (io.BytesIO(b"dummy content"), "dummy.txt")
    }
    response = client.post("/upload", data=data, content_type="multipart/form-data")
    assert response.status_code == 400
    json_data = response.get_json()
    assert "error" in json_data

def test_upload_endpoint_success(client, monkeypatch):
    # Patch the update_database function in the app so that it doesn't execute the real code.
    monkeypatch.setattr("app.update_database", lambda: None)
    
    # Create a dummy PDF file for upload.
    data = {
        "file": (io.BytesIO(b"%PDF-1.4 dummy pdf content"), "dummy.pdf")
    }
    response = client.post("/upload", data=data, content_type="multipart/form-data")
    assert response.status_code == 200


def test_pdf_text():
    assert query_and_validate(
        question="What is the exploration acreage of OGDCL as of March 2019?",
        expected_response="75,133",
    )

def test_pdf_table():
    assert query_and_validate(
        question="How much was the 1st interim cash dividend for the year ending on 30 June 2019?",
        expected_response="Rs 2.75",
    )

def query_and_validate(question: str, expected_response: str):
    # Get the LLM response from the query function.
    response_text = query_rag(question)
    
    # Print debug information.
    print(f"Question: {question}")
    print(f"Expected substring: {expected_response}")
    print(f"LLM response: {response_text}")
    
    # Check if the expected response is a substring of the actual response (case-insensitive).
    return expected_response.lower() in response_text.lower()
