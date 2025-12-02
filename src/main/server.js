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
    getData,
    getSounds,
    renameSound,
    storeData,
    updateSounds,
} from "./fileUtils.js";
import cors from "cors";
import { executeSequence, play } from "./sequence.js";

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

async function emitSoundsList() {
    const sounds = await updateSounds();
    io.in("editor").emit("sounds", sounds);
}

const server = http.createServer(app);
let io;

let editorCount = 0;
export function openSocketServer() {
    io = new Server(server, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
        console.log("New client connected");

        let isEditor = false;
        socket.on("editor", async (setupInfo) => {
            socket.join("editor");
            if (isEditor) return;
            editorCount++;
            setupInfo({
                editorCount,
                sounds: await getSounds(),
                data: getArrayData(),
            });
            isEditor = true;
        });

        socket.on("request-sounds", async (response) => {
            response(await getSounds());
        });

        socket.on("refresh-sounds", async (response) => {
            await emitSoundsList();
            response(true);
        });

        socket.on("rename-sound", (originalName, newName, done) => {
            renameSound(originalName, newName)
                .then(() => {
                    done(null);
                    emitSoundsList();
                })
                .catch((err) => done(err));
        });

        socket.on("delete-sounds", (sounds, done) => {
            deleteSounds(sounds)
                .then(() => {
                    done(null);
                    emitSoundsList();
                })
                .catch((err) => done(err));
        });

        socket.on("request-data", (response) => {
            response(getArrayData());
        });

        socket.on("update-data", (newData, done) => {
            storeData(newData)
                .then(() => done(null))
                .catch((err) => {
                    console.error(err);
                    done(err);
                });
        });

        socket.on("execute-sequence", ({ sequenceData = null }) => {
            executeSequence(sequenceData.works);
        });

        socket.on("play", (data) => {
            play(data);
        });

        function ctm(data) {
            let ctmData = typeof data === "string" ? data : (data.ctm ?? null);
            if (!ctmData) return;

            console.log("CTM SIGNAL: ", ctmData);

            io.emit("com-to-main", ctmData);
            play(ctmData);
            if (!serial) return;
            serial.send(ctmData);
        }

        socket.on("CTM", ctm);
        socket.on("com-to-main", ctm);

        socket.on("disconnect", () => {
            if (!isEditor) return;
            editorCount--;
            isEditor = false;
        });
    });
}

const serial = new SerialConnector((data) => {
    play(data);
    if (io) io.emit("main-to-com", data);
    console.log("SERIAL SIGNAL: ", data);
});
serial.open();

server.listen(3000);
