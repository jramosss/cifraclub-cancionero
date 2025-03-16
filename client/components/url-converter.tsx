"use client";

import type React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { AlertCircle, FileText } from "lucide-react";
import { useState } from "react";

type ConvertToPdfResponse = {
	url: string;
	html: string;
};

export function UrlConverter({ id }: { id: string }) {
	const [url, setUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);

	const validateUrl = (url: string) => {
		const cifraclubRegex = /^(https?:\/\/)?(www\.)?cifraclub\.com.*/i;
		return cifraclubRegex.test(url);
	};

	const convertUrlToPdf = async (
		url: string,
	): Promise<ConvertToPdfResponse> => {
		const response = await axios.post("/api/convert-to-pdf", {
			list_url: url,
			connection_id: id,
		});

		if (response.status !== 200) {
			throw new Error("An error occurred while processing your request");
		}

		return response.data;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!validateUrl(url)) {
			setError(
				"Please enter a valid Cifraclub URL (must start with cifraclub.com)",
			);
			return;
		}

		try {
			setIsLoading(true);
			const { url: _pdfUrl } = await convertUrlToPdf(url);
			setPdfUrl(_pdfUrl);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "An error occurred while processing your request",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<Card className="border-[#ff7700]/20 shadow-lg">
				<CardContent className="pt-6">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="url"
								className="text-sm font-medium text-gray-700"
							>
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
							<p className="text-xs text-gray-500">
								Enter a URL from Cifraclub.com to convert it to PDF
							</p>
						</div>

						<Button
							type="submit"
							className="w-full bg-gradient-to-r from-[#ff7700] to-red-500 hover:from-[#ff7700]/90 hover:to-red-600"
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
									<svg
										className="animate-spin h-4 w-4 mr-2"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.009 8.009 0 014.709 14H2c0 3.309 2.691 6 6 6v-2zm10-9.291A8.009 8.009 0 0119.291 10H22c0-3.309-2.691-6-6-6v2z"
										/>
									</svg>
									Loading...
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

			{pdfUrl && !error && (
				<div className="space-y-4">
					<Card className="border-green-500/20 shadow-lg">
						<CardContent className="pt-6">
							<div className="flex flex-col items-center space-y-4">
								<FileText className="h-16 w-16 text-[#ff7700]" />
								<h3 className="text-xl font-semibold text-gray-800">
									PDF Generated Successfully!
								</h3>
								<div className="flex flex-col sm:flex-row gap-4 w-full">
									{/* <Button
                    onClick={() => window.open(pdfUrl, "_blank")}
                    className="flex-1 bg-[#ff7700] hover:bg-[#ff7700]/90"
                  >
                    View PDF
                  </Button> */}
									<Button
										onClick={() => {
											const link = document.createElement("a");
											link.href = pdfUrl;
											link.download = "cifraclub-songs.pdf";
											link.target = "_blank";
											document.body.appendChild(link);
											link.click();
											document.body.removeChild(link);
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
				</div>
			)}
		</div>
	);
}
