import { useState, useEffect } from "react";

export default function useKeyPress() {

    const [keyPressed, setKeyPressed] = useState('');
    const keys = ['Escape', 'Backspace']

    function downHandler({ key }) {
      let keyIndex = keys.findIndex((k) => {
        return k == key
      });
      if (keyIndex == -1) {
        return;
      }
      setKeyPressed(keys[keyIndex]);
    }

    function upHandler({ key }) {
      setKeyPressed('');
    }
   
    useEffect(() => {
      window.addEventListener("keydown", downHandler);
      window.addEventListener("keyup", upHandler);
      
      return () => {
        window.removeEventListener("keydown", downHandler);
        window.removeEventListener("keyup", upHandler);
      };
    }, []);

    return keyPressed;
}