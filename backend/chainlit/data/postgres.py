import uuid
from datetime import datetime, timezone
from dataclasses import asdict
import json
from typing import Any, Dict, List, Optional, Union, cast
from typing import TYPE_CHECKING
import psycopg
from psycopg import conninfo
from psycopg import sql
import aiofiles
from chainlit.context import context
from chainlit.logger import logger
from chainlit.data import BaseDataLayer, queue_until_user_message
from chainlit.user import PersistedUser
from chainlit.types import Feedback, FeedbackDict, Pagination, ThreadDict, ThreadFilter
from chainlit.user import UserDict
from chainlit.element import ElementDict
from literalai import PageInfo, PaginatedResponse
from azure.storage.filedatalake import FileSystemClient  # type: ignore
from azure.storage.filedatalake import ContentSettings  # type: ignore

if TYPE_CHECKING:
    from chainlit.element import Element, ElementDict
    from chainlit.step import FeedbackDict, StepDict
    from chainlit.user import User

class PostgresDataLayer(BaseDataLayer):
    def __init__(self, uri: str):
        self.connection = psycopg.connect(uri,autocommit=True)        
        if self.connection:
            logger.info("Postgres data layer connected")

    def add_blob_storage_client(self, blob_storage_client, access_token: Optional[str]):
        if isinstance(blob_storage_client, FileSystemClient):
            self.blob_storage_client = blob_storage_client
            self.blob_access_token = access_token
            self.blob_storage_provider = 'Azure'
            logger.info("Azure Data Lake Storage client initialized")
        # Add other checks here for AWS/Google/etc.
        else:
            raise ValueError("The provided blob_storage is not recognized")
                
    ###### User ######
    async def create_user(self, user: 'User') -> Optional['PersistedUser']:
        logger.info(f"Postgres: create_user, user_identifier={user.identifier}")
        existing_user: Optional['PersistedUser'] = await self.get_user(user.identifier)
        user_dict = user.to_dict()
        if not existing_user: # create the user
            logger.info("Postgres: create_user, creating the user")
            user_dict['id'] = str(uuid.uuid4())
            user_dict['createdAt'] = await self.get_current_timestamp()
            await self.sql_upsert(table='users', primary_key='id', data=user_dict)
        else: # update the user
            user_dict['id'] = existing_user.id
            await self.sql_upsert(table='users', primary_key='id', data=user_dict)
        _user = await self.get_user(user.identifier)
        return _user
    
    async def get_user(self, identifier: str) -> Optional['PersistedUser']:
        logger.info(f"Postgres: get_user, identifier={identifier}")
        user_dict: Optional['UserDict'] = await self.sql_select(table='users', data={'identifier': identifier}, one_row=True)
        if not user_dict:
            logger.warning(f"FAILED: Postgres: get_user, identifier={identifier}")
            return None
        else:
            return PersistedUser(
                id=str(user_dict.get('id')),
                identifier=str(user_dict.get('identifier')),
                createdAt=str(user_dict.get('createdAt')),
                metadata=user_dict.get('metadata') or {} 
                )
        
    ###### Threads ######
    async def update_thread(self, thread_id: str, name: Optional[str] = None, user_id: Optional[str] = None, metadata: Optional[Dict] = None, tags: Optional[List[str]] = None):
        logger.info(f"Postgres: update_thread, thread_id={thread_id}")
        data = {
            "id": thread_id,
            "createdAt": await self.get_current_timestamp(),
            "name": name if name is not None else (metadata.get('name') if metadata and 'name' in metadata else None),
            "user_id": user_id,
            "tags": tags,
            "metadata": json.dumps(metadata) if metadata else None,
        }
        data = {key: value for key, value in data.items() if value is not None} # Remove keys with None values
        await self.sql_upsert(table='threads', primary_key='id', data=data)

    # TODO Future OAI_Assistant_Thread for syning...

    async def delete_thread(self, thread_id: str):
        logger.info(f"Postgres: delete_thread, thread_id={thread_id}")
        await self.sql_delete(table='threads', conditions={'id': thread_id})

    async def get_thread_author(self, thread_id: str) -> str:
        logger.info(f"Postgres: get_thread_author, thread_id={thread_id}")
        with self.connection.cursor(row_factory=psycopg.rows.dict_row) as cursor:
            logger.info("Postgres: get_thread_author STARTING")
            cursor.execute(
                "SELECT u.* "
                "FROM threads t "
                "JOIN users u ON t.user_id = u.id "
                "WHERE t.id = %s",
                (thread_id,)
            )
            user = cursor.fetchone()
            return user.get('identifier') if user else ""

    async def get_thread(self, thread_id: str) -> Optional[ThreadDict]:
        logger.info(f"Postgres: get_thread, thread_id={thread_id}")
        thread_result: Optional['ThreadDict'] = await self.sql_select(table='threads', data={'id': thread_id}, one_row=True)
        if not thread_result:
            return None
        user_identifier = await self.get_thread_author(thread_id)
        user: Optional['PersistedUser'] = await self.get_user(user_identifier)
        user_dict: Optional[UserDict]= UserDict(id=user.id, identifier=user.identifier, metadata=user.metadata) if user else None
        steps: List['StepDict'] = await self.get_steps(thread_id) or []
        elements: List['ElementDict'] = await self.get_elements_in_thread(thread_id) or []
        metadata: Optional[Dict] = thread_result.get('metadata') or {}
        return ThreadDict(
            id=thread_id,
            createdAt=str(thread_result.get('createdAt')),
            name=thread_result.get('name'),
            user=user_dict,
            tags=thread_result.get('tags'),
            metadata=metadata,
            steps=steps,
            elements=elements,
        )
    
    # TODO list_all_threads for faster retrieval. will need to add new threads to this though.
    
    async def list_threads(self, pagination: Pagination, filters: ThreadFilter) -> PaginatedResponse[ThreadDict]:
        logger.info(f"Postgres: list_threads, pagination={pagination}, filters={filters}")
        if not filters.userIdentifier:
            raise ValueError("userIdentifier is required")
        # Construct the base query
        query_params = [filters.userIdentifier]
        query = """
        SELECT DISTINCT t.id, t."createdAt"
        FROM
            threads t
            JOIN
            users u on t.user_id=u.id
            JOIN
            steps s on t.id=s."threadId"
            LEFT JOIN
            feedbacks f on s.id=f."forId"
        WHERE
            u."identifier" = %s
        """
        if filters.search is not None:
            query += "AND s.\"output\" ILIKE %s\n"
            query_params.append(f"%{str(filters.search)}%")
        if filters.feedback is not None and filters.feedback != 0:
            query += "AND f.\"value\" IN (%s)\n"
            query_params.append(str(filters.feedback))
        query += "ORDER BY t.\"createdAt\" DESC\n"
        query += "LIMIT %s"
        query_params.append(str(pagination.first))

        with self.connection.cursor(row_factory=psycopg.rows.dict_row) as cursor:
            cursor.execute(query, query_params)
            results = cursor.fetchall()
            unique_thread_ids = [str(item['id']) for item in results]
            threads: List[ThreadDict] = []
            for thread_id in unique_thread_ids:
                thread_dict = await self.get_thread(thread_id)
                if thread_dict is not None:
                    threads.append(thread_dict)

            has_next_page = len(threads) > 0 and len(threads) == pagination.first
            end_cursor = threads[-1]["id"] if has_next_page and threads else None

            return PaginatedResponse(
                pageInfo=PageInfo(hasNextPage=has_next_page, endCursor=end_cursor),
                data=threads
            )
    
    ###### Steps ######
    @queue_until_user_message()
    async def create_step(self, step_dict: 'StepDict'):
        logger.info(f"Postgres: create_step, step_id={step_dict.get('id')}")
        await self.sql_upsert(table='steps',primary_key='id', data=cast(Dict[Any, Any], step_dict))

    @queue_until_user_message()
    async def delete_step(self, step_id: str):
        logger.info(f"Postgres: delete_step, step_id={step_id}")
        await self.sql_delete(table='steps', conditions={'id': step_id})

    @queue_until_user_message()
    async def update_step(self, step_dict: 'StepDict'):
        logger.info(f"Postgres: update_step, step_id={step_dict.get('id')}")
        await self.sql_upsert(table='steps',primary_key='id', data=cast(Dict[Any, Any], step_dict))
        
    async def get_steps(self, thread_id: str) -> Optional[List['StepDict']]:
        steps_result = await self.sql_select(table='steps', data={'threadId': thread_id}, one_row=False)
        steps = []
        if steps_result is not None:
            for step in steps_result:
                step_id = step.get('id')
                step_feedback = await self.get_feedback(step_id)
                step['feedback'] = step_feedback
                if step.get('showInput') == 'false':
                    step['input'] = None
                steps.append(step)
        return steps
    
    ###### Feedback ######
    async def upsert_feedback(self, feedback: Feedback) -> str:
        logger.info(f"Postgres: upsert_feedback, feedback_id={feedback.id}")
        if not feedback.id:
            feedback.id = str(uuid.uuid4())
        await self.sql_upsert(table='feedbacks',primary_key='id', data=asdict(feedback))
        return feedback.id
    
    async def get_feedback(self, step_id: str) -> Optional['FeedbackDict']:
        logger.info(f"Postgres: get_feedback, step_id={step_id}")
        result: Optional['FeedbackDict'] = await self.sql_select(table='feedbacks', data={'forId': step_id})
        if not result:
            return None
        else:
            return FeedbackDict(
                value=result.get('value', 0),
                strategy=result.get('strategy', 'BINARY'),
                comment=result.get('comment', None)
            )

    ###### Elements ######
    @queue_until_user_message()
    async def create_element(self, element: 'Element'):
        logger.info(f"Postgres: create_element, element_id = {element.id}")
        if not self.blob_storage_client:
            raise ValueError("No blob_storage_client is configured")
        if not element.for_id:
            return
        element_dict: 'ElementDict' = element.to_dict()
        object_key: Optional[str] = None

        if not element.url:
            if element.path:
                async with aiofiles.open(element.path, "rb") as f:
                    content: Union[bytes, str] = await f.read()
            elif element.content:
                content = element.content
            else:
                raise ValueError("Either path or content must be provided")
            
            context_user: Optional[Union[User, PersistedUser]] = context.session.user 
            if context_user is None:
                raise ValueError("No valid user in context")
            user_folder = 'unknown'
            if isinstance(context_user, PersistedUser):
                if context_user.id is None:
                    raise ValueError("PersistedUser does not have a valid id")
                user_folder = context_user.id

            object_key = f"{user_folder}/{element.id}" + f"/{element.name}" if element.name else ""

            if self.blob_storage_provider == 'Azure':
                file_client = self.blob_storage_client.get_file_client(object_key)
                content_type = ContentSettings(content_type=element.mime)
                file_client.upload_data(content, overwrite=True, content_settings=content_type)

                element_dict['url'] = file_client.url + self.blob_access_token
                element_dict['page'] = getattr(element, "page", None)
                element_dict['objectKey'] = object_key

        element_dict_casted = cast(Dict[Any, Any], element_dict)
        await self.sql_upsert(table='elements', primary_key='id', data=element_dict_casted)

    async def get_element(self, thread_id: str, element_id: str) -> Optional['ElementDict']:
        logger.info(f"Postgres: get_element, element_id = {element_id}, thread_id = {thread_id}")
        result: Optional['ElementDict'] = await self.sql_select(table='elements', data={'threadId': thread_id,"id": element_id}, one_row=True)
        if not result:
            return None
        return ElementDict(**result)
    
    async def get_elements_in_thread(self, thread_id: str) -> Optional[List['ElementDict']]:
        logger.info(f"Postgres: get_elements_in_thread, thread_id = {thread_id}")
        results = await self.sql_select(table='elements', data={'threadId': thread_id}, one_row=False)
        if not results:
            return None
        elements: List['ElementDict'] = []
        for result in results:
            assert result.get("id") is not None, "Missing required field: id"
            assert result.get("type") is not None, "Missing required field: type"
            assert result.get("name") is not None, "Missing required field: name"
            assert result.get("display") is not None, "Missing required field: display"
            element = ElementDict(
                id=result.get("id"),
                threadId=result.get("threadId", None),
                type=result.get("type"),
                chainlitKey=result.get("chainlitKey", None),
                url=result.get("url", None),
                objectKey=result.get("objectKey", None),
                name=result.get("name"),
                display=result.get("display"),
                size=result.get("size", None),
                language=result.get("language", None),
                page=result.get("page", None),
                forId=result.get("forId", None),
                mime=result.get("mime", None)
            )            
            elements.append(element)
        return elements
    
    @queue_until_user_message()
    async def delete_element(self, element_id: str):
        logger.info(f"Postgres: delete_element, element_id={element_id}")
        await self.sql_delete(table='elements', conditions={'id': element_id})

    async def delete_user_session(self, id: str) -> bool:
        return False # Not sure why documentation wants this

    ###### SQL Database Helpers ######
    async def sql_upsert(self, table: str, primary_key: str, data: dict) -> bool:
        """Perform an upsert operation (insert or update) on the given table with the provided primary key and data."""
        for key, value in data.items():
            if isinstance(value, dict):
                data[key] = json.dumps(value)
        with self.connection.cursor(row_factory=psycopg.rows.dict_row) as cursor:
            columns = data.keys()
            values = tuple(data.values())
            placeholders = sql.SQL(', ').join(sql.Placeholder() * len(values))
        
            updates = sql.SQL(', ').join([
                sql.SQL("{} = EXCLUDED.{}").format(sql.Identifier(k), sql.Identifier(k))
                for k in columns
            ])
        
            query = sql.SQL("""
            INSERT INTO {table} ({fields})
            VALUES ({values})
            ON CONFLICT ({primary_key}) DO UPDATE SET
            {updates}
            RETURNING (xmax = 0) AS inserted
            """).format(
                table=sql.Identifier(table),
                fields=sql.SQL(', ').join(map(sql.Identifier, columns)),
                values=placeholders,
                primary_key=sql.Identifier(primary_key),
                updates=updates
            )
            try:
                cursor.execute(query, values)
                result = cursor.fetchone()
                rows = cursor.rowcount
                upsert_type = 'INSERT' if {result['inserted']} else 'UPDATE'
                logger.info(f"{upsert_type} {rows} row on table {table}")
                return True
            except psycopg.Error as e:
                logger.warning(f"An SQL error occurred on the '{table}' table: {e}")
                return False
            
    async def sql_select(self, table: str, data: dict, one_row: bool = True) -> Optional[Any]:
        """Execute a SELECT SQL query with the provided values and return the fetched results."""
        where_clauses = sql.SQL(' AND ').join(
            sql.SQL("{} = {}").format(sql.Identifier(key), sql.Placeholder(key))
            for key in data
        )
        sql_query = sql.SQL("SELECT * FROM {}").format(sql.Identifier(table))
        if data:
            sql_query = sql_query + sql.SQL(" WHERE ") + where_clauses

        with self.connection.cursor(row_factory=psycopg.rows.dict_row) as cursor:
            try:
                cursor.execute(sql_query, data)
                if cursor.rowcount == 0:
                    return None if one_row else [] # No results
                if one_row:
                    result = cursor.fetchone()
                    return {k: str(v) if isinstance(v, uuid.UUID) else v for k, v in result.items()} # convert UUIDs to strings
                else:
                    result = cursor.fetchall()
                    return [{k: str(v) if isinstance(v, uuid.UUID) else v for k, v in row.items()} for row in result] # convert UUIDs to strings
            except psycopg.Error as e:
                logger.warning(f"An SQL error occurred: {e}")
                return None if one_row else []   # Return an empty list or raise an exception

    async def sql_delete(self, table: str, conditions: dict) -> None:
        """Execute a DELETE SQL query with the provided conditions and return the number of rows deleted."""
        where_clauses = sql.SQL(' AND ').join(
            sql.SQL("{} = {}").format(sql.Identifier(key), sql.Placeholder(key))
            for key in conditions
        )
        sql_query = sql.SQL("DELETE FROM {} WHERE ").format(sql.Identifier(table)) + where_clauses

        with self.connection.cursor() as cursor:
            try:
                cursor.execute(sql_query, conditions)
            except psycopg.Error as e:
                logger.warning(f"An SQL error occurred: {e}")

    async def get_current_timestamp(self) -> str:
        return datetime.now(timezone.utc).astimezone().isoformat()