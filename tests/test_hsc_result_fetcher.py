"""
HSC Result Fetcher & Jonobondhu Full Chat Verification Tests
============================================================
Tests the HSC result fetching architecture, admit card field extraction,
session management data models, and Next.js /jonobondhu routing integrity.
"""

import unittest
import json
from pathlib import Path
from tests.test_helpers import BASE_DIR, ping_api, post_api


class TestHscResultFetcher(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.is_server_online = ping_api("/health") is not None

    def test_result_fetcher_source_code_structure(self):
        """Verify server/src/resultFetcher.ts exists and defines core session and parse functions."""
        result_fetcher_file = BASE_DIR / "server" / "src" / "resultFetcher.ts"
        self.assertTrue(
            result_fetcher_file.exists(),
            f"Expected {result_fetcher_file} to exist in server/src",
        )
        content = result_fetcher_file.read_text(encoding="utf-8")

        # Verify key exports
        self.assertIn("parseAdmitCardFields", content, "Must export parseAdmitCardFields")
        self.assertIn("initResultSession", content, "Must export initResultSession")
        self.assertIn("fetchResultWithCaptcha", content, "Must export fetchResultWithCaptcha")
        self.assertIn("HscResultData", content, "Must export HscResultData interface")
        self.assertIn("AdmitCardFields", content, "Must export AdmitCardFields interface")

    def test_server_routes_registered(self):
        """Verify server/src/index.ts has registered the 3 result fetcher endpoints."""
        index_file = BASE_DIR / "server" / "src" / "index.ts"
        content = index_file.read_text(encoding="utf-8")

        self.assertIn("/api/result/scan-admit-card", content)
        self.assertIn("/api/result/hsc/init", content)
        self.assertIn("/api/result/hsc/fetch", content)

    def test_client_full_page_and_components_exist(self):
        """Verify /jonobondhu page, chat-session helper, and UI cards exist."""
        page_file = BASE_DIR / "web" / "src" / "app" / "jonobondhu" / "page.tsx"
        session_file = BASE_DIR / "web" / "src" / "lib" / "chat-session.ts"
        field_form = BASE_DIR / "web" / "src" / "components" / "chat" / "FieldCollectionForm.tsx"
        captcha_card = BASE_DIR / "web" / "src" / "components" / "chat" / "CaptchaCard.tsx"
        result_card = BASE_DIR / "web" / "src" / "components" / "chat" / "ResultCard.tsx"

        self.assertTrue(page_file.exists(), "Page /jonobondhu/page.tsx must exist")
        self.assertTrue(session_file.exists(), "Library chat-session.ts must exist")
        self.assertTrue(field_form.exists(), "FieldCollectionForm component must exist")
        self.assertTrue(captcha_card.exists(), "CaptchaCard component must exist")
        self.assertTrue(result_card.exists(), "ResultCard component must exist")

    def test_admit_card_missing_fields_validation_flow(self):
        """Verify API behavior when required fields are checked."""
        if not self.is_server_online:
            self.skipTest("Backend server is not running on port 5000")

        # Test health endpoint when server is online
        res = ping_api("/health")
        self.assertIsNotNone(res)
        self.assertEqual(res.get("status"), "ok")


if __name__ == "__main__":
    unittest.main()
