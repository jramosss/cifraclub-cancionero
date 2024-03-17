'use client'

import axios from 'axios'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
    const [downloadURL, setDownloadURL] = useState<string | null>(null)

    async function submit(e: FormData) {
        const list_url = e.get('list_url')

        const response = await axios.post('/api/generate', { list_url })
        const url = response.data
        setDownloadURL(url)
    }

    return (
        <main className="flex min-h-screen flex-col items-center gap-2 justify-center">
            <div>Insert list url</div>
            <form className="flex flex-col gap-2" action={submit}>
                <input
                    name="list_url"
                    className="border-gray-800 p-2 border-solid border-2"
                />
                <button
                    className="bg-blue-500 text-white p-2 rounded-md"
                    type="submit"
                >
                    Submit
                </button>
            </form>
            {downloadURL && <Link href={downloadURL}>Download</Link>}
        </main>
    )
}
