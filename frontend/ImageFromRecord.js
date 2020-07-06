import {FieldType} from '@airtable/blocks/models';
import {useRecordById, Box, Text} from '@airtable/blocks/ui';
import React, {Fragment, useState, useCallback} from 'react';
import {Stage, Layer, Circle, Rect} from "react-konva";
import ImageFromUrl from "./ImageFromUrl";
import AnnotationForm from "./AnnotationForm/AnnotationForm";

const ImageFromRecord = ({activeTable, selectedRecordId, selectedFieldId, newAnnotation, selectedAnnotation, addAnnotation, handleAnnotationSubmit, handleAnnotationFormChange, viewportSize, onMarkerColorChange}) => {
	const [imageMeasures, setImageMeasures] = useState(null);
	const [stageWrapperMeasures, setStageWrapperMeasures] = useState(null);
	const [initialScale, setInitialScale] = useState(1);
	const [markerColor, setMarkerColor] = useState('blue');
	const [markerShape, setMarkerShape] = useState('circle');
	const [newAnnotationMarker, setNewAnnotationMarker] = useState(null);

	const stageWrapper = useCallback(node => {
		if (node !== null) {
			setStageWrapperMeasures({
				width: node.getBoundingClientRect().width,
				height: node.getBoundingClientRect().height
			});
			if (imageMeasures) {
				setInitialScale(stageWrapperMeasures.width / imageMeasures.width)
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
		if (markerShape === 'circle') {
			const pointerPosition = e.target.getStage().getPointerPosition();
			addAnnotation({
				...newAnnotation,
				marker: {
					color: markerColor,
					shape: 'circle',
					position: {x: pointerPosition.x / initialScale, y: pointerPosition.y / initialScale}
				}
			});
		}
	};

	const handleMouseDown = (e) => {
		if (markerShape !== 'circle') {
			const pointerPosition = e.target.getStage().getPointerPosition();
			setNewAnnotationMarker({
				color: markerColor,
				shape: 'rect',
				width: 0,
				height: 0,
				position: {x: pointerPosition.x / initialScale, y: pointerPosition.y / initialScale}
			});
		}
	};

	const handleMouseMove = e => {
		if (newAnnotationMarker && markerShape !== 'circle') {
			const sx = newAnnotationMarker.position.x;
			const sy = newAnnotationMarker.position.y;
			const {x, y} = e.target.getStage().getPointerPosition();
			setNewAnnotationMarker({
				shape: 'rect',
				width: x / initialScale - sx,
				height: y / initialScale - sy,
				position: {
					x: sx,
					y: sy,
				},
			});
		}
	};

	const handleMouseUp = () => {
		if (markerShape !== 'circle') {
			addAnnotation({...newAnnotation, marker: newAnnotationMarker});
			setNewAnnotationMarker(null);
		}
	};

	// const getAnnotationMarker = (annotation) => {
	// 	if (!annotation || !annotation.position) return null;
	//
	// 	return <Circle
	// 		x={annotation.position.x} y={annotation.position.y} shadowColor={'black'} shadowOpacity={0.5} shadowBlur={5}
	// 		shadowOffset={{x: 1, y: 1}} radius={15} stroke={"#fff"} strokeWidth={2} fill={markerColor}
	// 		scale={{x: 1 / initialScale, y: 1 / initialScale}}
	// 	/>
	// };

	const handleMarkerShapeChange = (shape) => {
		setNewAnnotationMarker(null);
		addAnnotation({...newAnnotation, marker: null});
		setMarkerShape(shape);
	};

	const drawAnnotationMarker = (annotationMarker, selected = false) => {
		if (!annotationMarker || !annotationMarker.position) return null;

		switch (selected ? annotationMarker.shape : markerShape) {
			case 'rect':
				return (<React.Fragment>
					<Rect
						fill="transparent"
						stroke={markerColor}
						strokeWidth={6}
						width={annotationMarker.width}
						height={annotationMarker.height}
						x={annotationMarker.position.x}
						y={annotationMarker.position.y}
					/>
				</React.Fragment>);
			case 'circle':
				return <Circle
					x={annotationMarker.position.x} y={annotationMarker.position.y} shadowColor={'black'}
					shadowOpacity={0.5} shadowBlur={5}
					shadowOffset={{x: 1, y: 1}} radius={15} stroke={"#fff"} strokeWidth={2} fill={markerColor}
					scale={{x: 1 / initialScale, y: 1 / initialScale}}
				/>;
			default:
				return <Circle
					x={annotationMarker.position.x} y={annotationMarker.position.y} shadowColor={'black'}
					shadowOpacity={0.5} shadowBlur={5}
					shadowOffset={{x: 1, y: 1}} radius={15} stroke={"#fff"} strokeWidth={2} fill={markerColor}
					scale={{x: 1 / initialScale, y: 1 / initialScale}}
				/>;
		}

	};

	const handleWheel = (e) => {
		if (e.evt.altKey) {
			e.evt.preventDefault();
			e.evt.deltaY > 0 ? setInitialScale(initialScale * 1.01) : setInitialScale(initialScale / 1.01);
			setStageWrapperMeasures({
				width: imageMeasures.width * initialScale,
				height: imageMeasures.height * initialScale
			});
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
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
			>
				<Layer>
					<ImageFromUrl
						imageUrl={cellValue[0].url}
						setImageMeasures={setImageMeasures}
						stageWrapperMeasures={stageWrapperMeasures}
						setInitialScale={setInitialScale}
					/>
					{drawAnnotationMarker(newAnnotationMarker || newAnnotation && newAnnotation.marker)}
					{drawAnnotationMarker(selectedAnnotation && selectedAnnotation.marker, true)}
				</Layer>
			</Stage>}
		</Box>
		{cellValue && cellValue[0].url && <Box>
			<AnnotationForm
				onSubmit={handleAnnotationSubmit} onChange={handleAnnotationFormChange}
				onMarkerColorChange={setMarkerColor} onMarkerShapeChange={handleMarkerShapeChange}
			/>
		</Box>}
	</Fragment>)
};

export default ImageFromRecord;