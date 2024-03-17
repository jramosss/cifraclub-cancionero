from datetime import datetime
from pathlib import Path

import pdfkit
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from src.awsclient import get_public_url, upload_to_aws
from src.html import get_html
from src.scraper import scrape_songs

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
app = FastAPI()

app.mount(
    "/static",
    StaticFiles(directory=Path(__file__).parent.absolute() / "static"),
    name="static",
)

@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/generate")
async def scrape_and_download_pdf(list_url: str):
    songs_list = await scrape_songs(list_url)
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
    upload_to_aws(filepath, filename)
    url = get_public_url(filename)
    return { "url": url, "html": html }



