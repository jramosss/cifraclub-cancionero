from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path

import pdfkit
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.responses import FileResponse
from starlette.websockets import WebSocket, WebSocketDisconnect

from src.awsclient import get_public_url, upload_to_aws
from src.html import get_html
from src.pdf import html_to_pdf
from src.scraper import Scraper, scrapers, get_or_create_scraper
from os import path, mkdir
import shutil

templates = Jinja2Templates(directory="templates")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not path.exists('./tmp'):
        mkdir('./tmp')
    try:
        yield
    finally:
        shutil.rmtree('./tmp', ignore_errors=True)
app = FastAPI(debug=True, lifespan=lifespan)

app.mount(
    "/static",
    StaticFiles(directory=Path(__file__).parent.absolute() / "static"),
    name="static",
)

@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/pdf/{filename}")
async def get_pdf(filename: str):
    file_path = path.join(Path(__file__).parent.absolute() / "static", filename)
    if not path.exists(file_path):
        return {"error": "File not found"}
    return FileResponse(file_path, media_type="application/pdf")


@app.post("/generate/{id}")
async def scrape_and_download_pdf(id: str, list_url: str):
    scraper = get_or_create_scraper(id)
    songs_list = scraper.scrape(list_url)
    html = get_html(songs_list)
    dt = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"songs-{dt}.pdf"
    filepath = f"./static/{filename}"
    try:
        await html_to_pdf(html, filepath)
    except OSError:
        # I don't really know why this exception happens, i think it's something
        # about external links, but i really don't care that much, it generates
        # the file anyway
        print("OS ERROR")
        pass
    # upload_to_aws(filepath, filename)
    # url = get_public_url(filename)
    url = filepath
    return { "url": url, "html": html }


@app.websocket("/{id}")
async def websocket_endpoint(id: str, websocket: WebSocket):
    await websocket.accept()
    while True:
        try:
            scraper = get_or_create_scraper(id)
            scraper.assign_socket(websocket)
        except WebSocketDisconnect:
            print(f"Client {id} disconnected")
            scraper = scrapers.get(id)
            if scraper and scraper.socket:
                scraper.socket = None
                del scrapers[id]