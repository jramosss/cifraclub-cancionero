import axios from 'axios'
import { NextRequest } from 'next/server'

type GenerateResponse = {
    url: string
    html: string
}

export async function POST(req: NextRequest) {
    const { list_url, connectionId } = await req.json()
    const API_URL = process.env.API_URL
    try {
        const res = await axios.post(
            `${API_URL}/generate/${connectionId}`,
            {},
            {
                params: { list_url },
            },
        )
        const { url, html } = res.data as GenerateResponse
        const finalUrl = `${API_URL}/${url.replace('./', '')}`

        return new Response(JSON.stringify({ url: finalUrl, html }))
    } catch (e) {
        console.error(e)
        return new Response(JSON.stringify({ error: e }), {
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
}
