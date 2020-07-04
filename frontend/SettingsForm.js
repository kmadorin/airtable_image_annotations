import PropTypes from 'prop-types';
import React, {useState} from 'react';

import {
	Box,
	TablePicker, Text,
	useGlobalConfig,
	Button,
} from '@airtable/blocks/ui';

import NewTableForm from "./NewTableForm";

const SettingsForm = ({setIsSettingsOpen, annotationsTable, isSettings}) => {
	const globalConfig = useGlobalConfig();
	const [canBeAnnotationsTable, setCanBeAnnotationsTable] = useState(true);
	const [isValid, setIsValid] = useState(true);

	return (
		<Box
			position="absolute"
			top={0}
			bottom={0}
			left={0}
			right={0}
			display="flex"
			justifyContent={'center'}
			alignItems={'center'}
		>
			<Box>
				<Text marginBottom={1}>Select a table for annotations:</Text>
				{!canBeAnnotationsTable &&
				<Text textColor={'red'}>Image, Text, Author, Position fields are required for the annotation
					table</Text>}
				<TablePicker
					table={annotationsTable}
					onChange={newTable => {
						const fields = newTable.fields.map(field => field.name);
						const requiredFields = ['Image', 'Text', 'Author', 'Position'];
						const canBe = requiredFields.reduce((acc, field) => {
							return acc && fields.includes(field);
						}, true);
						setIsValid(canBe);
						!canBe && globalConfig.setAsync('annotationsTableId', null);
						canBe && globalConfig.setAsync('annotationsTableId', newTable.id);
						setCanBeAnnotationsTable(canBe);
					}}
				/>
				{!isSettings && <Box textAlign={'center'}>
					<Text marginTop={2} marginBottom={2}>or</Text>
					<NewTableForm />
				</Box>}
				{isSettings && <Box display="flex" justifyContent={"center"} marginTop={'10px'}>
					<Button
						disabled={!isValid}
						size="large"
						variant="primary"
						onClick={() => setIsSettingsOpen(false)}
					>
						Done
					</Button>
				</Box>}
			</Box>
		</Box>
	)
};

SettingsForm.propTypes = {
	setIsSettingsOpen: PropTypes.func.isRequired,
};

export default SettingsForm;