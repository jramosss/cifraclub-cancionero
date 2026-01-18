package src

import (
	"crypto/sha256"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"sort"
	"time"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// Add timing middleware
	r.Use(func(c *gin.Context) {
		start := time.Now()
		c.Next()
		duration := time.Since(start)
		log.Printf("Request [%s] %s took %v", c.Request.Method, c.Request.URL.Path, duration)
	})

	// Endpoint to generate the cancionero
	r.GET("/generate", handleGenerate)

	// Endpoint to access the generated files
	r.StaticFS("/files", http.Dir("output"))
}

func handleGenerate(c *gin.Context) {
	url := c.Query("url")
	if url == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url parameter is required"})
		return
	}

	log.Printf("Generating cancionero for: %s", url)

	startScrape := time.Now()
	songDetails, err := scrapeSongs(url)
	scrapeDuration := time.Since(startScrape)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to scrape songs: %v", err)})
		return
	}

	if len(songDetails) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "no songs found in the provided URL"})
		return
	}

	// Sort songs alphabetically by title
	sort.Slice(songDetails, func(i, j int) bool {
		return songDetails[i].Title < songDetails[j].Title
	})

	styleOptions := StyleOptions{
		PrimaryColor: c.Query("color"),
		FontSize:     c.Query("fontSize"),
	}

	html := generateHtml(songDetails, styleOptions)
	
	// Generate a unique filename based on the URL
	hash := sha256.Sum256([]byte(url))
	filename := fmt.Sprintf("%x.pdf", hash[:8])
	filePath := filepath.Join("output", filename)

	startPdf := time.Now()
	err = createPDF(html, filePath)
	pdfDuration := time.Since(startPdf)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to generate PDF: %v", err)})
		return
	}

	log.Printf("SUCCESS: Scraping: %v | PDF: %v | Total: %v", 
		scrapeDuration.Round(time.Millisecond), 
		pdfDuration.Round(time.Millisecond), 
		time.Since(startScrape).Round(time.Millisecond))

	c.JSON(http.StatusOK, gin.H{
		"message":  "PDF generated successfully",
		"filename": filename,
		"download": fmt.Sprintf("/files/%s", filename),
	})
}
