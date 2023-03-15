import { useContext, useEffect } from "react";

import { StateContext } from "../utils/StateContext";

import Draggable from "react-draggable";
import styled from "styled-components";
import { SplitProp } from "./Styles/editorStyles";

interface SplitProps {
    splitting: boolean;
    splitClip: (p: number) => void;
}

const SplitView = styled.div`
	position: absolute;
	display: ${(props: SplitProp) => props.splitting ? 'flex' : 'none'};
	width: 100%;
	height: 100%;
`;

const SplitLine = styled.span`
	height: 100%;
	border-left: 2px dotted rgba(75, 126, 201, 0.8);
	z-index: 9;
	:hover {cursor: col-resize;}
`;

export default function Split({splitting, splitClip}: SplitProps) {

	const state = useContext(StateContext);

    const mousemove = (event: globalThis.MouseEvent): void => {
        let splitView = document.getElementById("split_view") as HTMLDivElement;
		let splitLine = document.getElementById("split_line") as HTMLSpanElement;

        if (event.currentTarget) {
            let box = splitView.getBoundingClientRect();
            let offsetX = event.clientX - box.left;
            splitLine.style.transform = `translate(${offsetX}px, 0px)`;
        }
    };

    const mouseup = (event: globalThis.MouseEvent): void => {
        let splitView = document.getElementById("split_view") as HTMLDivElement;
        event.stopPropagation();
        let box = splitView.getBoundingClientRect();
        splitClip(event.clientX - box.left);
    };

	useEffect(() => {
        let splitView = document.getElementById("split_view") as HTMLDivElement;
        
		splitView.addEventListener("mousemove", mousemove);
		splitView.addEventListener("mouseup", mouseup);

		return () => {
			splitView.removeEventListener("mousemove", mousemove);
			splitView.removeEventListener("mouseup", mouseup);
		}
        // @ts-ignore
	}, [state.selectedRecording, splitting])

	return (
		<SplitView key="split_elem" id="split_view" splitting={splitting}>
			<Draggable bounds={"#split_view"}>
				<SplitLine id="split_line"></SplitLine>
			</Draggable>
		</SplitView>
	);
}