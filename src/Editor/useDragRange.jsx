import Draggable from "react-draggable";
import styled from 'styled-components';

import { useEffect, useRef } from "react";

const DragRangeView = styled.div`
    position: absolute;
    display: flex;
    width: 100%;
    height: 175px;
`;

const LeftPadding = styled.div`
`;

const RightPadding = styled(LeftPadding)`
    
`;

const HighlightArea = styled.div`
    flex-grow: 1;
    flex-shrink: 1;
    background-color: rgba(29, 75, 143, 0.5);
`;

const DragHandleLeft = styled.div`
    width: 2px;
    height: 175px;
    background-color: green;
    padding: 0px 1px;
    z-index: 100;
    :hover {cursor: pointer;}
`;

const DragHandleRight = styled(DragHandleLeft)`
`;

export default function useDragRange() {

    const dragStartLeft = useRef(-1);
    const dragStartRight = useRef(-1);
    const draggingRef = useRef(false);
  
    const onDragLeft = (e) => {
        if (dragStartLeft.current < 0) {
            // initial mouse position
            dragStartLeft.current = e.clientX; // desktop
        } else {
            let leftPadding = document.getElementById("range_left_padding");
            let delta = e.clientX - dragStartLeft.current;
            leftPadding.style.width = `${delta}px`;
        }
    
        if (e.type === 'mousemove' || e.type === 'touchmove') {
            draggingRef.current = true;
        }
    };

    const onDragRight = (e) => {
        if (dragStartRight.current < 0) {
            // initial mouse position
            dragStartRight.current = e.clientX; // desktop
        } else {
            let rightPadding = document.getElementById("range_right_padding");
            let delta = dragStartRight.current - e.clientX;
            rightPadding.style.width = `${delta}px`;
        }
       
        if (e.type === 'mousemove' || e.type === 'touchmove') {
            draggingRef.current = true;
        }
    };

    useEffect(() => {
        let leftPadding = document.getElementById("range_left_padding");
        let rightPadding = document.getElementById("range_right_padding");
        leftPadding.style.width = "0px";
        rightPadding.style.width = "0px";
    }, [])

    return [
        <DragRangeView id="drag_range_view">
            <Draggable bounds={"#drag_range_view"}
                onDrag={(e) => onDragLeft(e)}>
                <DragHandleLeft id="drag_handle_left"></DragHandleLeft>
            </Draggable>
            <LeftPadding id="range_left_padding"></LeftPadding>
            <HighlightArea id="drag_highlight"></HighlightArea>
            <Draggable axis="none" bounds={"#drag_range_view"}
                onDrag={(e) => onDragRight(e)}>
                <DragHandleRight id="drag_handle_right"></DragHandleRight>
            </Draggable>
            <RightPadding id="range_right_padding"></RightPadding>
        </DragRangeView>
    ]
}