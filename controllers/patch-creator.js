import { addImageInArray, addTextChildrenInArray } from "./docx.js";
import { downloadImage } from "../services/requests.js";

const TAGS = ["P", "H1", "H2", "H3", "H4", "H5", "FIGCAPTION", "FIGURE", "PICTURE", "IMG"];

export async function addToArray(tag, text, src = null) {
	let content;
	if (TAGS.includes(tag) && text !== "Seguir leyendo") {
		if (tag === "IMG") {
			const path = await downloadImage(src);

			content = addImageInArray(path);
		} else {
			content = addTextChildrenInArray(text, tag);
		}
	}
	return content;
}
