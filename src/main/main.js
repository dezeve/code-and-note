const electron = require("electron")
const url = require("url")
const fs = require("fs")

const path = require("path")

const { app, BrowserWindow, Menu, ipcMain, dialog } = electron

const isDarwin = process.platform === "darwin"

let isFileExists = false
let existingFilePath

let mainWindow

app.on("ready", () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })

    mainWindow.setMinimumSize(500, 300)

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "../pages/index.html"),
            protocol: "file:",
            slashes: true
        })
    )

    const mainMenu = electron.Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainMenu)

    ipcMain.on("key: saveFile", (e, content) => {
        if (!isFileExists) {
            dialog.showSaveDialog({
                title: "Save File",
                filters: getFilters()
            }).then((result) => {
                if (!result.canceled) {
                    const fileExtension = path.extname(result.filePath)

                    handleFileExtension(fileExtension)

                    fs.writeFileSync(result.filePath, content)
                    existingFilePath = result.filePath
                    isFileExists = true
                }
            })
        } else {
            fs.writeFileSync(existingFilePath, content)
        }
    })

    ipcMain.on("key: showFileExtensionNotFound", () => {
        dialog.showErrorBox("File Extension Not Found", "The program could not recognize the file extension and will run in plain text mode.")
    })

    mainWindow.on("close", () => {
        app.quit()
    })
})

const mainMenuTemplate = [
    ...(isDarwin
        ? [{
            label: app.name,
            submenu: [
                { role: 'quit' }
            ]
        }]
        :
        []),
    {
        label: "File",
        submenu: [
            {
                label: "New",
                accelerator: isDarwin ? "Cmd+N" : "Ctrl+N",
                click() {
                    openNewFile()
                }
            },
            {
                label: "Open",
                accelerator: isDarwin ? "Cmd+O" : "Ctrl+O",
                click() {
                    openFile()
                }
            },
            {
                label: "Save",
                accelerator: isDarwin ? "Cmd+S" : "Ctrl+S",
                click() {
                    mainWindow.webContents.send("key: saveFile")
                }
            },
            {
                label: "Close",
                click() {
                    mainWindow.webContents.send("key: closeFile")
                    mainWindow.webContents.send("key: setTextMode")

                    isFileExists = false
                },
                accelerator: isDarwin ? "Cmd+W" : "Ctrl+W"
            },
            ...(isDarwin
                ? []
                :
                [{
                    label: "Exit",
                    accelerator: isDarwin ? "Cmd+Q" : "Ctrl+Q",
                    role: "quit"
                }]
            )
        ]
    },
    {
        label: "Edit",
        submenu: [
            {
                label: "Find",
                click() {
                    mainWindow.webContents.send("key: find")
                },
                accelerator: isDarwin ? "Cmd+F" : "Ctrl+F"
            },
            {
                label: "Go to Selected Line",
                click() {
                    mainWindow.webContents.send("key: gotoLine")
                },
                accelerator: isDarwin ? "Cmd+L" : "Ctrl+L"
            },
            {
                label: "Select All",
                click() {
                    mainWindow.webContents.send("key: selectAll")
                },
                accelerator: isDarwin ? "Cmd+A" : "Ctrl+A"
            },
            {
                label: "Undo",
                click() {
                    mainWindow.webContents.send("key: undo")
                },
                accelerator: isDarwin ? "Cmd+Z" : "Ctrl+Z"
            },
            {
                label: "Redo",
                click() {
                    mainWindow.webContents.send("key: redo")
                },
                accelerator: isDarwin ? "Cmd+Y" : "Ctrl+Y"
            },
            {
                label: "Remove Line",
                click() {
                    mainWindow.webContents.send("key: removeLine")
                },
                accelerator: isDarwin ? "Cmd+D" : "Ctrl+D"
            },
            {
                label: "Toggle Comment",
                click() {
                    mainWindow.webContents.send("key: toggleComment")
                }
            }
        ]
    },
    {
        label: "Settings",
        submenu: [
            {
                label: "Open Settings",
                click() {
                    mainWindow.webContents.send("key: openSettings")
                },
                accelerator: isDarwin ? "Cmd+," : "Ctrl+,"
            }
        ]
    },
    {
        label: "Dev",
        submenu: [
            {
                label: "Dev Tools",
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools()
                },
                accelerator: isDarwin ? "Cmd+E" : "Ctrl+E"
            },
            {
                label: "Reload",
                accelerator: isDarwin ? "Cmd+R" : "Ctrl+R",
                role: "reload"
            }
        ]
    }
]

function openNewFile() {
    dialog.showSaveDialog({
        title: "New File",
        filters: getFilters()
    }).then(result => {
        if (!result.canceled) {
            const filePath = result.filePath
            fs.writeFileSync(filePath, "")

            const fileExtension = path.extname(result.filePath)

            handleFileExtension(fileExtension)

            isFileExists = true
            existingFilePath = result.filePath
        }
    })
}

function openFile() {
    dialog.showOpenDialog({
        title: "Open File"
    }).then((result) => {
        if (result.canceled != true) {
            const fileExtension = path.extname(result.filePaths[0]).toString()

            handleFileExtension(fileExtension)

            const openedFileContent = fs.readFileSync(result.filePaths[0]).toString()
            mainWindow.webContents.send("key: openFile", openedFileContent)

            isFileExists = true
            existingFilePath = result.filePaths[0].toString()
        }
    })
}

function handleFileExtension(fileExtension) {
    mainWindow.webContents.send("key: setMode", fileExtension)
}

function getFilters() {
    filters = [
        { name: "All Files", extensions: ["*"] }
    ]

    return filters
}
