"""Video transcoding service."""
from __future__ import annotations

import subprocess
from pathlib import Path

from app.config import settings


class Transcoder:
    async def transcode(self, input_path: str, output_dir: str) -> str:
        output_path = str(Path(output_dir) / "output.m3u8")
        command = [
            "ffmpeg",
            "-i", input_path,
            "-c:v", "libx264",
            "-c:a", "aac",
            "-f", "hls",
            "-hls_time", "10",
            "-hls_playlist_type", "vod",
            output_path,
        ]
        subprocess.run(command, check=True, capture_output=True)
        return output_path
