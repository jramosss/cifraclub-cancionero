import asyncio
import dataclasses
import ssl
from typing import Optional

import aiohttp
from bs4 import BeautifulSoup
from starlette.websockets import WebSocket

ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

BASE_URL = "https://www.cifraclub.com"


def normalize_song_name_from_url(url: str):
    words = url.split("/")[-2].replace("-", " ").split(" ")
    return " ".join(map(lambda word: word.capitalize(), words))


async def fetch(session: aiohttp.ClientSession, url: str) -> Optional[str]:
    async with session.get(url, ssl=ssl_context) as response:
        if response.status == 200:
            html = await response.text()
            return html
        else:
            print(f"Failed to fetch {url}")
            return None


def sanitize_song_link(song_url: str) -> str:
    if song_url.endswith(".html"):
        song_url = song_url[:-5]
    if not song_url.endswith('/'):
        song_url += "/"
    song_url += "imprimir.html"

    return song_url


@dataclasses.dataclass
class Scraper:
    id: str
    socket: Optional[WebSocket] = None

    def __post_init__(self):
        scrapers[self.id] = self

    def assign_socket(self, socket: WebSocket):
        print("Assigning socket to ", self.id)
        self.socket = socket

    async def scrape_song_details(self, session: aiohttp.ClientSession, song_url: str):
        if self.socket is not None:
            print("Socket available")
            await self.socket.send_text(normalize_song_name_from_url(song_url))
        else:
            print("Socket not available")

        html = await fetch(session, song_url)
        if html:
            song_soup = BeautifulSoup(html, "html.parser")
            folhas = song_soup.find_all("div", class_=lambda x: x and x.startswith("folha"))

            return "".join(str(folha) for folha in folhas)


    async def get_songs_links_in_list(self, session: aiohttp.ClientSession, list_url: str):
        html = await fetch(session, list_url)
        if not html:
            return
        soup = BeautifulSoup(html, "html.parser")
        song_list = soup.find("ol", class_="list-links list-musics")
        song_links = song_list.find_all("li")
        songs_links_to_return: list[str] = []
        for link in song_links:
            song_url = BASE_URL + sanitize_song_link(link.find('a')['href'])
            songs_links_to_return.append(song_url)
        return songs_links_to_return

    async def scrape_songs(self, list_url: str):
        async with aiohttp.ClientSession() as session:
            songs_links = await self.get_songs_links_in_list(session, list_url)
            tasks = [self.scrape_song_details(session, song_url) for song_url in songs_links]

            song_details = await asyncio.gather(*tasks)
            return song_details


scrapers: dict[str, Scraper] = {}

def get_or_create_scraper(id: str) -> Scraper:
    if id in scrapers:
        print("Scraper already exists, returning it")
        return scrapers[id]

    print("Creating scraper", id)
    scrapers[id] = Scraper(id)
    return scrapers[id]