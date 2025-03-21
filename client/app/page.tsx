import { UrlConverter } from "@/components/url-converter"
import { v4 } from "uuid"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ff7700] via-white to-red-500 bg-fixed">
      <div className="container mx-auto px-4 py-16 max-w-3xl pb-24">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Cifraclub to PDF</h1>
          <p className="text-lg text-gray-700">Convert your favorite Cifraclub song lists into downloadable PDFs</p>
        </div>

        <UrlConverter id={v4()} />
      </div>
    </main>
  )
}

