from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from fastapi.websockets import WebSocket, WebSocketDisconnect

from src.awsclient import get_public_url, upload_to_aws
from src.pdf import html_to_pdf
from src.scraper import scrapers, get_or_create_scraper
from os import path

templates = Jinja2Templates(directory="templates")


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # remove every .pdf file from /static
    folder = Path(__file__).parent.absolute() / "static"
    for file in folder.iterdir():
        if file.suffix == ".pdf":
            file.unlink()
app = FastAPI(debug=True, lifespan=lifespan)

# Allow WebSocket connections from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust to match your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    html = await scraper.scrape(list_url)
    print("Done scraping")
    dt = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"songs-{dt}.pdf"
    filepath = f"./static/{filename}"
    await html_to_pdf(html, filepath)
    # upload_to_aws(filepath, filename)
    # url = get_public_url(filename)
    url = filepath
    # await scraper.socket.close()
    return { "url": url, "html": html }


@app.websocket("/{id}")
async def websocket_endpoint(id: str, websocket: WebSocket):
    await websocket.accept()
    while True:
        try:
            scraper = get_or_create_scraper(id)
            print(f"Assigning socket to {id}")
            scraper.assign_socket(websocket)
            break
        except WebSocketDisconnect:
            print(f"Client {id} disconnected")
            scraper = scrapers.get(id)
            if scraper and scraper.socket:
                scraper.socket = None
                del scrapers[id]