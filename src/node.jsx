import { useState, useEffect } from "react";
import styled from 'styled-components';
import Draggable from "react-draggable";

/* 
    node types: audio (for now), instrument
    controls: volume, mute/solo
    add fx
*/

const NodeView = styled.div`
    width: 50px;
    height: 50px;
    border: 1px solid black;
    border-radius: 50px;
    margin: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    :hover {cursor: pointer;}
`;
function Node(prop) {

    const [content, setContent] = useState([]); // still have to define content object, with methods
    const [volume, setVolume] = useState(0);
    const [mute, setMute] = useState(false);
    const [solo, setSolo] = useState(false);

    useEffect(() => {
        
    }, []);

    return (
        <Draggable cancel=".nodeview">

            <NodeView className="nodeview" onClick={() => prop.prop(content)}>
                M S
            </NodeView>
        </Draggable>
        
    )
}

export default Node;