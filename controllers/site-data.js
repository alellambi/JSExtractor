import webs from "../webs.json" with { type: "json" }

export function getSiteName(url) {
	const regex = /www\.(.*?)\.com/;
	const match = url.match(regex);
	const result = match ? match[1].toUpperCase() : "";
	return result || undefined;
}

export function getSiteConfig(site) {
	try {
		const config = webs[site];
		return config;
	} catch {
		throw new Error("Web No Identificada");
	}
}
