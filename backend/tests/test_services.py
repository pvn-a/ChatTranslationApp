import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from services import (
    health_check_service,
    initialize_schemas_service,
    cleanup_schemas_service,
    translate_message_service,
)
from schemas import TranslationRequest


@pytest.mark.asyncio
async def test_health_check_service():
    result = health_check_service()
    assert result == {"status": "OK"}


@pytest.mark.asyncio
@patch("services.engine")
@patch("services.mongo_client.list_database_names", new_callable=AsyncMock)
async def test_initialize_schemas_service(mock_list_database_names, mock_engine):
    mock_list_database_names.return_value = ["chat_db"]

    result = await initialize_schemas_service()
    assert result["status"] == "success"


@pytest.mark.asyncio
@patch("services.engine")
@patch("services.mongo_client.drop_database", new_callable=AsyncMock)
async def test_cleanup_schemas_service(mock_drop_database, mock_engine):
    mock_drop_database.return_value = None

    result = await cleanup_schemas_service()
    assert result["status"] == "success"


@pytest.mark.asyncio
@patch("services.redis_client.get", return_value="en")
@patch("services.translator.translate")
async def test_translate_message_service(mock_translate, mock_redis_get):
    mock_translate.return_value = MagicMock(text="Hola", src="en", dest="es")

    request = TranslationRequest(
        username="test_user",
        message="Hello",
        source_language="en",
        target_language="es",
    )

    result = await translate_message_service(request)
    assert result["translated_message"] == "Hola"
    assert result["source_language"] == "en"
    assert result["target_language"] == "es"
