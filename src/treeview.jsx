import { useState, useEffect } from "react";
import styled from 'styled-components';

import Node from './node';

const TreeView = styled.div`
    width: 100vw;
    height: 30vh;
    background-color: #fcebca;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const NodeView = styled.div`
`;

function Tree(prop) {
    const [nodes, setNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [master, setMaster] = useState(0);

    useEffect(() => {
    }, []);

    return (
        <TreeView>
            <Node prop={prop.prop}></Node>
        </TreeView>
    )
}

export default Tree;