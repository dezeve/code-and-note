const electron = require("electron")
const { ipcRenderer } = electron
const fs = require("fs")

ipcRenderer.on("key: openFile", (event, openedFileContent) => {
    editor.setValue(openedFileContent)
})

ipcRenderer.on("key: saveFile", () => {
    const content = editor.getValue()
    ipcRenderer.send("key: saveFile", content)
})

ipcRenderer.on("key: closeFile", () => {
    editor.setValue(null)
})

ipcRenderer.on("key: setJavaScriptMode", () => {
    editor.session.setMode("ace/mode/javascript")
})

ipcRenderer.on("key: setHTMLMode", () => {
    editor.session.setMode("ace/mode/html")
})

ipcRenderer.on("key: setPythonMode", () => {
    editor.session.setMode("ace/mode/python")
})

ipcRenderer.on("key: setCSSMode", () => {
    editor.session.setMode("ace/mode/css")
})

ipcRenderer.on("key: setPHPMode", () => {
    editor.session.setMode("ace/mode/php")
})

ipcRenderer.on("key: setJavaMode", () => {
    editor.session.setMode("ace/mode/java")
})

ipcRenderer.on("key: setJSONMode", () => {
    editor.session.setMode("ace/mode/json")
})

ipcRenderer.on("key: setTextMode", () => {
    editor.session.setMode("ace/mode/text")
})

ipcRenderer.on("key: updateEditorTheme", (event, selectedUpdateTheme) => {
    const settings = JSON.parse(fs.readFileSync("src/config/config.json"))
    settings.selectedTheme = selectedUpdateTheme
    const updatedSettings = JSON.stringify(settings, null, 2)
    fs.writeFileSync("src/config/config.json", updatedSettings)

    const theme = settings.theme[selectedUpdateTheme];
    editor.setTheme(theme)
})

ipcRenderer.on("key: updateEditorFontSize", (event, selectedFontSize) => {
    const settings = JSON.parse(fs.readFileSync("src/config/config.json"))
    settings.fontSize = selectedFontSize + "px"
    const updatedSettings = JSON.stringify(settings, null, 2)
    fs.writeFileSync("src/config/config.json", updatedSettings)

    const fontSize = settings.fontSize
    editor.setFontSize(fontSize)
})

ace.require("ace/ext/language_tools")

const editor = ace.edit("editor")

const fontSize = getFontSize()

const theme = getTheme()

editor.setTheme(theme)
editor.session.setMode("ace/mode/text")
editor.setFontSize(fontSize)

editor.setOptions({
    enableLiveAutocompletion: true
})

function getFontSize() {
    const fontSize = JSON.parse(fs.readFileSync("src/config/config.json")).fontSize
    return fontSize
}

function getTheme() {
    const settings = JSON.parse(fs.readFileSync("src/config/config.json"))
    selectedTheme = settings.selectedTheme
    return settings.theme[selectedTheme]
}

ipcRenderer.on("key: findAndReplace", (err, data) => {
    editor.find(data.find)
    editor.replaceAll(data.replace)
})

ipcRenderer.on("key: doGotoLine", (err, data) => {
    editor.gotoLine(data)
})
