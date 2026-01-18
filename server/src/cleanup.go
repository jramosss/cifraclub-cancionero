package src

import (
	"log"
	"os"
	"path/filepath"
	"time"
)

// StartCleanupTask starts a background goroutine that periodically removes files
// from the specified directory that are older than the given TTL.
func StartCleanupTask(dir string, ttl time.Duration) {
	ticker := time.NewTicker(30 * time.Minute)
	
	log.Printf("Starting cleanup task for %s with TTL %v", dir, ttl)
	
	go func() {
		for range ticker.C {
			files, err := os.ReadDir(dir)
			if err != nil {
				log.Printf("Error reading directory for cleanup: %v", err)
				continue
			}

			now := time.Now()
			deletedCount := 0

			for _, f := range files {
				if f.IsDir() {
					continue
				}

				info, err := f.Info()
				if err != nil {
					log.Printf("Error getting file info for %s: %v", f.Name(), err)
					continue
				}

				if now.Sub(info.ModTime()) > ttl {
					err := os.Remove(filepath.Join(dir, f.Name()))
					if err != nil {
						log.Printf("Error deleting file %s: %v", f.Name(), err)
					} else {
						deletedCount++
					}
				}
			}

			if deletedCount > 0 {
				log.Printf("Cleanup: deleted %d files older than %v", deletedCount, ttl)
			}
		}
	}()
}
