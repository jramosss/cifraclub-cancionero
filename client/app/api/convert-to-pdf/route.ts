import axios from "axios";
import type { NextRequest } from "next/server";

type GenerateResponse = {
	url: string;
	html: string;
};

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const url = searchParams.get("url");
	const color = searchParams.get("color");
	const fontSize = searchParams.get("fontSize");

	if (!url) {
		return new Response(JSON.stringify({ error: "url parameter is required" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const API_URL = process.env.API_URL || "http://localhost:8080";

	try {
		const res = await axios.get(`${API_URL}/generate`, {
			params: { url, color, fontSize },
		});

		// The backend returns { message, filename, download }
		// We can return the download link or the whole object
		return new Response(JSON.stringify(res.data), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (e: any) {
		console.error(e);
		const errorMessage = e.response?.data?.error || "failed to generate PDF";
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: e.response?.status || 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
