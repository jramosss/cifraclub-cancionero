import axios from 'axios'
import { NextRequest } from 'next/server'

type GenerateResponse = {
    url: string
    html: string
}

export async function POST(req: NextRequest) {
    const { list_url } = await req.json()
    const API_URL = process.env.API_URL
    try {
        const res = await axios.post(
            `${API_URL}/generate`,
            {},
            {
                params: { list_url },
            },
        )
        const { url, html } = res.data as GenerateResponse

        return new Response(JSON.stringify({ url, html }))
    } catch (e) {
        return new Response(JSON.stringify(e), {
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
}
