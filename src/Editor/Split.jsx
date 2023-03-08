import { useContext, useEffect, useRef } from "react";

import { StateContext } from "../utils/StateContext";

import Draggable from "react-draggable";
import styled from "styled-components";

const SplitView = styled.div`
	position: absolute;
	display: ${props => props.splitting ? 'flex' : 'none'};
	width: 100%;
	height: 100%;
`;

const SplitLine = styled.span`
	height: 100%;
	border-left: 2px dotted rgba(75, 126, 201, 0.8);
	z-index: 9;
	:hover {cursor: col-resize;}
`;

export default function Split({splitting, splitClip}) {

	const state = useContext(StateContext);

	useEffect(() => {
		let splitView = document.getElementById("split_view");
		let splitLine = document.getElementById("split_line");

		const mousemove = (event) => {
			let box = event.currentTarget.getBoundingClientRect();
			let offsetX = event.clientX - box.left;
			splitLine.style.transform = `translate(${offsetX}px, 0px)`;
		};

		const mouseup = (event) => {
            event.stopPropagation();
			let box = splitView.getBoundingClientRect();
			splitClip(event.clientX - box.left);
		};

		splitView.addEventListener("mousemove", mousemove);
		splitView.addEventListener("mouseup", mouseup);

		return () => {
			splitView.removeEventListener("mousemove", mousemove);
			splitView.removeEventListener("mouseup", mouseup);
		}
	}, [state.selectedRecording, splitting])

	return [
		<SplitView key="split_elem" id="split_view" splitting={splitting}>
			<Draggable bounds={"#split_view"}>
				<SplitLine id="split_line"></SplitLine>
			</Draggable>
		</SplitView>
	];
}