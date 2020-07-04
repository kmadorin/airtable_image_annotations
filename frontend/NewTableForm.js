import React, {useState} from 'react';
import {Input, Box, TextButton, FormField, Button, useBase, Text, useGlobalConfig} from "@airtable/blocks/ui";
import {FieldType} from "@airtable/blocks/models";

const NewTableForm = () => {
	const [isActive, setIsActive] = useState(false);
	const [newTableName, setNewTableName] = useState("");
	const [formErrorText, setFormErrorText] = useState("");
	const [isTableNameValid, setIsTableNameValid] = useState(true);

	const base = useBase();
	const tables = base.tables.map(table => table.name);
	const globalConfig = useGlobalConfig();

	const createAnnotationsTable = async (name) => {

		const fields = [
			{name: 'Name', type: FieldType.SINGLE_LINE_TEXT},
			{name: 'Text', type: FieldType.SINGLE_LINE_TEXT},
			{name: 'Author', type: FieldType.SINGLE_LINE_TEXT},
			{name: 'Image', type: FieldType.SINGLE_LINE_TEXT},
			{name: 'Position', type: FieldType.SINGLE_LINE_TEXT},
		];

		if (base.unstable_hasPermissionToCreateTable(name, fields)) {
			return await base.unstable_createTableAsync(name, fields);
		} else {
			return null;
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!isTableNameValid) {
			return;
		}

		const createdTable = await createAnnotationsTable(newTableName);

		if (!createdTable) {
			return;
		}

		setNewTableName('');
		setIsActive(false);

		await globalConfig.setAsync('annotationsTableId', createdTable.id);
	};

	const handleChange = (e) => {
		const newName = e.target.value;

		setNewTableName(newName);

		if (tables.includes(newName)) {
			setIsTableNameValid(false);
			setFormErrorText('Table with this name already exists');
		}

		if (newName.trim() === '') {
			setIsTableNameValid(false);
			setFormErrorText('Select a name for the table');
		}

		!isTableNameValid && setIsTableNameValid(true);
	};

	return (<Box>
			{isActive && <form onSubmit={handleSubmit}>
				<FormField label="New table name:" display={'flex'} marginBottom={2} textAlign={'left'}>
					{!isTableNameValid && <Text textColor={'red'}>{formErrorText}</Text>}
					<Input value={newTableName} onChange={handleChange}/>
				</FormField>
				<Button type="submit" variant="primary" width={'100%'}>Create</Button>
			</form>}
			{!isActive &&
			<TextButton display={'inline-block'} onClick={() => setIsActive(true)}>Create a new table</TextButton>}
		</Box>
	)
};

export default NewTableForm;