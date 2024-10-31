import webs from "../webs.json" with { type: "json" }

export function getSiteName(url) {
	const regex = /www\.(.*?)\.com/;
	const match = url.match(regex);
	const result = match ? match[1].toUpperCase() : "";
	if (!result) throw "\nERROR - Asegurate que el link sea correcto\n"
	return result;
	
}

export function getSiteConfig(site) {
		const config = webs[site];
		if (!config) throw (`\nERROR - Web No Identificada entre las opciones\n`);
		return config;
}

