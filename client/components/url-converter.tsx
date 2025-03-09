"use client"

import type React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import axios from "axios"
import { AlertCircle, FileText, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { connectToSocket } from "./utils"

type ConvertToPdfResponse = { 
  url: string;
  html: string;
}

export function UrlConverter({ id }: { id: string }) {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [html, setHtml] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [socketReady, setSocketReady] = useState(false)

  const validateUrl = (url: string) => {
    const cifraclubRegex = /^(https?:\/\/)?(www\.)?cifraclub\.com.*/i
    return cifraclubRegex.test(url)
  }

  useEffect(() => {
    const socket = connectToSocket(id, () => setSocketReady(true))
    socket.onmessage = (event) => {
      console.log("Received message", event.data)
      const data: WebsocketProgressEvent = JSON.parse(event.data)
      setProgress(data.total > 0 ? (data.progress / data.total) * 100 : 0)
    }

    return () => {
      socket.close()
    }
  }, [])

  const convertUrlToPdf = async (url: string): Promise<ConvertToPdfResponse> => {
    const response = await axios.post("/api/convert-to-pdf", {
      list_url: url,
      connection_id: id,
    });

    if (response.status !== 200) {
      throw new Error("An error occurred while processing your request");
    }

    return response.data;
  }

  // TODO: implement a progress bar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateUrl(url)) {
      setError("Please enter a valid Cifraclub URL (must start with cifraclub.com)")
      return
    }

    try {
      setIsLoading(true)
      const { url: _pdfUrl, html } = await convertUrlToPdf(url)
      setPdfUrl(_pdfUrl)
      setHtml(html)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while processing your request")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#ff7700]/20 shadow-lg">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium text-gray-700">
                Cifraclub URL
              </label>
              <Input
                id="url"
                type="text"
                placeholder="https://www.cifraclub.com/your-song-list"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="border-[#ff7700]/30 focus:border-[#ff7700] focus:ring-[#ff7700]"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">Enter a URL from Cifraclub.com to convert it to PDF</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#ff7700] to-red-500 hover:from-[#ff7700]/90 hover:to-red-600"
              disabled={isLoading || !socketReady}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Convert to PDF
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {
        isLoading && (
          <div className="flex items-center justify-center">
            <progress value={progress} max="100" className="w-full h-2 rounded-lg bg-gray-200" />
          </div>
        )
      }

      {pdfUrl && !error && (
        <div className="space-y-4">
          <Card className="border-green-500/20 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <FileText className="h-16 w-16 text-[#ff7700]" />
                <h3 className="text-xl font-semibold text-gray-800">PDF Generated Successfully!</h3>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  {/* <Button
                    onClick={() => window.open(pdfUrl, "_blank")}
                    className="flex-1 bg-[#ff7700] hover:bg-[#ff7700]/90"
                  >
                    View PDF
                  </Button> */}
                  <Button
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = pdfUrl
                      link.download = "cifraclub-songs.pdf"
                      link.target = "_blank"
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    variant="outline"
                    className="flex-1 border-[#ff7700] text-[#ff7700] hover:bg-[#ff7700]/10"
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/*
          TODO: This preview feature inserts a whitespace at the top of the page, fix this
          <div className="w-full rounded-lg border border-gray-200 shadow-md bg-white">
            <div className="aspect-[3/4] w-full max-h-[600px] overflow-auto p-4">
              {html ? (
                <div className="flex flex-col gap-4">
                  <h1 className="text-xl font-semibold text-gray-800">Preview</h1>
                  <div dangerouslySetInnerHTML={{ __html: html }} className="pdf-preview" />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No preview available</p>
                </div>
              )}
            </div>
          </div> */}
        </div>
      )}
    </div>
  )
}

