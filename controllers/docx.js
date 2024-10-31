import config from "../config.json" with { type: "json" }
import { writeFileSync, readFileSync } from "node:fs";
import { fitImage } from "../utils/image.js";
import {
	patchDocument,
	TextRun,
	ExternalHyperlink,
	PatchType,
	ImageRun,
	Paragraph,
	HorizontalPositionAlign,
	TextWrappingType,
	TextWrappingSide,
	VerticalPositionRelativeFrom,
	HorizontalPositionRelativeFrom,
} from "docx";

export async function patchDocx(initialFile, patchData, fileNameData) {
	await patchDocument({
		outputType: "nodebuffer",
		data: initialFile,
		patches: {
			date: {
				type: PatchType.PARAGRAPH,
				children: [
					new TextRun({
						text: patchData.textDate,
						font: "Century Gothic",
						size: 24,
						allCaps: true,
					}),
				],
			},
			source: {
				type: PatchType.PARAGRAPH,
				children: [
					new ExternalHyperlink({
						children: [
							new TextRun({
								text: patchData.url,
								color: "0000EE",
								underline: { type: "single", color: "0000EE" },
							}),
						],
						link: patchData.url,
					}),
				],
			},
			my_patch: {
				type: PatchType.DOCUMENT,
				children: patchData.contentArray,
			},
		},
		keepOriginalStyles: true,
	}).then((doc) => {
		writeFileSync(`../${fileNameData.fileDate} - ${fileNameData.title}.docx`, doc);
	});
}

export function addImageInArray(src) {
	const width = config.imageWidth
	const image = new ImageRun({
		type: "jpg",
		data: readFileSync(src),
		transformation: fitImage(src, width),
		floating: {
			horizontalPosition: {
				relative: HorizontalPositionRelativeFrom.PAGE,
				align: HorizontalPositionAlign.CENTER,
			},
			verticalPosition: {
				relative: VerticalPositionRelativeFrom.PARAGRAPH,
				offset: 0,
			},
			wrap: {
				type: TextWrappingType.TOP_AND_BOTTOM,
				side: TextWrappingSide.BOTH_SIDES,
			},
			margins: {
				bottom: 0,
			},
		},
	});

	return new Paragraph({
		children: [image],
	});
}

export function addTextChildrenInArray(text, tag) {
	if (text === "") return;

	const stylesTable = config.tagsStyle
	let style = stylesTable[tag];
	if (!style) return;
	// console.log(style);
	return new Paragraph({
		children: [
			new TextRun({
				text: text,
				...style,
			}),
		],
	});
}
