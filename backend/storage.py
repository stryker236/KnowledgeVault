from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = Path(ROOT_DIR, "storage")


class NoteError(ValueError):
    pass


def ensure_storage() -> None:
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)


def normalize_note_path(raw_path: str) -> str:
    path = raw_path.strip().replace("\\", "/").lstrip("/")
    parts = Path(path).parts

    if not path or path.endswith("/") or any(part in {"", ".", ".."} for part in parts):
        raise NoteError("Invalid note path")

    if not path.lower().endswith(".md"):
        path = f"{path}.md"

    return path


def resolve_note_path(raw_path: str) -> Path:
    ensure_storage()
    note_path = normalize_note_path(raw_path)
    resolved = Path(STORAGE_DIR, note_path).resolve()

    if STORAGE_DIR.resolve() not in resolved.parents:
        raise NoteError("Note path must stay inside storage")

    return resolved


def title_from_path(path: str) -> str:
    stem = Path(path).stem
    return " ".join(word.capitalize() for word in stem.replace("_", "-").split("-") if word)


def list_notes() -> list[dict[str, str]]:
    ensure_storage()
    files = [
        {"path": file.relative_to(STORAGE_DIR).as_posix()}
        for file in STORAGE_DIR.rglob("*.md")
        if file.is_file()
    ]
    return sorted(files, key=lambda item: item["path"].lower())


def read_note(raw_path: str) -> dict[str, str]:
    note_path = normalize_note_path(raw_path)
    file_path = resolve_note_path(note_path)

    if not file_path.exists() or not file_path.is_file():
        raise FileNotFoundError(note_path)

    return {"path": note_path, "content": file_path.read_text(encoding="utf-8")}


def create_note(raw_path: str, content: str | None = None) -> dict[str, str]:
    note_path = normalize_note_path(raw_path)
    file_path = resolve_note_path(note_path)

    if file_path.exists():
        raise FileExistsError(note_path)

    file_path.parent.mkdir(parents=True, exist_ok=True)
    note_content = content if content is not None else f"# {title_from_path(note_path)}\n\n"
    file_path.write_text(note_content, encoding="utf-8")
    return {"path": note_path, "content": note_content}


def save_note(raw_path: str, content: str) -> dict[str, str]:
    note_path = normalize_note_path(raw_path)
    file_path = resolve_note_path(note_path)
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_text(content, encoding="utf-8")
    return {"path": note_path, "content": content}
