from datetime import datetime
from pathlib import Path

import pdfkit
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.websockets import WebSocket, WebSocketDisconnect

from src.awsclient import get_public_url, upload_to_aws
from src.html import get_html
from src.scraper import Scraper, scrapers, get_or_create_scraper

templates = Jinja2Templates(directory="templates")


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     if not path.exists('./tmp'):
#         mkdir('./tmp')
#     try:
#         yield
#     finally:
#         shutil.rmtree('./tmp', ignore_errors=True)

# app = FastAPI(lifespan=lifespan)
app = FastAPI(debug=True)

app.mount(
    "/static",
    StaticFiles(directory=Path(__file__).parent.absolute() / "static"),
    name="static",
)

@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/generate/{id}")
async def scrape_and_download_pdf(id: str, list_url: str):
    scraper = get_or_create_scraper(id)
    print("Generating pdf with id", id)
    songs_list = await scraper.scrape_songs(list_url)
    html = get_html(songs_list)
    options = {
        'page-size': 'Letter',
        'encoding': "UTF-8",
    }
    dt = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"songs-{dt}.pdf"
    filepath = f"./tmp/{filename}"
    try:
        pdfkit.from_string(html, filepath, options=options)
    except OSError:
        # I don't really know why this exception happens, i think it's something
        # about external links, but i really don't care that much, it generates
        # the file anyway
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