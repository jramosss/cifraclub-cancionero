package src

import (
	"net/http"
	"strings"
	"sync"

	"github.com/PuerkitoBio/goquery"
)

const baseURL = "https://www.cifraclub.com"

func fetch(url string) (*goquery.Document, error) {
	res, err := http.Get(url)

	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	doc, err := goquery.NewDocumentFromReader(res.Body)

	if err != nil {
		return nil, err
	}

	return doc, nil
}

func getSongsLinksInList(path string) ([]string, error) {
	doc, err := fetch(path)
	if err != nil {
		return nil, err
	}

	song_list := doc.Find(".list-links.list-musics")
	song_links := song_list.Find("li")
	var song_links_list []string
	song_links.Each(func(i int, s *goquery.Selection) {
		link := s.Find("a").AttrOr("href", "")
		song_links_list = append(song_links_list, createPrintUrl(link))
	})
	return song_links_list, nil
}

type Song struct {
	Title   string
	Artist  string
	Content string
}

func scrapeSongDetails(songURL string, wg *sync.WaitGroup, ch chan<- Song, errCh chan<- error) {
	defer wg.Done()
	doc, err := fetch(songURL)
	if err != nil {
		errCh <- err
		return
	}

	title := doc.Find("h1 a").Text()
	artist := doc.Find("h2 a").Text()
	
	// Get the content of all <pre> tags and join them
	var contentBuilder strings.Builder
	doc.Find("pre").Each(func(i int, s *goquery.Selection) {
		h, err := s.Html()
		if err == nil {
			contentBuilder.WriteString(h)
			contentBuilder.WriteString("\n")
		}
	})
	content := contentBuilder.String()

	ch <- Song{
		Title:   title,
		Artist:  artist,
		Content: content,
	}
}

func scrapeSongs(listURL string) ([]Song, error) {
	songLinks, err := getSongsLinksInList(listURL)
	if err != nil {
		return nil, err
	}

	var wg sync.WaitGroup
	ch := make(chan Song)
	errCh := make(chan error, len(songLinks))

	for _, link := range songLinks {
		wg.Add(1)
		go scrapeSongDetails(link, &wg, ch, errCh)
	}

	go func() {
		wg.Wait()
		close(ch)
		close(errCh)
	}()

	var songs []Song
	for song := range ch {
		songs = append(songs, song)
	}

	if len(errCh) > 0 {
		return nil, <-errCh
	}

	return songs, nil
}
