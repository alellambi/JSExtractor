import axios from "axios";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
const folderPath = `./images/image.jpg`;

export async function getRequest(url) {
	return await axios
		.get(url)
		.then((res) => {
			return res.data;
		})
		.catch((error) => {
			throw "\nERROR - No se pudo obtener la noticia. \nAsegurate que el link sea correcto\n";
		});
}

export async function downloadImage(url) {
	// const folderPath = `./images/image.jpg`
	if (!existsSync(folderPath)) {
		mkdirSync(folderPath);
	}

	console.log(`Descargando ${url}`);

	const response = await axios({ url, responseType: "arraybuffer" });
	writeFileSync(folderPath, response.data);

	return folderPath;
}
