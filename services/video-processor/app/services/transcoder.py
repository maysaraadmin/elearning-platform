"""Video transcoding service."""
from __future__ import annotations

import asyncio
import logging
from pathlib import Path

from app.config import settings

logger = logging.getLogger(__name__)


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
        proc = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()
        if proc.returncode != 0:
            logger.error(f"FFmpeg failed: {stderr.decode()}")
            raise RuntimeError(f"Transcoding failed: {stderr.decode()}")
        logger.info(f"Transcoding completed: {output_path}")
        return output_path

    async def transcode_multi_rendition(self, input_path: str, output_dir: str) -> dict[str, str]:
        """Transcode to multiple renditions for adaptive streaming."""
        renditions = {
            "240p": {"vf": "scale=426:240", "b:v": "400k", "b:a": "64k"},
            "480p": {"vf": "scale=854:480", "b:v": "1000k", "b:a": "128k"},
            "720p": {"vf": "scale=1280:720", "b:v": "2500k", "b:a": "192k"},
            "1080p": {"vf": "scale=1920:1080", "b:v": "5000k", "b:a": "256k"},
        }
        output_paths = {}
        
        for name, params in renditions.items():
            rendition_dir = Path(output_dir) / name
            rendition_dir.mkdir(parents=True, exist_ok=True)
            output_path = str(rendition_dir / "output.m3u8")
            
            command = [
                "ffmpeg",
                "-i", input_path,
                "-c:v", "libx264",
                "-c:a", "aac",
                "-vf", params["vf"],
                "-b:v", params["b:v"],
                "-b:a", params["b:a"],
                "-f", "hls",
                "-hls_time", "10",
                "-hls_playlist_type", "vod",
                output_path,
            ]
            proc = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await proc.communicate()
            if proc.returncode != 0:
                logger.error(f"FFmpeg failed for {name}: {stderr.decode()}")
                raise RuntimeError(f"Transcoding failed for {name}: {stderr.decode()}")
            output_paths[name] = output_path
            logger.info(f"Transcoding completed for {name}: {output_path}")
        
        # Create master playlist
        master_path = str(Path(output_dir) / "master.m3u8")
        with open(master_path, "w") as f:
            f.write("#EXTM3U\n")
            for name, params in renditions.items():
                f.write(f'#EXT-X-STREAM-INF:BANDWIDTH={int(params["b:v"].rstrip("k")) * 1000},RESOLUTION={params["vf"].split("=")[1]}\n')
                f.write(f"{name}/output.m3u8\n")
        
        output_paths["master"] = master_path
        return output_paths
