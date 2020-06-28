import React, {useState, useEffect} from "react";
import {Rect} from "react-konva";

const ImageFromUrl = ({imageUrl, setImageMeasures, setInitialScale, stageWrapperMeasures}) => {
	const [image, setImage] = useState(null);
	const [scale, setScale] = useState(1);

	useEffect(() => {
		const getScale = (image) => {
			const {width, height} = stageWrapperMeasures;

			if (width === 0 || height === 0) {
				return 1;
			}

			if (image.width/image.height >= 1) {
				return width/image.width;
			}

			return height/image.height;
		};

		const imageToLoad = new window.Image();
		imageToLoad.src = imageUrl;
		imageToLoad.addEventListener("load", () => {
			setImage(imageToLoad);
			const compScale = getScale(imageToLoad);
			setInitialScale(compScale);
			setImageMeasures({width: imageToLoad.width, height:imageToLoad.height});
			// setStageMeasures({width: imageToLoad.width*scale, height: imageToLoad.height*scale});
		});
		return () => imageToLoad.removeEventListener("load");
	}, [imageUrl]);

	return (
		image && <Rect
			width={image.width*scale}
			fillPatternImage={image}
			fillPatternRepeat={'no-repeat'}
			height={image.height*scale}
		/>
	);
};

export default ImageFromUrl;
