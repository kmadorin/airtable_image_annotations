import React, {useState} from 'react';
import {Input, Button, Box, loadCSSFromString} from "@airtable/blocks/ui";

const styles = `
.color-picker, .shape-picker {
    display: flex;
    align-items: center;
}

.color-picker__color {
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: inline-block;
    position: relative;
    cursor: pointer;
    margin: 0 6px;
    cursor: pointer;
}

.shape-picker__shape {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid transparent;
    color: #fff;
    background-color: #49d7da;
    margin: 0 10px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.shape-picker__shape--selected {
	border: 2px solid #2d7ff9;
}

.color-picker__color input,
.shape-picker__shape input{
    display: none;
}

.color-picker__color:hover::after {
    transform: scale(1);
}

.color-picker__color::after {
    content: '';
    display: inline-block;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    transform: scale(0);
    border-radius: 50%;
    opacity: .4;
    transition: all .3s cubic-bezier(.23, 1, .32, 1);
}

.color-picker__color::before {
    content: '';
    display: inline-block;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0);
    border-radius: 50%;
    width: 12px;
    height: 12px;
    transition: all .3s cubic-bezier(.23, 1, .32, 1);
    z-index: 1;
}

.color-picker__color--blue::before,
.color-picker__color--blue::after {
    background-color: rgb(52, 163, 219);
}

.color-picker__color--green::before,
.color-picker__color--green::after {
    background-color: rgb(26, 188, 161);
}

.color-picker__color--orange::before,
.color-picker__color--orange::after {
    background-color: rgb(230, 116, 34);
}

.color-picker__color--red::before,
.color-picker__color--red::after {
    background-color: rgb(231, 74, 60);;
}

.color-picker__color--selected::after {
    transform: none;
    opacity: 1;
}

.color-picker__color--selected::before {
    background-color: rgba(0,0,0,.25);
    width: 10px;
    height: 10px;
}

.color-picker__color--selected:hover {
    transform: none;
}
`;

loadCSSFromString(styles);

const AnnotationForm = ({onSubmit, onChange, onMarkerColorChange, onMarkerShapeChange}) => {
	const [value, setValue] = useState("");
	const [markerColor, setMarkerColor] = useState('blue');
	const [markerShape, setMarkerShape] = useState('circle');

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(value);
		setValue('');
	};

	const handleChange = (e) => {
		onChange(e.target.value);
		setValue(e.target.value);
	};

	const getColorButtonClassName = (color) => {
		const selectedClass = color === markerColor ? ' color-picker__color--selected': '';
		return `color-picker__color color-picker__color--${color}${selectedClass}`
	};

	const getShapeButtonClassName = (shape) => {
		const selectedClass = shape === markerShape ? ' shape-picker__shape--selected': '';
		return `shape-picker__shape shape-picker__shape--${shape}${selectedClass}`
	};

	const handleColorButtonChange = (e) => {
		setMarkerColor(e.target.value);
		onMarkerColorChange(e.target.dataset.rgb);
	};

	const handleShapeButtonChange = (e) => {
		setMarkerShape(e.target.value);
		onMarkerShapeChange(e.target.value);
	};

	return (<form onSubmit={handleSubmit} style={{backgroundColor: '#f2f2f2'}}>
		<Box padding={2} borderTop={'thick'}>
			<Input value={value} onChange={handleChange} flexGrow={1} placeholder="Type your comment here..."/>
			<Box display={'flex'} justifyContent={"flex-end"} marginTop={2} alignItems='center'>
				<Box className='color-picker' marginRight={2}>
					<label htmlFor="color-blue" className={getColorButtonClassName('blue')}>
						<input type="radio" name='color' onChange={handleColorButtonChange} value='blue' data-rgb={'rgb(52, 163, 219)'} id={'color-blue'} checked={markerColor === 'blue'}/>
					</label>
					<label htmlFor="color-green" className={getColorButtonClassName('green')}>
						<input type="radio" name='color' onChange={handleColorButtonChange} value='green' data-rgb={'rgb(26, 188, 161)'} id={'color-green'} checked={markerColor === 'green'}/>
					</label>
					<label htmlFor="color-orange" className={getColorButtonClassName('orange')}>
						<input type="radio" name='color' onChange={handleColorButtonChange} value='orange' data-rgb={'rgb(230, 116, 34)'} id={'color-orange'} checked={markerColor === 'orange'}/>
					</label>
					<label htmlFor="color-red" className={getColorButtonClassName('red')}>
						<input type="radio" name='color' onChange={handleColorButtonChange} value='red' data-rgb={'rgb(231, 74, 60)'} id={'color-red'} checked={markerColor === 'red'}/>
					</label>
				</Box>
				<Box className='shape-picker' marginRight={2}>
					<label htmlFor="shape-circle" className={getShapeButtonClassName('circle')}>
						<img alt="circle" width={16} height={16} src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGNpcmNsZSBjeD0iOCIgY3k9IjgiIHI9IjYiIHN0cm9rZT0iI2ZmZiIgZmlsbD0ndHJhbnNwYXJlbnQnIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==" />
						<input type="radio" name='shape' onChange={handleShapeButtonChange} value='circle' id={'shape-circle'} checked={markerShape === 'circle'}/>
					</label>
					<label htmlFor="shape-rect" className={getShapeButtonClassName('rect')}>
						<img alt="rect" width={16} height={16} src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBzdHJva2U9IiNmZmYiIGZpbGw9J3RyYW5zcGFyZW50JyBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=" />
						<input type="radio" name='shape' onChange={handleShapeButtonChange} value='rect' id={'shape-rect'} checked={markerShape === 'rect'}/>
					</label>
				</Box>
				<Button type="submit" variant="primary">Send</Button>
			</Box>
		</Box>
	</form>)
};

export default AnnotationForm;