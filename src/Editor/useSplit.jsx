import { useRef } from "react";

import Draggable from "react-draggable";
import styled from "styled-components";

const SplitView = styled.div`
    position: absolute;
    display: ${props => props.splitting ? 'flex' : 'none'};
    width: 100%;
    height: 175px;
`;

const SplitLine = styled.span`
    width: 3px;
    height: 175px;
    background-color: rgba(75, 126, 201, 0.8);
    :hover {cursor: col-resize;}
`;

export default function useSplit(splitting, setSplitPoint) {
    
    const onStop = (data) => {
        setSplitPoint(data.x);
    };

    return [
        <SplitView id="split_view" splitting={splitting}>
            <Draggable 
                bounds={"#split_view"}
                onStop={(e, data) => onStop(data)}>
                <SplitLine></SplitLine>
            </Draggable>
        </SplitView>
    ];
}