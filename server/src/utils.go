package src

import (
	"fmt"
	"strings"
)

func createPrintUrl(url string) string {
	finalUrl := fmt.Sprintf("https://cifraclub.com%s", url)
	params := ""

	if strings.Contains(finalUrl, "#") {
		splitted := strings.Split(finalUrl, "#")
		finalUrl = splitted[0]
		params = splitted[1]
	}

	if strings.HasSuffix(finalUrl, ".html") {
		finalUrl = fmt.Sprintf("%s/", finalUrl[:len(finalUrl)-5])
	} else if finalUrl[len(finalUrl)-1] != '/' {
		finalUrl += "/"
	}

	if params != "" {
		return fmt.Sprintf("%simprimir.html#footerChords=false&%s", finalUrl, params)
	}
	return fmt.Sprintf("%simprimir.html#footerChords=false", finalUrl)
}

type StyleOptions struct {
	PrimaryColor string
	FontSize     string
}

func generateHtml(songs []Song, options StyleOptions) string {
	var toc strings.Builder
	var content strings.Builder

	// Use default color if not provided
	color := options.PrimaryColor
	if color == "" {
		color = "#f88c00"
	}

	// Use default font size if not provided
	fontSize := options.FontSize
	if fontSize == "" {
		fontSize = "14px"
	}

	toc.WriteString("<div class='toc'><h1>Índice</h1><ul>")
	for i, song := range songs {
		id := fmt.Sprintf("song-%d", i)
		toc.WriteString(fmt.Sprintf("<li><a href='#%s'>%s - %s</a></li>", id, song.Title, song.Artist))

		content.WriteString(fmt.Sprintf("<div id='%s' class='song-page'>", id))
		content.WriteString(fmt.Sprintf("<h1 style='color: %s'>%s</h1>", color, song.Title))
		content.WriteString(fmt.Sprintf("<h2>%s</h2>", song.Artist))
		content.WriteString(fmt.Sprintf("<pre style='font-size: %s'>%s</pre>", fontSize, song.Content))
		content.WriteString("</div>")
	}
	toc.WriteString("</ul></div>")

	return fmt.Sprintf(`
	<html>
	<head>
		<meta charset="utf-8">
		<style>
			body {
				font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
				line-height: 1.6;
				color: #333;
				margin: 0;
				padding: 0;
			}
			.toc {
				padding: 20px;
			}
			.toc h1 {
				border-bottom: 2px solid %s;
				padding-bottom: 10px;
			}
			.toc ul {
				list-style: none;
				padding: 0;
			}
			.toc li {
				margin-bottom: 10px;
			}
			.toc a {
				text-decoration: none;
				color: #333;
				font-weight: 500;
			}
			.toc a:hover {
				color: %s;
			}
			.song-page {
				page-break-before: always;
				padding: 20px;
			}
			h1 { margin-bottom: 5px; }
			h2 { color: #666; font-size: 1.2em; margin-top: 0; margin-bottom: 20px; }
			pre {
				font-family: "Roboto Mono", "Courier New", Courier, monospace;
				line-height: 1.2;
				white-space: pre;
				word-wrap: break-word;
				background: #fff;
				padding: 0;
				margin: 0;
			}
			pre b {
				color: %s;
				font-weight: bold;
				font-style: normal;
			}
			@media print {
				.song-page {
					page-break-before: always;
				}
				pre {
					background: transparent;
				}
			}
		</style>
	</head>
	<body>
		%s
		%s
	</body>
	</html>
	`, color, color, color, toc.String(), content.String())
}
