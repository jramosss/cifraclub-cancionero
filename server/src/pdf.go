package src

import (
	"fmt"
	"log"

	"github.com/playwright-community/playwright-go"
)

func createPDF(htmlContent string, filePath string) error {
	// Launch Playwright browser (equivalent to TypeScript implementation)
	pw, err := playwright.Run()
	if err != nil {
		return fmt.Errorf("could not start playwright: %v", err)
	}
	defer pw.Stop()

	browser, err := pw.Chromium.Launch(playwright.BrowserTypeLaunchOptions{
		Headless: playwright.Bool(true),
		Args: []string{
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-gpu",
			"--disable-dev-shm-usage",
		},
	})
	if err != nil {
		return fmt.Errorf("could not launch browser: %v", err)
	}
	defer browser.Close()

	page, err := browser.NewPage()
	if err != nil {
		return fmt.Errorf("could not create page: %v", err)
	}

	// Set the HTML content (equivalent to page.setContent in TypeScript)
	err = page.SetContent(htmlContent)
	if err != nil {
		return fmt.Errorf("could not set content: %v", err)
	}

	// Generate PDF with A4 format (equivalent to page.pdf in TypeScript)
	_, err = page.PDF(playwright.PagePdfOptions{
		Path:   playwright.String(filePath),
		Format: playwright.String("A4"),
		Margin: &playwright.Margin{
			Top:    playwright.String("10mm"),
			Bottom: playwright.String("10mm"),
			Left:   playwright.String("10mm"),
			Right:  playwright.String("10mm"),
		},
	})
	if err != nil {
		return fmt.Errorf("could not create PDF: %v", err)
	}

	log.Printf("PDF generated successfully: %s", filePath)
	return nil
}
