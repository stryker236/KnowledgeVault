# KnowledgeVault

KnowledgeVault is a personal knowledge management system for capturing, organizing, connecting, and revisiting information over time. It is designed as a user-curated vault where knowledge lives in editable Markdown files and is connected through links, tags, metadata, and relationships.

KnowledgeVault is not an AI-generated encyclopedia or a Wikipedia clone. AI features, when introduced, should support the user by helping organize and understand existing notes, not replace user authorship or curation.

## Vision

KnowledgeVault aims to make personal knowledge durable, searchable, portable, and meaningful. The project focuses on giving users a clear structure for storing what they learn, while keeping ownership and control of the content in their hands.

## Project Philosophy

- User-owned knowledge should remain accessible, editable, and portable.
- Markdown is the source format and the primary source of truth.
- Local-first storage should be prioritized before external services or cloud dependencies.
- AI should act as an assistant, not the author.
- Knowledge should be curated intentionally, not automatically generated at scale.

## Goals

- Create, edit, organize, search, and link personal notes.
- Store notes as plain Markdown files.
- Support type-based organization such as concepts, people, movies, books, and projects.
- Add metadata for tags, status, and filtering.
- Build relationship tracking and graph-based navigation over time.
- Keep the system understandable, extensible, and easy to run locally.

## Non-Goals

- Building a Wikipedia clone or public encyclopedia.
- Generating large amounts of AI-written content automatically.
- Making AI a required dependency for core functionality.
- Replacing the user's judgment, editing, or curation process.
- Locking knowledge into a proprietary database or format.

## Planned Architecture

The initial architecture is intentionally simple:

```text
User
-> Frontend
-> Backend (FastAPI)
-> Markdown Files
```

The backend will expose APIs for working with notes, while Markdown files remain the source of truth. The frontend will provide an interface for browsing, editing, searching, and connecting notes.

SQLite may be introduced later as an indexing layer for fast search, filtering, tags, and relationship queries. It should not replace Markdown files as the canonical storage format.

## Storage Strategy

KnowledgeVault starts with a Markdown-first storage model:

- Each note is stored as an editable Markdown file.
- Notes can be grouped into type-based folders such as `concepts`, `people`, `movies`, and other user-defined categories.
- Metadata can be stored in frontmatter when needed.
- Internal links can connect notes directly.
- Future indexes should be rebuildable from the Markdown vault.

## Roadmap

### Milestone 1 - Core Vault

- Create note
- Read note
- Update note
- Delete note
- Markdown storage
- Type-based folders such as concepts, people, movies, and others

### Milestone 2 - Metadata

- Tags
- Status
- Frontmatter
- Filtering

### Milestone 3 - Search & Indexing

- SQLite index
- Fast search
- Tag search

### Milestone 4 - Knowledge Graph

- Internal links
- Relationship tracking
- Graph visualization

### Milestone 5 - Web Interface

- React frontend
- Search page
- Note page
- Graph page

### Milestone 6 - AI Assistance

- Extract concepts from text
- Suggest related notes
- Summarize existing notes
- Detect duplicates

## Future AI Features

KnowledgeVault will start without AI dependencies. Early versions should focus on reliable note creation, editing, organization, search, and linking.

Future AI features may include concept extraction, related-note suggestions, summaries of existing notes, and duplicate detection. These features should be optional, transparent, and based on content already present in the user's vault.

## Development Principles

- Keep Markdown files as the source of truth.
- Prefer simple, inspectable systems before adding complexity.
- Make AI optional and replaceable.
- Design features around user curation and control.
- Keep data portable and easy to back up.
- Build incrementally with clear milestones.
