import React, {useState, useRef} from 'react';
import {CollaboratorToken, useBase, Button, Box, Input, Text} from "@airtable/blocks/ui";
import {session} from "@airtable/blocks";

const Annotation = ({annotation, index, isSelected, editAnnotation, deleteAnnotation, selectAnnotation}) => {
	const base = useBase();
	const author = base.getCollaboratorByIdIfExists(annotation.author);
	const currentUser = session.currentUser.id;

	const [isBeingEdited, setIsBeingEdited] = useState(false);
	const [value, setValue] = useState("");

	const annotationBox = useRef(null);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (value.trim() !== '') {
			editAnnotation(index, value);
			setIsBeingEdited(false);
			setValue('');
		}
	};

	const handleAnnotationClick = () => {
		!isSelected && selectAnnotation(index);
	};

	const handleButtonClick = (isBeingEdited = false, reset = false) => (e) => {
		e.stopPropagation();

		setIsBeingEdited(isBeingEdited);

		if (reset) {
			setValue('')
		}
	};

	const handleDeleteClick = (index) => (e) => {
		e.stopPropagation();
		deleteAnnotation(index);
	};

	const activeAnnotationStyle = {
		borderLeft: '2px solid red'
	};

	const annotationStyle = {
		borderLeft: '2px solid transparent'
	};

	return (
		<Box
			as={"article"} style={isSelected ? activeAnnotationStyle : annotationStyle} ref={annotationBox}
			padding={"10px"} onClick={handleAnnotationClick} borderTop={index !==0 ? "thick": 'none'}>
			<Box as={"header"} display={'flex'} alignItems={'center'} justifyContent={'space-between'} flexWrap={'wrap'}>
				{author && <CollaboratorToken collaborator={author}/>}
				<Text>{annotation.createdTimeFromNow}</Text>
			</Box>
			<Box marginTop={'10px'} marginBottom={'10px'}>{annotation.text}</Box>
			{isBeingEdited && <form onSubmit={handleSubmit}>
				<Input value={value} style={{backgroundColor:'#fff'}} onChange={e => setValue(e.target.value)} onClick={(e) => e.stopPropagation()}/>
				<Box display={"flex"} justifyContent={"flex-end"} marginTop={'10px'}>
					<Button
						type='reset' size={'small'} variant={"secondary"} onClick={handleButtonClick(false, true)}
					>
						Cancel
					</Button>
					<Button
						type='submit' size={'small'} variant={"primary"} style={{marginLeft: '10px'}}
						onClick={handleButtonClick(true)}
					>
						Save
					</Button>
				</Box>
			</form>}
			{(currentUser === annotation.author) && !isBeingEdited && <Box as="footer" justifyContent={"flex-end"} display={"flex"} marginTop={'10px'}>
				<Button size={'small'} variant={"primary"} onClick={handleButtonClick(true)} icon="edit">
					Edit
				</Button>
				<Button
					size={'small'} variant={"danger"} style={{marginLeft: '10px'}} onClick={handleDeleteClick(index)}
					icon="trash"
				>
					Delete
				</Button>
			</Box>}
		</Box>
	)
};

export default Annotation;