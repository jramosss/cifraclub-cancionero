import dataclasses
import ssl
from typing import Optional

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


@dataclasses.dataclass
class Scraper:
    id: str
    socket: Optional[WebSocket] = None

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

    @staticmethod
    def scrape_page(url: str):
        raw_html = requests.get(url).text
        soup = BeautifulSoup(raw_html, "html.parser")
        content = soup.find(class_="pages")
        return str(content.decode(4, "utf-8"))

    def scrape_pages(self, urls: list[str]):
        with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = [executor.submit(self.scrape_page, url) for url in urls]
            return [future.result() for future in concurrent.futures.as_completed(futures)]

    def scrape(self, url: str):
        urls = self.get_urls_from_list(url)
        contents = self.scrape_pages(urls)
        return generate_html(contents)


scrapers: dict[str, Scraper] = {}

def get_or_create_scraper(id: str) -> Scraper:
    if id in scrapers:
        print("Scraper already exists, returning it")
        return scrapers[id]

    print("Creating scraper", id)
    scrapers[id] = Scraper(id)
    return scrapers[id]