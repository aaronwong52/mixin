export function useEditorWidth() {
    let editor = document.getElementById("editor");
    // @ts-ignore
    return editor.offsetWidth;
}