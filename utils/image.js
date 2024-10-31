import { imageSize } from "image-size";

export function fitImage(image, width = 500) {
	let height;
	const originalSize = imageSize(image);
	const aspectRatio = originalSize.width / originalSize.height;

	height = width / aspectRatio;
	return {
		width,
		height,
	};
}
