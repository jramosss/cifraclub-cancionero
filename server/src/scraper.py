import dataclasses
import ssl
from typing import Optional
import asyncio

import aiohttp
from starlette.websockets import WebSocket

from src.utils import create_print_url, generate_html
import concurrent.futures
from bs4 import BeautifulSoup
import requests


ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

BASE_URL = "https://www.cifraclub.com"
MAX_WORKERS = 10


class Scraper:
    def __init__(self, id: str, socket: Optional[WebSocket] = None):
        self.id = id
        self.socket = socket
        self.amount_of_songs = 0
        self.progress = 0

    def __post_init__(self):
        scrapers[self.id] = self

    def assign_socket(self, socket: WebSocket):
        self.socket = socket

    @staticmethod
    def get_urls_from_list(list_url: str):
        raw_html = requests.get(list_url).text
        soup = BeautifulSoup(raw_html, "html.parser")
        list_element = soup.find(class_="list-links list-musics")
        return [create_print_url(el["href"]) for el in list_element.find_all("a")]

    async def scrape_page(self, url: str):
        async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=False)) as session:
            async with session.get(url) as response:
                raw_html = await response.text()

        soup = BeautifulSoup(raw_html, "html.parser")
        content = soup.find(class_="pages")
        result = str(content.decode(4, "utf-8"))

        self.progress += 1
        if self.socket:
            print(f"Sending to socket {self.progress}/{self.amount_of_songs}")
            await self.socket.send_json({
                "progress": self.progress,
                "total": self.amount_of_songs
            })

        return result

    async def scrape_pages(self, urls: list[str]):
        tasks = [self.scrape_page(url) for url in urls]
        results = await asyncio.gather(*tasks)
        return results

    async def scrape(self, url: str):
        urls = self.get_urls_from_list(url)
        self.amount_of_songs = len(urls)
        contents = await self.scrape_pages(urls)
        return generate_html(contents)


scrapers: dict[str, Scraper] = {}

def get_or_create_scraper(id: str) -> Scraper:
    if id in scrapers:
        print(f"Scraper {id} already exists, returning it")
        return scrapers[id]

    print("Creating scraper", id)
    scrapers[id] = Scraper(id)
    return scrapers[id]