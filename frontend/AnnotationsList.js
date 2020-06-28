import React from 'react';
import Annotation from "./Annotation";

const AnnotationsList = ({annotations, selectedAnnotationIndex, editAnnotation, deleteAnnotation, selectAnnotation}) => {
	return (
		<div>
			{annotations.sort((a,b) => {
				if (a.createdTime > b.createdTime) {
					return -1;
				}
				if (a.createdTime < b.createdTime) {
					return 1;
				}

				return 0;
			}).map((annotation, idx) => <Annotation
				key={idx} index={idx} annotation={annotation} isSelected={idx === selectedAnnotationIndex} editAnnotation={editAnnotation}
				deleteAnnotation={deleteAnnotation} selectAnnotation={selectAnnotation}
			/>)}
		</div>
	)
};

export default AnnotationsList;