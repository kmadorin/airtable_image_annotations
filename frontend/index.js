import React, {useEffect, useState} from 'react';
import {
	initializeBlock,
	useBase,
	useLoadable,
	useGlobalConfig,
	useWatchable,
	useViewport,
	Box,
	useRecords,
	useRecordById,
	useSettingsButton,
	Heading,
	ViewportConstraint,
} from '@airtable/blocks/ui';
import {cursor, session} from "@airtable/blocks";

import ImageFromRecord from "./ImageFromRecord";
import AnnotationsList from "./AnnotationsList";
import SettingsForm from './SettingsForm';
import {FieldType} from "@airtable/blocks/models";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

function ImageAnnotationsBlock() {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	useSettingsButton(() => setIsSettingsOpen(!isSettingsOpen));

	const [selectedRecordId, setSelectedRecordId] = useState(null);
	const [selectedFieldId, setSelectedFieldId] = useState(null);

	const [annotations, setAnnotations] = useState([]);
	const [newAnnotation, setNewAnnotation] = useState(null);
	const [selectedAnnotationIndex, setSelectedAnnotationIndex] = useState(-1);
	const [viewportSize, setViewportSize] = useState(null);

	// load selected records and fields
	useLoadable(cursor);

	// Update the selectedRecordId and selectedFieldId state when the selected
	// record or field change.
	useWatchable(cursor, ['selectedRecordIds', 'selectedFieldIds'], () => {
		// If the update was triggered by a record being de-selected,
		// the current selectedRecordId will be retained.  This is
		// what enables the caching described above.
		if (cursor.selectedRecordIds.length > 0) {
			// There might be multiple selected records. We'll use the first
			// one.
			setSelectedRecordId(cursor.selectedRecordIds[0]);
		}
		if (cursor.selectedFieldIds.length > 0) {
			// There might be multiple selected fields. We'll use the first
			// one.
			setSelectedFieldId(cursor.selectedFieldIds[0]);
		}
	});

	// This watch deletes the cached selectedRecordId and selectedFieldId when
	// the user moves to a new table or view. This prevents the following
	// scenario: User selects a record that contains an image. The preview appears.
	// User switches to a different table. The preview disappears. The user
	// switches back to the original table. Weirdly, the previously viewed preview
	// reappears, even though no record is selected.
	useWatchable(cursor, ['activeTableId', 'activeViewId'], () => {
		setSelectedRecordId(null);
		setSelectedFieldId(null);
	});

	const base = useBase();
	const viewport = useViewport();
	const currentUserId = session.currentUser.id;
	const activeTable = base.getTableByIdIfExists(cursor.activeTableId);
	const globalConfig = useGlobalConfig();
	const annotationsTableId = globalConfig.get('annotationsTableId');
	const annotationsTable = base.getTableByIdIfExists(annotationsTableId);
	const allAnnotationsRecords = useRecords(annotationsTable);

	let annotationsRecords = null;
	const selectedRecord = useRecordById(activeTable, selectedRecordId ? selectedRecordId : '');
	const selectedField = selectedFieldId ? activeTable.getFieldByIdIfExists(selectedFieldId) : null;

	if (annotationsTable && activeTable && annotationsTable.id !== activeTable.id && selectedField && selectedField.type === FieldType.MULTIPLE_ATTACHMENTS) {
		const cellValue = selectedRecord.getCellValue(selectedField);
		if (cellValue && cellValue[0].url) {
			annotationsRecords = allAnnotationsRecords && allAnnotationsRecords.filter(record => {
				const imageInfo = record.getCellValue(annotationsTable.getFieldByNameIfExists('Image')).split(',');
				const tableId = imageInfo[0];
				const recordId = imageInfo[1];
				const fieldId = imageInfo[2];

				return (tableId === activeTable.id) && (recordId === selectedRecordId) && (fieldId === selectedFieldId);
			});
		}
	}

	useEffect(()=> {
		const onViewPortWatch = () => {
			setViewportSize(viewport.size);
		};

		viewport.watch("size", onViewPortWatch);

		return () => {
			viewport.unwatch("size", onViewPortWatch);
		}
	}, []);

	useEffect(() => {
		dayjs.extend(relativeTime);
	}, []);

	useEffect(() => {
		const annotationsFromRecords = !annotationsRecords ? [] : annotationsRecords.map(annotationRecord => {
			const rawPosition = annotationRecord.getCellValue('Position');
			const text = annotationRecord.getCellValue('Text');
			const author = annotationRecord.getCellValue('Author');
			const createdTime = Date.parse(annotationRecord.createdTime.toISOString());
			const createdTimeFromNow = dayjs(createdTime).fromNow(true);
			const recordId = annotationRecord.id;

			let position = null;

			if (rawPosition) {
				const positionArray = rawPosition.split(',');
				position = {x: +positionArray[0], y: +positionArray[1]};
			}

			return {
				recordId,
				position,
				text,
				author,
				createdTime,
				createdTimeFromNow,
			}
		});
		setAnnotations(annotationsFromRecords);
	}, [annotationsTableId, selectedRecordId]);

	if (!activeTable) {
		return null;
	}

	const handleAnnotationAdding = (annotation) => {
		setSelectedAnnotationIndex(-1);
		setNewAnnotation(annotation)
	};

	const handleAnnotationFormChange = (text) => {
		setNewAnnotation({...newAnnotation, text});
	};

	const createNewAnnotationRecord = (annotationsTable, annotation) => {
		const position = annotation.position ? `${annotation.position.x},${annotation.position.y}` : '';
		return annotationsTable.createRecordAsync({
			Image: [activeTable.id, selectedRecordId, selectedFieldId].join(','),
			'Text': annotation.text,
			'Author': currentUserId,
			'Position': position,
		})
	};

	const deleteAnnotationRecord = (annotationsTable, annotation) => {
		return annotationsTable.deleteRecordAsync(annotation.recordId);
	};

	const updateAnnotationRecord = (annotationsTable, annotation) => {
		const position = annotation.position ? `${annotation.position.x},${annotation.position.y}` : '';
		return annotationsTable.updateRecordAsync(annotation.recordId, {
			'Text': annotation.text,
			'Author': currentUserId,
			'Position': position,
		})
	};

	const handleAnnotationSubmit = () => {
		if (newAnnotation && annotationsTable) {
			createNewAnnotationRecord(annotationsTable, newAnnotation).then((res) => {
				setNewAnnotation(null);
				const createdTime = new Date();
				const createdTimeFromNow = dayjs(createdTime).fromNow(true);
				setAnnotations([...annotations, {...newAnnotation, createdTime, createdTimeFromNow,  author: currentUserId, recordId: res}]);
			}).catch((e) => {
				console.log(e);
			});
		}
	};

	const editAnnotation = (index, newText) => {
		const newAnnotations = [...annotations];
		newAnnotations[index].text = newText;

		updateAnnotationRecord(annotationsTable, newAnnotations[index]).then(() => {
			setAnnotations(newAnnotations);
		});
	};

	const deleteAnnotation = (index) => {
		deleteAnnotationRecord(annotationsTable, annotations[index]).then(() => {
			const newAnnotations = [...annotations];
			newAnnotations.splice(index, 1);
			setAnnotations(newAnnotations);
		}).catch(e => {
			console.log(e);
		});
	};

	const selectAnnotation = (index) => {
		setNewAnnotation(null);
		setSelectedAnnotationIndex(index);
	};

	return (
		<ViewportConstraint minSize={{width: 600, height: 400}}>
			{isSettingsOpen ? (
					<SettingsForm
						setIsSettingsOpen={setIsSettingsOpen} annotationsTable={annotationsTable} isSettings={true}
					/>
				) :
				(<Box
					width={'100%'} display='flex'
					style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0}}
				>
					{annotationsTableId &&
					<Box
						width={'70%'} height={'100%'} display={"flex"} flexDirection={"column"}
						justifyContent={"stretch"}
					>
						<ImageFromRecord
							activeTable={activeTable} selectedRecordId={selectedRecordId}
							selectedFieldId={selectedFieldId}
							newAnnotation={newAnnotation}
							selectedAnnotation={annotations[selectedAnnotationIndex]}
							addAnnotation={handleAnnotationAdding}
							handleAnnotationSubmit={handleAnnotationSubmit}
							handleAnnotationFormChange={handleAnnotationFormChange}
							viewportSize={viewportSize}
						/>
					</Box>}
					<Box
						as={'aside'} width={annotationsTableId ? '30%' : '100%'}
						display={annotationsTableId ? 'block' : 'flex'}
						justifyContent={annotationsTableId ? 'flex-start' : 'center'}
						alignItems={annotationsTableId ? 'stretch' : 'center'} height={'100%'}
					>
						{!annotationsTableId && <SettingsForm
							setIsSettingsOpen={setIsSettingsOpen} annotationsTable={annotationsTable} isSettings={false}
						/>}
						{annotationsTableId && <Box backgroundColor={'#f3f3f3'} flexGrow={1} height={'100%'} display={'flex'}
							flexDirection={'column'}
						>
							<Box paddingTop={3} paddingBottom={3} marginLeft={3} marginRight={3} borderBottom={'thick'}>
								<Heading size={'xsmall'} >Annotations</Heading>
							</Box>
							<Box paddingLeft={3} paddingRight={3} flexGrow={1} overflowY={'auto'}>
								<AnnotationsList
									editAnnotation={editAnnotation} deleteAnnotation={deleteAnnotation}
									selectAnnotation={selectAnnotation}
									selectedAnnotationIndex={selectedAnnotationIndex}
									annotations={annotations}
								/>
							</Box>
						</Box>}
					</Box>
				</Box>)}
		</ViewportConstraint>
	)
}


initializeBlock(() => <ImageAnnotationsBlock/>);
