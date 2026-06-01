import unittest
from tempfile import TemporaryDirectory
from pathlib import Path
from unittest.mock import patch

from backend import storage


class StorageTests(unittest.TestCase):
    def test_create_note_adds_markdown_extension_and_parent_dirs(self):
        with TemporaryDirectory() as directory:
            with patch.object(storage, "STORAGE_DIR", Path(directory)):
                note = storage.create_note("concepts/test-note")

                self.assertEqual(note["path"], "concepts/test-note.md")
                self.assertTrue((Path(directory) / "concepts" / "test-note.md").exists())
                self.assertEqual(note["content"], "# Test Note\n\n")

    def test_rejects_parent_directory_paths(self):
        with self.assertRaises(storage.NoteError):
            storage.resolve_note_path("../outside.md")


if __name__ == "__main__":
    unittest.main()
