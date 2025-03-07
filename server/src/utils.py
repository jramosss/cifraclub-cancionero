def create_print_url(url: str):
    final_url = "https://cifraclub.com" + url
    params = ""
    if '#' in final_url:
        splitted = final_url.split('#')
        final_url, params = splitted
    if final_url.endswith(".html"):
        final_url = final_url[:-5] + "/"
    elif final_url[-1] != "/":
        final_url += "/"
    return final_url + 'imprimir.html#footerChords=false' + ('&' + params if params else '')

def generate_html(contents: list[str]):
    return f"""
    <html>
    <head>
        <link href="https://akamai.sscdn.co/cc/css/0830d.cifra_print.css" media="all" rel="stylesheet" type="text/css"/>
        <meta charset="utf-8">
    </head>
    <body>
        {remove_tam_a4(''.join(contents))}
    </body>
    </html>
    """

# the tam_a4 class is what crops the page to A4 size
def remove_tam_a4(content: str):
    return content.replace('tam_a4', '')