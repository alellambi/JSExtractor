import { parse } from "node-html-parser";
import { addToArray } from "./patch-creator.js";
import pc from "picocolors";

export function htmlContainerParsing(response, config) {
	const parsedContent = parse(response);
	const containerNode = parsedContent.querySelector(`.${config.container}`);
	return containerNode;
}

export function checkTag(node, config) {
	let className, ignore, pass, src;
	try {
		className = node.attributes.class.trim().split(" ")[0];
	} catch {
		className = null;
	}
	try {
		src = node.attributes.src;
	} catch {
		src = null;
	}
	if (config.ignorar_clases.includes(className)) ignore = true;
	else if (node.textContent === "Seguir leyendo") pass = true;
	return {
		tag: node.tagName,
		textContent: node.textContent,
		src: src,
		ignore: ignore,
		pass: pass,
	};
}

export async function searchNodes(contentArray, node, config) {
	const { tag, textContent, src, ignore, pass } = checkTag(node, config);
	if (ignore) return;
	if (!pass) {
		const content = await addToArray(tag, textContent, src);
		if (content) contentArray.push(content);
	}
	if (node.firstChild) {
		const childrenArray = Array.from(node.childNodes);
		for (const child of childrenArray) {
			console.log(pc.blue(`Analizando elementos - ${child.tagName}`));
			await searchNodes(contentArray, child, config);
		}
	}
}
