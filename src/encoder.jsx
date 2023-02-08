import { useEffect } from "react";

/* global Mp3LameEncoder */

function Mp3Encoder() {
    useEffect(() => {
        const mp3Encoder = new Mp3LameEncoder();
    }, [])
    return [];
}

export default Mp3Encoder;