import {cursor, base} from '@airtable/blocks';
import {FieldType} from '@airtable/blocks/models';
import {initializeBlock, useLoadable, useWatchable, useRecordById, useBase} from '@airtable/blocks/ui';
import React, {useState} from 'react';
import Index from "./Annotation";

function HelloWorldBlock() {
	const [selectedRecordId, setSelectedRecordId] = useState(null);
	const [selectedFieldId, setSelectedFieldId] = useState(null);

	const annotations = [
		{
			position: {x: '1px', y: '1px'},
			comments: [
				{
					author: 'author',
					text: 'text'
				}
			]
		}
	];

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
	// scenario: User selects a record that contains a preview url. The preview appears.
	// User switches to a different table. The preview disappears. The user
	// switches back to the original table. Weirdly, the previously viewed preview
	// reappears, even though no record is selected.
	useWatchable(cursor, ['activeTableId', 'activeViewId'], () => {
		setSelectedRecordId(null);
		setSelectedFieldId(null);
	});

	const base = useBase();
	const activeTable = base.getTableByIdIfExists(cursor.activeTableId);

	if (!activeTable) {
		return null;
	}

	return (<ImageFromRecord
		activeTable={activeTable} selectedRecordId={selectedRecordId} selectedFieldId={selectedFieldId}
	>
		{annotations.map((annotation, idx) => {
			return <Index key={idx} annotation={annotation} />
		})}
	</ImageFromRecord>)
};

function ImageFromRecord(
	{
		activeTable,
		selectedRecordId,
		selectedFieldId,
		...props
	}) {

	const selectedField = selectedFieldId ? activeTable.getFieldByIdIfExists(selectedFieldId) : null;
	const selectedRecord = useRecordById(activeTable, selectedRecordId ? selectedRecordId : '', {
		fields: [selectedField],
	});

	if (selectedField === null || selectedRecord === null) {
		return null;
	}

	if (selectedField.type !== FieldType.MULTIPLE_ATTACHMENTS) {
		return <div>This field doesn't contain attachments</div>
	}

	const cellValue = selectedRecord.getCellValue(selectedField);

	if (!cellValue || !cellValue[0].url) {
		return <div>This field doesn't contain images</div>
	}

	return <div style={{position: 'relative'}}>
		<img src={cellValue[0].url} alt="image" style={{width: '100%', display:'inline-block'}}/>
		{props.children}
	</div>
}


initializeBlock(() => <HelloWorldBlock/>);
