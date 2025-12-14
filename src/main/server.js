import http from "http";
import express from "express";
import { Server } from "socket.io";
import SerialConnector from "./serial.js";
import multer from "multer";
import path from "path";
import {
    EDITOR_PATH,
    SOUNDS_PATH,
    deleteSounds,
    getArrayData,
    getSounds,
    isImporting,
    nativeProjectImport,
    nativeProjectSave,
    nativeSelectProject,
    nativeSetSavePath,
    renameSound,
    snppCreateStream,
    snppExtractStream,
    storeData,
    updateSounds,
} from "./fileUtils.js";
import cors from "cors";
import { executeSequence, play } from "./sequence.js";
import { confirmImport, playClip } from "./ipc.js";
import { randomUUID } from "crypto";
import { publishBonjour } from "./bonjour.js";
import { openedWithSnpp } from "./argvUtils.js";
import { shell } from "electron";

const app = express();
app.use(
    cors({
        origin: "*",
    })
);
app.use(express.static(EDITOR_PATH));
app.use(
    "/sounds",
    express.static(SOUNDS_PATH, {
        setHeaders: (res, path) => {
            res.attachment(path);
        },
    })
);

const storage = multer.diskStorage({
    destination: SOUNDS_PATH,
    filename: (req, file, cb) => {
        cb(null, Buffer.from(file.originalname, "latin1").toString("utf8"));
    },
});
const SOUND_EXTS = [".wav", ".mp3", ".ogg", ".webm", ".opus"];
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        cb(
            null,
            SOUND_EXTS.includes(path.extname(file.originalname).toLowerCase())
        );
    },
});

app.post("/sounds", upload.array("files", 5), (req, res) => {
    if (!req.files) return res.json({});
    res.json({
        uploaded: req.files.map((f) => f.originalname),
    });
    console.log(`UPLOADED ${req.files.length} FILES`);
    emitSoundsList();
});

app.get("/project", async (req, res) => {
    if (!req.query.id || !editorsId.includes(req.query.id))
        return res.status(403).send("Editor ID is invalid");

    res.setHeader("Content-Type", "application/x-tar");
    res.setHeader(
        "Content-Disposition",
        "attachment; filename=sonosphere.snpp"
    );

    console.log("SNPP Creating...");
    const stream = snppCreateStream();
    stream
        .pipe(res)
        .on("error", (err) => {
            console.error("SNPP CREATE ERROR: ", err);
            res.destroy("an error occurred while creating project file.");
            io.to(req.query.id).emit(
                "project-downloaded",
                "An error occurred."
            );
        })
        .on("finish", () => {
            console.log("SNPP Created");
            if (!io) return;
            io.to(req.query.id).emit("project-downloaded", null);
        });

    res.on("close", () => {
        console.log("Stream closed.");
        io.to(req.query.id).emit(
            "project-downloaded",
            "Creating project file is cancelled."
        );
        stream.destroy();
    });
});

const UPLOAD_CONFIRM_RESET_MS = 5 * 60 * 1000;
let uploadConfirmKey = null;
let uploadCancelTimeout = null;
function resetUploadConfirm() {
    uploadConfirmKey = null;
    clearTimeout(uploadCancelTimeout);
    uploadCancelTimeout = null;
}
app.post("/project", async (req, res) => {
    if (req.headers["confirm-key"] !== uploadConfirmKey)
        return res.status(403).send("Confirm key is invalid");

    console.log("SNPP file importing...");
    resetUploadConfirm();

    try {
        req.pipe(await snppExtractStream())
            .on("error", (error) => {
                console.log("Extract error: ", error);
                return res.status(500).send("Extract failed");
            })
            .on("finish", () => {
                console.log("SNPP file imported");
                return res.sendStatus(200);
            });
    } catch (err) {
        console.error("SNPP Import error: ", err);
        res.sendStatus(500);
    }
});

async function emitSoundsList() {
    const sounds = await updateSounds();
    io.in("editor").emit("sounds", sounds);
}

const server = http.createServer(app, (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
});
/** @type { Server | null } */
let io;

const NativeAuthKey = randomUUID();
export function getNativeAuthKey() {
    return NativeAuthKey;
}

function broadcastForAll(evtName) {
    if (io) io.emit("sonosphere", evtName);
    if (serial) serial.send(evtName);
}
export function advancedBroadcast(channel, objectStr) {
    if (!io) return;
    let data;
    try {
        data = JSON.parse(objectStr);
    } catch {
        data = objectStr;
    }
    io.emit(channel, data);
}
export function onImportStart() {
    if (!io) return;
    io.in("editor").emit("import-started");
}
export async function onImportEnded() {
    if (!io) return;
    io.in("editor").emit("import-ended", await makeEditorSetupData());
}

