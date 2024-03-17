'use client'

import Preview from '@/lib/components/Preview'
import axios from 'axios'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
    const [downloadURL, setDownloadURL] = useState<string | null>(null)
    const [html, setHtml] = useState<string | null>(null)
    const [previewVisible, setPreviewVisible] = useState(false)

    async function submit(e: FormData) {
        const list_url = e.get('list_url')

        const response = await axios.post('/api/generate', { list_url })
        const { url, html } = response.data
        setDownloadURL(url)
        setHtml(html)
        console.log({ url, html })
    }

    return (
        <main className="flex min-h-screen flex-col items-center gap-2 justify-center">
            <h1 style={{ color: '#F70' }}>Insert list url</h1>
            <form className="flex flex-col gap-2" action={submit}>
                <input
                    name="list_url"
                    className="border-gray-800 p-2 border-solid border-2 w-96"
                    placeholder="https://www.cifraclub.com/musico/552807671/repertorio/favoritas/"
                />
                <button
                    className="text-white p-2 rounded-md"
                    type="submit"
                    style={{ backgroundColor: '#F70' }}
                >
                    Submit
                </button>
            </form>
            {downloadURL && <Link href={downloadURL}>Download</Link>}
            {downloadURL && (
                <button onClick={() => setPreviewVisible(true)}>
                    Show Preview
                </button>
            )}
            {html && (
                <div>
                    <Preview
                        html={html}
                        visible={previewVisible}
                        onHide={() => setPreviewVisible(false)}
                    />
                </div>
            )}
        </main>
    )
}
