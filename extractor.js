import { patchDocx } from "./controllers/docx.js";
import { htmlContainerParsing, searchNodes } from "./controllers/html-parsing.js";
import { getSiteConfig, getSiteName } from "./controllers/site-data.js";

import { getRequest } from "./services/requests.js";
import { getDate } from "./utils/date.js";

import { readFileSync } from "node:fs";
import { question } from "readline-sync";

async function startApp() {
	let contentArray = [];
	console.log("POR EL MOMENTO SOLO INFOBAE - LA NACION - PAGINA 12 - CLARIN");

	const url = question("Ingrese el enlace de la noticia: ");

	// Para Testing
	// const test = {
	//   infobae: "https://www.infobae.com/america/ciencia-america/2023/01/20/cada-vez-es-mas-dificil-ver-las-estrellas-detectaron-que-la-contaminacion-luminica-se-duplico-en-12-anos/",
	//   clarin: "https://www.clarin.com/politica/uta-anuncio-paro-colectivos-jueves-31-octubre_0_4fPskhua71.html",
	//   nacion: "https://www.lanacion.com.ar/sociedad/la-uta-anuncio-un-paro-de-colectivos-para-el-jueves-31-de-octubre-en-el-amba-nid28102024/",
	//   pagina12: "https://www.pagina12.com.ar/778211-la-uta-confirmo-un-paro-de-colectivos-para-el-jueves"
	// }
	// const url = test.pagina12
	// console.log(url)
	// Para Testing

	const site = getSiteName(url);
	const config = getSiteConfig(site);
	const { fileDate, textDate } = getDate();
	const response = await getRequest(url);

	const title = question(`Ingrese el titulo del archivo: ${fileDate} - `).toUpperCase();
	// Para Testing
	// const title = "PRUEBA123"
	// Para Testing

	const container = htmlContainerParsing(response, config);
	await searchNodes(contentArray, container, config);
	const patchData = { textDate, url, contentArray };
	const fileNameData = { fileDate, title };
	const initialFile = readFileSync("../Explotaciones.docx");

	await patchDocx(initialFile, patchData, fileNameData);
}

startApp();
