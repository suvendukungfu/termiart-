"""Unit tests for TermiArt Web Studio endpoints and ANSI HTML conversion."""

import unittest
from fastapi.testclient import TestClient
from web.server import app, ansi_to_html


class TestWebStudio(unittest.TestCase):
    """Test cases for Web Studio API and rendering utilities."""

    def setUp(self):
        self.client = TestClient(app)

    def test_health_endpoint(self):
        """Verify API health status returns ok and includes styles."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "online")
        self.assertIn("halfblock", data["styles"])
        self.assertIn("cyberpunk", data["styles"])

    def test_presets_endpoint(self):
        """Verify presets and themes catalog."""
        response = self.client.get("/api/presets")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(len(data["presets"]) > 0)
        self.assertTrue(len(data["styles"]) > 0)
        self.assertTrue(len(data["themes"]) > 0)

    def test_index_html_served(self):
        """Verify main web studio page is served with correct title."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("TERMIART", response.text)
        self.assertIn("text/html", response.headers["content-type"])

    def test_ansi_to_html_converter(self):
        """Verify 24-bit TrueColor ANSI conversion to HTML spans."""
        ansi_sample = "\x1b[38;2;255;0;128m\x1b[48;2;10;20;30m▀\x1b[0m"
        html_out = ansi_to_html(ansi_sample)
        self.assertIn("color:rgb(255,0,128)", html_out)
        self.assertIn("background-color:rgb(10,20,30)", html_out)
        self.assertIn("▀", html_out)

    def test_render_sample_image(self):
        """Verify image rendering endpoint outputs valid HTML and metadata."""
        response = self.client.post(
            "/api/render",
            data={
                "sample_name": "sample_test.png",
                "style": "halfblock",
                "theme": "cyberpunk",
                "width": 50,
            },
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertTrue(len(data["html"]) > 0)
        self.assertTrue(len(data["plain"]) > 0)
        self.assertIn("cols", data["stats"])
    def test_samples_catalog(self):
        """Verify the curated specimen samples catalog endpoint."""
        response = self.client.get("/api/samples")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("samples", data)
        sample_ids = [s["id"] for s in data["samples"]]
        self.assertIn("portrait", sample_ids)
        self.assertIn("anime", sample_ids)
        self.assertIn("landscape", sample_ids)
        self.assertIn("logo", sample_ids)

    def test_render_curated_specimen_portrait(self):
        """Verify rendering a curated specimen by ID."""
        response = self.client.post(
            "/api/render",
            data={
                "sample_name": "portrait",
                "style": "halfblock",
                "theme": "cyberpunk",
                "width": 60,
            },
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertTrue(len(data["html"]) > 0)


if __name__ == "__main__":
    unittest.main()
