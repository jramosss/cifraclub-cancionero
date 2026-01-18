package main

import (
	"log"
	"os"
	"time"

	"cifraclub-list-to-pdf/src"

	"github.com/gin-gonic/gin"
)

func main() {
	// Ensure output directory exists
	if _, err := os.Stat("output"); os.IsNotExist(err) {
		err := os.Mkdir("output", 0755)
		if err != nil {
			log.Fatalf("failed to create output directory: %v", err)
		}
	}

	// Start background cleanup task (1 hour TTL)
	src.StartCleanupTask("output", 1*time.Hour)

	r := gin.Default()

	src.SetupRoutes(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	err := r.Run(":" + port)
	if err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
