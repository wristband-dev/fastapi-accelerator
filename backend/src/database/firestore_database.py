import os
import logging
import tempfile
from typing import Any, Optional, List, Dict
from firebase_admin import firestore, credentials
import firebase_admin
from google.cloud.firestore_v1.client import Client
from google.cloud.firestore_v1.document import DocumentReference
from google.cloud.firestore_v1.query import Query

# =============================================================================
# CONSTANTS
# =============================================================================

# Database environment mappings
DATABASE_ENVIRONMENTS = {
    "DEV": "dev-db",
    "STAGING": "staging-db", 
    "PROD": "prod-db"
}

# File paths for credentials (in order of priority)
CREDENTIAL_PATHS = [
    "/app/firebase-service-account-key.json",       # Docker app directory
    "backend/service_accounts/firebase-service-account-key.json",  # running from root
    "service_accounts/firebase-service-account-key.json"  # running from backend
]

# Query directions
QUERY_DIRECTIONS = {
    "ASC": Query.ASCENDING,
    "DESC": Query.DESCENDING
}

# =============================================================================
# LOGGING & GLOBALS
# =============================================================================

logger = logging.getLogger(__name__)

# Global variable to store the current database ID
CURRENT_DATABASE_ID: str = "dev-db"

# =============================================================================
# FIREBASE INITIALIZATION
# =============================================================================

def get_firebase_credentials() -> credentials.Certificate:
    """
    Get Firebase credentials from environment variable or service account files.
    
    Priority order:
    1. Environment variable: FIREBASE_SERVICE_ACCOUNT_KEY
    2. Service account files in various locations
    
    Returns:
        credentials.Certificate: Firebase credentials object
        
    Raises:
        ValueError: If no valid credentials are found
    """
    # Try loading from environment variable first (for CI/CD)
    env_creds = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
    if env_creds:
        try:
            logger.debug("Using Firebase credentials from environment variable")
            with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as temp:
                temp.write(env_creds.encode())
                temp_name = temp.name
            return credentials.Certificate(temp_name)
        except Exception as e:
            logger.error(f"Error loading Firebase credentials from environment variable: {e}")
    
    # Try loading from service account files
    for file_path in CREDENTIAL_PATHS:
        try:
            logger.debug(f"Trying to load Firebase credentials from {file_path}")
            return credentials.Certificate(file_path)
        except Exception as e:
            logger.debug(f"Could not load Firebase credentials from {file_path}: {e}")
    
    raise ValueError("Could not find Firebase credentials in files or environment variable")

def get_database_id_for_environment() -> str:
    """
    Get the appropriate database ID based on the current environment.
    
    Returns:
        str: Database ID (e.g., 'dev-db', 'staging-db', 'prod-db')
    """
    environment = os.getenv("ENVIRONMENT", "DEV").upper()
    return DATABASE_ENVIRONMENTS.get(environment, "dev-db")

def initialize_firebase() -> Client:
    """
    Initialize Firebase and return the Firestore client.
    
    The environment variable ENVIRONMENT determines which Firestore database to use:
    - DEV -> connects to 'dev-db' database
    - STAGING -> connects to 'staging-db' database  
    - PROD -> connects to 'prod-db' database
    
    Each environment has its own separate database for complete isolation.
    
    Returns:
        Client: The Firestore client instance
    
    Raises:
        Exception: If Firebase initialization fails
    """
    global CURRENT_DATABASE_ID
    
    try:
        database_id = get_database_id_for_environment()
        CURRENT_DATABASE_ID = database_id
        
        # Initialize Firebase app if not already done
        if not firebase_admin._apps:
            cred = get_firebase_credentials()
            firebase_admin.initialize_app(cred)
            logger.debug("Successfully initialized Firebase")

        # Create the Firestore client with the specific database ID
        db = firestore.client(database_id=database_id)
        
        logger.debug(f"Successfully initialized Firestore client for database: {database_id}")
        return db

    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        raise

# =============================================================================
# GLOBAL DATABASE INSTANCE
# =============================================================================

# Initialize the global db instance
try:
    db: Optional[Client] = initialize_firebase()
    logger.info("✅ Firebase initialized successfully")
except Exception as e:
    logger.warning(f"⚠️  Firebase not available: {e}")
    db = None

def get_db() -> Optional[Client]:
    """Return the global Firestore client."""
    return db

