import Draggable, { DraggableEvent } from "react-draggable";
import styled from 'styled-components';

import { useEffect, useRef } from "react";
import { CropProp } from "./Styles/editorStyles";

interface CropProps {
    cropping: boolean;
    setPoints: (t: string, d: number) => void;
}

const DragRangeView = styled.div`
	position: absolute;
	display: ${(props: CropProp) => props.cropping ? 'flex' : 'none'};
	width: 100%;
	height: 100%;
`;

const CropArea = styled.div`
	flex-grow: 1;
	flex-shrink: 1;
	background-color: rgba(29, 75, 143, 0.4);
`;

const DragHandleLeft = styled.div`
	width: 2px;
	height: 100%;
	background-color: rgba(69, 114, 181, 0.7);
	padding: 0px 1px;
	z-index: 100;
	:hover {cursor: col-resize;}
`;

const DragHandleRight = styled(DragHandleLeft)`
`;

export default function Crop({cropping, setPoints}: CropProps) {

	const dragStartLeft = useRef(-1);
	const dragStartRight = useRef(-1);
	const draggingRef = useRef(false);

	// stop handlers report distance from ends
	const onStopLeft = (e: MouseEvent): void => {
		let delta = e.clientX - dragStartLeft.current;
		setPoints('start', delta); // sent to editor for dispatch
	};

	const onStopRight = (e: MouseEvent): void => {
		let delta = dragStartRight.current - e.clientX; 
		setPoints('end', delta);
	};
  
	// sets offset of clip
	// increases width of left padding 
	const onDragLeft = (e: MouseEvent): void => {
		if (dragStartLeft.current < 0) {
			// initial mouse position
			dragStartLeft.current = e.clientX; // desktop
		} else {
            let leftPadding = document.getElementById("range_left_padding") as HTMLDivElement;
			let delta = e.clientX - dragStartLeft.current;
			leftPadding.style.width = `${delta}px`;
		}
	
		if (e.type === 'mousemove' || e.type === 'touchmove') {
			draggingRef.current = true;
		}
	};

	// sets duration of clip
	// increases width of right padding
	const onDragRight = (e: MouseEvent): void => {
		if (dragStartRight.current < 0) {
			// initial mouse position
			dragStartRight.current = e.clientX; // desktop
		} else {
            let rightPadding = document.getElementById("range_right_padding") as HTMLDivElement;
			let delta = dragStartRight.current - e.clientX;
			rightPadding.style.width = `${delta}px`;
		}
	   
		if (e.type === 'mousemove' || e.type === 'touchmove') {
			draggingRef.current = true;
		}
	};

	useEffect(() => {
		let leftPadding = document.getElementById("range_left_padding") as HTMLDivElement;
		let rightPadding = document.getElementById("range_right_padding") as HTMLDivElement;
		leftPadding.style.width = "0px";
		rightPadding.style.width = "0px";
	}, []);

	return (
		<DragRangeView key="cropElem" cropping={cropping} id="drag_range_view">
			<Draggable bounds={"#drag_range_view"}
				onStop={(e) => onStopLeft(e as MouseEvent)}
				onDrag={(e) => onDragLeft(e as MouseEvent)}>
				<DragHandleLeft id="drag_handle_left"></DragHandleLeft>
			</Draggable>
			<div id="range_left_padding"></div>
			<CropArea id="drag_highlight"></CropArea>
			<Draggable axis="none" bounds={"#drag_range_view"}
				onStop={(e) => onStopRight(e as MouseEvent)}
				onDrag={(e) => onDragRight(e as MouseEvent)}>
				<DragHandleRight id="drag_handle_right"></DragHandleRight>
			</Draggable>
			<div id="range_right_padding"></div>
		</DragRangeView>
    );
}