async function makeEditorSetupData() {
    return {
        editorCount: editorsId.length,
        sounds: await getSounds(),
        data: getArrayData(),
    };
}

const editorsId = [];
export function openSocketServer() {
    io = new Server(server, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
        console.log("New client connected");

        let isNative = false;
        socket.on("native-editor", (nativeAuthKeyReq) => {
            if (!isNative && nativeAuthKeyReq === NativeAuthKey) {
                isNative = true;
                socket.join("native");

                const openingProject = openedWithSnpp(process.argv);
                if (openingProject) confirmImport(openingProject);
            }
        });

        socket.on("import-file", (filepath) => {
            if (!isNative) return;
            nativeProjectImport(filepath);
        });
        socket.on("native-import-project", async () => {
            if (!isNative) return;

            const { canceled, filePaths } = await nativeSelectProject();
            if (canceled || !filePaths || !filePaths.length) return;
            nativeProjectImport(filePaths[0]);
        });
        socket.on("native-save-project", async () => {
            if (!isNative) return;

            const { canceled, filePath } = await nativeSetSavePath();
            if (canceled) return;
            socket.emit("local-save-started", filePath);
            await nativeProjectSave(filePath);
            socket.emit("local-save-ended", filePath);
            shell.showItemInFolder(filePath);
        });

        socket.on("editor", async (setupInfo) => {
            socket.join("editor");
            if (!editorsId.includes(socket.id)) editorsId.push(socket.id);
            if (isImporting()) setupInfo({ importing: true });
            else setupInfo(await makeEditorSetupData());
        });

        socket.on("request-editor-count", (response) =>
            response(editorsId.length)
        );

        socket.on("ready-to-upload", (response) => {
            if (isImporting()) {
                response({ importing: true });
                return;
            }
            if (uploadCancelTimeout) clearTimeout(uploadCancelTimeout);
            uploadConfirmKey = randomUUID();
            response({
                confirmKey: uploadConfirmKey,
                editorCount: editorsId.length,
                autoCancelMs: UPLOAD_CONFIRM_RESET_MS,
            });
            uploadCancelTimeout = setTimeout(() => {
                uploadConfirmKey = null;
                uploadCancelTimeout = null;
            }, UPLOAD_CONFIRM_RESET_MS);
        });

        socket.on("request-sounds", async (response) => {
            if (isImporting()) {
                done({ importing: true });
                return;
            }
            response({ sounds: await getSounds() });
        });

        socket.on("refresh-sounds", async (response) => {
            if (isImporting()) {
                response({ importing: true });
                return;
            }
            await emitSoundsList();
            response(null);
        });

        socket.on("rename-sound", (originalName, newName, done) => {
            if (isImporting()) {
                done({ importing: true });
                return;
            }
            renameSound(originalName, newName)
                .then(() => {
                    done(null);
                    emitSoundsList();
                })
                .catch((err) => done(err));
        });

        socket.on("delete-sounds", (sounds, done) => {
            if (isImporting()) {
                done({ importing: true });
                return;
            }
            deleteSounds(sounds)
                .then(() => {
                    done(null);
                    emitSoundsList();
                })
                .catch((err) => done(err));
        });

        socket.on("request-data", (response) => {
            if (isImporting()) {
                response({ importing: true });
                return;
            }
            response(getArrayData());
        });

        socket.on("update-data", (newData, done) => {
            if (isImporting()) {
                done({ importing: true });
                return;
            }
            storeData(newData)
                .then(() => done(null))
                .catch((err) => {
                    console.error(err);
                    done(err);
                });
        });

        socket.on("execute-sequence", ({ sequenceData = null }) => {
            executeSequence(sequenceData.works);
            console.log("Executing sequence data", sequenceData.works);
        });

        socket.on("play", (data) => {
            broadcastForAll(data);
            if (!play(data)) playClip(data, "clip", false);
        });

        socket.on("broadcast", (data) => {
            broadcastForAll(data);
        });

        function ctm(data) {
            let ctmData = typeof data === "string" ? data : (data.ctm ?? null);
            if (!ctmData) return;

            io.emit("sonosphere", ctmData);
            play(ctmData);
            if (!serial) return;
            serial.send(ctmData);
        }

        socket.on("CTM", ctm);
        socket.on("com-to-main", ctm);

        socket.on("disconnect", () => {
            const idx = editorsId.indexOf(socket.id);
            if (idx < 0) return;
            editorsId.splice(idx, 1);
        });
    });
}

const serial = new SerialConnector((data) => {
    play(data);
    if (io) {
        io.emit("sonosphere", data);
        io.emit(data.trim());
    }
    console.log("SERIAL SIGNAL: ", data);
});
serial.open();

export function listenAndOpen() {
    return new Promise((res) => {
        server.listen({ port: 3000 }, res);
        publishBonjour(3000);
    });
}