def is_database_available() -> bool:
    """Check if the database is available."""
    return db is not None

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def _get_doc_ref(collection_path: str, doc_id: str) -> DocumentReference:
    """
    Get a document reference for the specified collection and document ID.
    
    Args:
        collection_path: Path to the collection
        doc_id: Document ID
        
    Returns:
        DocumentReference: Reference to the document
    """
    return db.collection(collection_path).document(doc_id)

def _document_exists(doc_ref: DocumentReference) -> bool:
    """
    Check if a document exists using its reference.
    
    Args:
        doc_ref: Document reference
        
    Returns:
        bool: True if document exists, False otherwise
    """
    return doc_ref.get().exists

def _get_document_data(doc_ref: DocumentReference) -> Optional[Dict[str, Any]]:
    """
    Get document data from a document reference.
    
    Args:
        doc_ref: Document reference
        
    Returns:
        Optional[Dict[str, Any]]: Document data if exists, None otherwise
    """
    doc = doc_ref.get()
    return doc.to_dict() if doc.exists else None

# =============================================================================
# DOCUMENT OPERATIONS
# =============================================================================

def get_new_doc_id(collection_path: str) -> DocumentReference:
    """
    Get a new document reference with auto-generated ID.
    
    Args:
        collection_path: Path to the collection
        
    Returns:
        DocumentReference: New document reference
    """
    return db.collection(collection_path).document()

def add_document(collection_path: str, data: Dict[str, Any]) -> str:
    """
    Add a document to a collection.
    
    Args:
        collection_path: Path to the collection
        data: Document data
        
    Returns:
        str: Document ID
    """
    # Generate ID if not provided
    if "id" not in data or data["id"] is None:
        doc_ref = get_new_doc_id(collection_path)
        data["id"] = doc_ref.id
    else:
        doc_ref = _get_doc_ref(collection_path, data["id"])
    
    doc_ref.set(data)
    logger.debug(f"Added document with ID: {doc_ref.id}")
    return doc_ref.id

