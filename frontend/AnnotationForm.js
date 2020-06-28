import React, {useState} from 'react';
import {Input, Button, Box} from "@airtable/blocks/ui";

const AnnotationForm = ({onSubmit, onChange}) => {
	const [value, setValue] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(value);
		setValue('');
	};

	const handleChange = (e) => {
		onChange(e.target.value);
		setValue(e.target.value);
	}

	return (<form onSubmit={handleSubmit} style={{textAlign:'right'}}>
		<Box display={'flex'} padding={3} borderTop={'thick'} >
			<Input value={value} onChange={handleChange} flexGrow={1} placeholder="Type your comment here..."/>
			<Button type="submit" variant="primary">Send</Button>
		</Box>
	</form>)
};

export default AnnotationForm;