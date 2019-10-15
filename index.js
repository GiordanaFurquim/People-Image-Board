const express = require("express");
const app = express();
const db = require("./utils/db");
const s3 = require("./s3");
const config = require("./config");

/// file upload boilerplate ///

const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },

    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

/// file upload boilerplate ///

app.use(express.static("public"));
app.use(express.json());

/// get images ///

app.get("/images", (req, res) => {
    db.getImages().then(data => {
        console.log("MY DATA:", data);
        res.json(data.rows);
    });
});

/// image modal ///

app.get("/image/:id", (req, res) => {
    db.getSingleImage(req.params.id)
        .then(data => {
            console.log("data from /image/:id:", data);
            res.json(data);
        })
        .catch(error => {
            console.log("ERROR IN /image/:id", error);
        });
});

/// get more images ///

app.get("/more/:lowestId", (req, res) => {
    db.getMoreImages(req.params.lowestId)
        .then(data => {
            console.log("data from more images:", data);
            res.json(data);
        })
        .catch(error => {
            console.log("ERROR IN /more:", error);
        });
});

///  comments ///

app.post("/comments/:id", (req, res) => {
    console.log("ADD COMMENTS REQ.BODY:", req.body);
    db.addComments(req.body.comment, req.body.username, req.params.id)
        .then(data => {
            console.log("MY DATA FROM addComments:", data);
            res.json(data.rows);
        })
        .catch(error => {
            console.log("ERROR IN /comments/:id", error);
        });
});

app.get("/comments/:id", (req, res) => {
    db.showComments(req.params.id).then(data => {
        console.log("DATA:", data);
        res.json(data);
    });
});

/// uploader ///

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    const { filename } = req.file;
    const url = config.s3Url + filename;
    const { title, username, description } = req.body;

    if (req.file) {
        console.log();
        db.insertFile(title, username, description, url)
            .then(data => {
                console.log("MY DATA:", data);
                res.json(data);
            })
            .catch(error => {
                console.log("ERROR UPLOADING:", error);
            });
    } else {
        res.json({
            success: false
        });
    }
});

/// server ///

app.listen(8080, () => console.log("peace to all wombats!"));