def get_document(collection_path: str, doc_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a document by ID.
    
    Args:
        collection_path: Path to the collection
        doc_id: Document ID
        
    Returns:
        Optional[Dict[str, Any]]: Document data if exists, None otherwise
    """
    logger.debug(f"Getting document {doc_id} from {collection_path}")
    doc_ref = _get_doc_ref(collection_path, doc_id)
    doc_data = _get_document_data(doc_ref)
    
    if doc_data:
        logger.debug(f"Document data: {doc_data}")
    else:
        logger.error(f"Document {doc_id} does not exist!")
    
    return doc_data

def update_document(collection_path: str, doc_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Update a document with new data.
    
    Args:
        collection_path: Path to the collection
        doc_id: Document ID
        data: New data to update
        
    Returns:
        Optional[Dict[str, Any]]: Updated data if successful, None if document doesn't exist
    """
    doc_ref = _get_doc_ref(collection_path, doc_id)
    
    if not _document_exists(doc_ref):
        logger.error(f"Document {doc_id} does not exist!")
        return None
    
    doc_ref.update(data)
    logger.debug(f"Document {doc_id} updated with: {data}")
    return data

def update_field(collection_path: str, doc_id: str, field: str, value: Any) -> Optional[Dict[str, Any]]:
    """
    Update a specific field in a document.
    
    Args:
        collection_path: Path to the collection
        doc_id: Document ID
        field: Field name to update
        value: New value for the field
        
    Returns:
        Optional[Dict[str, Any]]: Updated document data if successful, None if document doesn't exist
    """
    doc_ref = _get_doc_ref(collection_path, doc_id)

    if not _document_exists(doc_ref):
        logger.error(f"Document {doc_id} does not exist!")
        return None
    
    doc_ref.update({field: value})
    logger.debug(f"Document {doc_id} updated with: {field} = {value}")

    return _get_document_data(doc_ref)

def set_document(collection_path: str, doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Set a document with new data. Creates the document if it doesn't exist.
    
    Args:
        collection_path: Path to the collection
        doc_id: Document ID
        data: Document data
        
    Returns:
        Dict[str, Any]: Document data that was set
    """
    doc_ref = _get_doc_ref(collection_path, doc_id)
    doc_ref.set(data, merge=True)
    logger.debug(f"Document {doc_id} set with: {data}")
    return data

def delete_document(collection_path: str, doc_id: str) -> bool:
    """
    Delete a document.
    
    Args:
        collection_path: Path to the collection
        doc_id: Document ID
        
    Returns:
        bool: True if successful
    """
    doc_ref = _get_doc_ref(collection_path, doc_id)
    doc_ref.delete()
    logger.debug(f"Document {doc_id} deleted")
    return True

def doc_exists(collection_path: str, doc_id: str) -> bool:
    """
    Check if a document exists.
    
    Args:
        collection_path: Path to the collection
        doc_id: Document ID
        
    Returns:
        bool: True if document exists, False otherwise
    """
    doc_ref = _get_doc_ref(collection_path, doc_id)
    return _document_exists(doc_ref)

# =============================================================================
# QUERY OPERATIONS
# =============================================================================

def query_documents(
    collection_path: str, 
    where_field: Optional[str] = None, 
    where_operator: Optional[str] = None, 
    where_value: Optional[Any] = None,
    order_by_field: Optional[str] = None,
    order_direction: str = "ASC",
    where_field_2: Optional[str] = None,
    where_operator_2: Optional[str] = None,
    where_value_2: Optional[Any] = None,
) -> List[Dict[str, Any]]:
    """
    Query documents in a collection with optional filtering and ordering.
    
    Args:
        collection_path: Path to the collection
        where_field: Field to filter on
        where_operator: Comparison operator (e.g., '==', '>', '<', '>=', '<=', 'in')
        where_value: Value to compare against
        order_by_field: Field to order results by
        order_direction: Direction to order results ("ASC" or "DESC")
        where_field_2: Second field to filter on (optional)
        where_operator_2: Second comparison operator (optional)
        where_value_2: Second value to compare against (optional)
    
    Returns:
        List[Dict[str, Any]]: List of document dictionaries matching the query
    """
    collection_ref = db.collection(collection_path)
    query = collection_ref

    # Apply first where clause
    if where_field and where_operator and where_value is not None:
        query = query.where(where_field, where_operator, where_value)
        
        # Apply second where clause if provided
        if where_field_2 and where_operator_2 and where_value_2 is not None:
            query = query.where(where_field_2, where_operator_2, where_value_2)

    # Apply ordering if specified
    if order_by_field:
        direction = QUERY_DIRECTIONS.get(order_direction, Query.ASCENDING)
        query = query.order_by(order_by_field, direction=direction)

    # Execute query and collect results
    results = []
    for doc in query.stream():
        doc_data = doc.to_dict()
        logger.debug(f"Document ID: {doc.id}, Data: {doc_data}")
        results.append(doc_data)
    
    return results

def query_documents_array_contains(
    collection_path: str, 
    array_field: str, 
    contains_value: Any,
    additional_where_field: Optional[str] = None,
    additional_where_operator: Optional[str] = None,
    additional_where_value: Optional[Any] = None,
    order_by_field: Optional[str] = None,
    order_direction: str = "ASC"
) -> List[Dict[str, Any]]:
    """
    Query documents in a collection where an array field contains a specific value.
    
    Args:
        collection_path: Path to the collection
        array_field: Field that contains an array to search in
        contains_value: Value that should be contained in the array
        additional_where_field: Optional additional field to filter on
        additional_where_operator: Optional additional comparison operator
        additional_where_value: Optional additional value to compare against
        order_by_field: Field to order results by
        order_direction: Direction to order results ("ASC" or "DESC")
    
    Returns:
        List[Dict[str, Any]]: List of document dictionaries matching the query
    """
    collection_ref = db.collection(collection_path)
    
    # Start with the array_contains query
    query = collection_ref.where(array_field, 'array_contains', contains_value)
    
    # Add additional where clause if provided
    if additional_where_field and additional_where_operator and additional_where_value is not None:
        query = query.where(additional_where_field, additional_where_operator, additional_where_value)
    
    # Apply ordering if specified
    if order_by_field:
        direction = QUERY_DIRECTIONS.get(order_direction, Query.ASCENDING)
        query = query.order_by(order_by_field, direction=direction)
    
    # Execute query and collect results
    results = []
    for doc in query.stream():
        doc_data = doc.to_dict()
        logger.debug(f"Document ID: {doc.id}, Data: {doc_data}")
        results.append(doc_data)
    
    return results