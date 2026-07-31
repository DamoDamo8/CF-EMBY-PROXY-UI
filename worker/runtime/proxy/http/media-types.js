export function normalizeHttpMediaType(value = "") {
	return String(value || "").trim().toLowerCase().split(";", 1)[0].trim();
}

export function isJsonHttpMediaType(value = "") {
	const mediaType = normalizeHttpMediaType(value);
	return mediaType === "application/json"
		|| mediaType === "text/json"
		|| /^application\/[a-z0-9!#$&^_.+-]+\+json$/i.test(mediaType);
}

export function isHtmlHttpMediaType(value = "") {
	const mediaType = normalizeHttpMediaType(value);
	return mediaType === "text/html" || mediaType === "application/xhtml+xml";
}

export function acceptsExplicitHtmlDocument(acceptHeader = "") {
	for (const item of String(acceptHeader || "").split(",")) {
		const [rawMediaType, ...rawParameters] = item.split(";");
		const mediaType = normalizeHttpMediaType(rawMediaType);
		if (mediaType !== "text/html" && mediaType !== "application/xhtml+xml") continue;
		let quality = 1;
		for (const rawParameter of rawParameters) {
			const [rawName, rawValue] = rawParameter.split("=", 2);
			if (String(rawName || "").trim().toLowerCase() !== "q") continue;
			const parsedQuality = Number(String(rawValue || "").trim());
			quality = Number.isFinite(parsedQuality) ? parsedQuality : 0;
			break;
		}
		if (quality > 0 && quality <= 1) return true;
	}
	return false;
}
