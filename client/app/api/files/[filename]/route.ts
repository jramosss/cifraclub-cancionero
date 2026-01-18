import axios from "axios";
import type { NextRequest } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: { filename: string } },
) {
	const filename = params.filename;
	const API_URL = process.env.API_URL || "http://localhost:8080";

	try {
		const response = await axios.get(`${API_URL}/files/${filename}`, {
			responseType: "arraybuffer",
		});

		return new Response(response.data, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		});
	} catch (e: any) {
		console.error(e);
		return new Response(JSON.stringify({ error: "File not found" }), {
			status: 404,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
}
