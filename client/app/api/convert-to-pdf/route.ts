import axios from "axios";
import type { NextRequest } from "next/server";

type GenerateResponse = {
	url: string;
	html: string;
};

export async function POST(req: NextRequest) {
	const { list_url, connection_id } = await req.json();
	const API_URL = process.env.API_URL;
	try {
		const res = await axios.post(
			`${API_URL}/generate/${connection_id}`,
			{ list_url },
			{
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
		const { url } = res.data as GenerateResponse;

		return new Response(JSON.stringify({ url }));
	} catch (e) {
		console.error(e);
		return new Response(JSON.stringify({ error: e }), {
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
}
