import {FieldType} from '@airtable/blocks/models';
import {useRecordById, Box, Text} from '@airtable/blocks/ui';
import React, {Fragment, useState, useCallback, useEffect} from 'react';
import {Stage, Layer, Circle} from "react-konva";
import ImageFromUrl from "./ImageFromUrl";
import AnnotationForm from "./AnnotationForm";

const ImageFromRecord = ({activeTable, selectedRecordId, selectedFieldId, newAnnotation, selectedAnnotation, addAnnotation, handleAnnotationSubmit, handleAnnotationFormChange, viewportSize}) => {
	const [imageMeasures, setImageMeasures] = useState(null);
	const [stageWrapperMeasures, setStageWrapperMeasures] = useState(null);
	const [initialScale, setInitialScale] = useState(1);

	const stageWrapper = useCallback(node => {
		if (node !== null) {
			setStageWrapperMeasures({
				width: node.getBoundingClientRect().width,
				height: node.getBoundingClientRect().height
			});
			if (imageMeasures) {
				setInitialScale(stageWrapperMeasures.width /imageMeasures.width)
			}
		}
	}, [viewportSize]);

	const selectedField = selectedFieldId ? activeTable.getFieldByIdIfExists(selectedFieldId) : null;
	const selectedRecord = useRecordById(activeTable, selectedRecordId ? selectedRecordId : '', {
		fields: [selectedField],
	});

	if (selectedField === null || selectedRecord === null) {
		return <Box display={'flex'} height={'100%'} width={'100%'} justifyContent={'center'} alignItems={'center'}>
			<Text>Select
				a field with an image to annotate</Text>
		</Box>;
	}

	if (selectedField.type !== FieldType.MULTIPLE_ATTACHMENTS) {
		return <div>This field doesn't contain attachments</div>
	}

	const cellValue = selectedRecord.getCellValue(selectedField);

	if (!cellValue || !cellValue[0].url) {
		return <div>This field doesn't contain images</div>
	}

	const handleClick = (e) => {
		const pointerPosition = e.target.getStage().getPointerPosition();
		addAnnotation({position: {x: pointerPosition.x/initialScale, y: pointerPosition.y/initialScale}})
	};

	const getAnnotationMarker = (annotation) => {
		if (!annotation || !annotation.position) return null;

		return <Circle
			x={annotation.position.x} y={annotation.position.y} shadowColor={'black'} shadowOpacity={0.5} shadowBlur={5}
			shadowOffset={{x: 1, y: 1}} radius={15} stroke={"#fff"} strokeWidth={2} fill="#facc32" scale={{x:1/initialScale, y:1/initialScale}}
		/>
	};

	const handleWheel = (e) => {
		if (e.evt.altKey) {
			e.evt.preventDefault();
			e.evt.deltaY > 0 ? setInitialScale(initialScale*1.01) : setInitialScale(initialScale/1.01);
			setStageWrapperMeasures({width: imageMeasures.width*initialScale, height:imageMeasures.height*initialScale});
		}
	};


	const measures = stageWrapperMeasures;

	return (<Fragment>
		<Box overflow={'auto'} flexGrow={1} ref={stageWrapper}>
			{stageWrapperMeasures && <Stage
				onClick={handleClick}
				width={measures.width}
				height={measures.height}
				scale={{x: initialScale, y: initialScale}}
				onWheel={handleWheel}
			>
				<Layer>
					<ImageFromUrl
						imageUrl={cellValue[0].url}
						setImageMeasures={setImageMeasures}
						stageWrapperMeasures={stageWrapperMeasures}
						setInitialScale={setInitialScale}
					/>
					{getAnnotationMarker(newAnnotation)}
					{getAnnotationMarker(selectedAnnotation)}
				</Layer>
			</Stage>}
		</Box>
		{cellValue && cellValue[0].url && <Box>
			<AnnotationForm onSubmit={handleAnnotationSubmit} onChange={handleAnnotationFormChange}/>
		</Box>}
	</Fragment>)
};

export default ImageFromRecord;