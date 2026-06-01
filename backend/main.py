from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .storage import NoteError, create_note, list_notes, read_note, save_note


app = FastAPI(title="KnowledgeVault API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class NoteCreate(BaseModel):
    path: str
    content: str | None = None


class NoteUpdate(BaseModel):
    content: str


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/notes")
def get_notes() -> dict[str, list[dict[str, str]]]:
    return {"files": list_notes()}


@app.get("/api/notes/{note_path:path}")
def get_note(note_path: str) -> dict[str, str]:
    try:
        return read_note(note_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Note not found")
    except NoteError as error:
        raise HTTPException(status_code=400, detail=str(error))


@app.post("/api/notes", status_code=201)
def post_note(note: NoteCreate) -> dict[str, str]:
    try:
        return create_note(note.path, note.content)
    except FileExistsError:
        raise HTTPException(status_code=409, detail="Note already exists")
    except NoteError as error:
        raise HTTPException(status_code=400, detail=str(error))


@app.put("/api/notes/{note_path:path}")
def put_note(note_path: str, note: NoteUpdate) -> dict[str, str]:
    try:
        return save_note(note_path, note.content)
    except NoteError as error:
        raise HTTPException(status_code=400, detail=str(error))
