
from bs4 import BeautifulSoup


def get_as_html(song_details: list[str]) -> str:
    return f'<div>{"".join(song_details)}</div>'

def add_css_styles(html_string: str, css_file_path: str) -> str:
    with open(css_file_path, 'r') as f:
        css_content = f.read()

    soup = BeautifulSoup(html_string, "html.parser")

    style_tag = soup.new_tag("style")
    style_tag.string = css_content

    head_tag = soup.find("head")
    if head_tag is None:
        head_tag = soup.new_tag("head")
        if soup.find("html") is None:
            html_tag = soup.new_tag("html")
            soup.append(html_tag)
        soup.html.insert(0, head_tag)

    head_tag.append(style_tag)

    return str(soup)


def get_html(song_details: list[str]):
    html = get_as_html(list(map(str, song_details)))
    html = add_css_styles(html, "./public/cifraclub_style.css")
    return html
