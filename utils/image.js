import { imageSize } from "image-size";

export function fitImage(image) {
	let width, height;
	const originalSize = imageSize(image);
	const aspectRatio = originalSize.width / originalSize.height;

	width = 500;
	height = width / aspectRatio;
	// console.log({ width, height})
	return {
		width,
		height,
	};
}
