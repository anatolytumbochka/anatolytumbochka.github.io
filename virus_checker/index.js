const fs = require("fs");
const path = require("path");

const body_parser = require("body-parser");
const multer = require("multer");
const express = require("express");

const app = express();

app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use(express.static("public"));

const storage = multer.diskStorage({
    destination: function (request, file, callback) {
        callback(null, "./uploads/");
    },
    filename: function (request, file, callback) {
        console.log(file);
        callback(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/script.js", (req, res) => {
    res.sendFile(path.join(__dirname, "script.js"));
});

app.get("/style.css", (req, res) => {
    res.sendFile(path.join(__dirname, "style.css"));
});

let last_folder = "";

if (!fs.existsSync(path.join(__dirname, "last_folder.json"))) {
    fs.writeFileSync("last_folder.json", JSON.stringify({data: last_folder}));
}

app.post("/send_file", upload.array("avatar"), (req, res, next) => {
    console.log(req.body.folder_name);

    if (!req.body.folder_name.trim().length) {
        const date = String(Date.now());

        fs.mkdirSync(path.join(__dirname, "uploads", date));

        for (let i = 0; i < req.files.length; i++) {
            const name = req.files[i].originalname;

            if (name.slice(name.length - 3, name.length) == "txt") {
                fs.renameSync(path.join(__dirname, "uploads", name), path.join(__dirname, "uploads", date, name));
            } else {
                const txt_format = name.slice(0, name.length - 5) + "txt";

                fs.renameSync(path.join(__dirname, "uploads", name), path.join(__dirname, "uploads", date, txt_format));
            }
        }
    } else {
        fs.mkdirSync(path.join(__dirname, "uploads", req.body.folder_name));

        for (let i = 0; i < req.files.length; i++) {
            const name = req.files[i].originalname;

            if (name.slice(name.length - 3, name.length) == "txt") {
                fs.renameSync(path.join(__dirname, "uploads", name), path.join(__dirname, "uploads", req.body.folder_name, name));
            } else {
                const txt_format = name.slice(0, name.length - 5) + "txt";

                fs.renameSync(path.join(__dirname, "uploads", name), path.join(__dirname, "uploads", req.body.folder_name, txt_format));
            }
        }
    }
});

app.get("/getFiles", (req, res) => {
    const files = fs.readdirSync(path.join(__dirname, "uploads"));

    res.send(JSON.stringify({data: files}));
});

app.post("/reportFilename", (req, res) => {
    const files = fs.readdirSync(path.join(__dirname, "uploads", req.body.data));

    let one = "";
    let two = "";
    let genome = "";
    let genome_name = "";

    if (
        fs.statSync(path.join(__dirname, "uploads", req.body.data, files[0])).size > fs.statSync(path.join(__dirname, "uploads", req.body.data, files[1])).size
        && fs.statSync(path.join(__dirname, "uploads", req.body.data, files[0])).size > fs.statSync(path.join(__dirname, "uploads", req.body.data, files[2])).size
    ) {
        genome_name = files[0];
        viruses_name = [files[1], files[2]];

        genome = fs.readFileSync(path.join(__dirname, "uploads", req.body.data, files[0])).toString();
        one = fs.readFileSync(path.join(__dirname, "uploads", req.body.data, files[1])).toString();
        two = fs.readFileSync(path.join(__dirname, "uploads", req.body.data, files[2])).toString();
    }

    if (
        fs.statSync(path.join(__dirname, "uploads", req.body.data, files[1])).size > fs.statSync(path.join(__dirname, "uploads", req.body.data, files[0])).size
        && fs.statSync(path.join(__dirname, "uploads", req.body.data, files[1])).size > fs.statSync(path.join(__dirname, "uploads", req.body.data, files[2])).size
    ) {
        genome_name = files[1];
        viruses_name = [files[0], files[2]];

        genome = fs.readFileSync(path.join(__dirname, "uploads", req.body.data, files[1])).toString();
        one = fs.readFileSync(path.join(__dirname, "uploads", req.body.data, files[0])).toString();
        two = fs.readFileSync(path.join(__dirname, "uploads", req.body.data, files[2])).toString();
    }

    if (
        fs.statSync(path.join(__dirname, "uploads", req.body.data, files[2])).size > fs.statSync(path.join(__dirname, "uploads", req.body.data, files[1])).size
        && fs.statSync(path.join(__dirname, "uploads", req.body.data, files[2])).size > fs.statSync(path.join(__dirname, "uploads", req.body.data, files[0])).size
    ) {
        genome_name = files[2];
        viruses_name = [files[0], files[1]];

        genome = fs.readFileSync(path.join(__dirname, "uploads", req.body.data, files[2])).toString();
        one = fs.readFileSync(path.join(__dirname, "uploads", req.body.data, files[0])).toString();
        two = fs.readFileSync(path.join(__dirname, "uploads", req.body.data, files[1])).toString();
    }

    const cut_text = (text) => {
        if (text.indexOf("cds") != -1) {
            return text.slice(text.indexOf("cds") + 4, one.length);
        } else {
            return text.slice(text.indexOf("sequence") + 9, one.length);
        }
    }

    one = cut_text(one);
    two = cut_text(two);

    console.log(two);

    const most_common = (a, b) => {
        const old_a = a;
        const old_b = b;

        const A = a.split('');
        const B = b.split('');

        const min = {
          diff: A.length + B.length,
          index: -A.length,
          start: undefined,
          finish: undefined,
        };
      
        for (let offset = -A.length; offset < B.length; offset++) {
          let diff = Math.max(0, -offset) + Math.max(offset + A.length - B.length, 0);

          const start = Math.min(Math.max(0, offset), B.length);
          const finish = Math.min(Math.max(0, offset + A.length), B.length);

          let matchStart;
          let matchFinish;

          for (let i = start, isMatchStarted = false; i < finish; i++) {
            if (B[i] !== A[i - offset]) {
                diff++;
            } else {
              if (!isMatchStarted) {
                matchStart = i;
                isMatchStarted = true;
              } else {
                matchFinish = i;
              }
            }
          }
      
          if (diff < min.diff) {
            min.diff = diff;
            min.index = offset;
            min.start = matchStart;
            min.finish = matchFinish;
          }
        }

        min.names = viruses_name;

        if (min.index < 0) {
            min.part = old_a.slice(0, -1 * min.index);
            min.cut_file_name = files[0];

            return [old_a.slice(-1 * min.index, old_a.length), old_b, min];
        } else {
            min.part = old_a.slice(0, min.index);
            min.cut_file_name = files[1];

            return [old_b.slice(min.index, old_b.length), old_a, min];
        }
    }

    if (most_common(one, two)[0][0] != most_common(one, two)[1][0]) {
        res.send(JSON.stringify({data: ""}));
    } else {
        let short_res = most_common(one, two)[0];

        const genome_parts = [];

        for (let i = 0; i < Math.floor(genome.length / short_res.length); i++) {
            genome_parts.push(genome.slice(i * short_res.length, i * short_res.length + short_res.length));
        }

        let max1 = 0;
        let max2 = 0;

        for (let k = 0; k < genome_parts.length; k++) {
            let matches = 0;

            for (let i = 0; i < genome_parts[k].length; i++) {
                if (short_res[i] != genome_parts[k][i] && genome_parts[k][i] != "N") {
                    matches++;
                }
            }

            if (matches > max1) {
                max1 = matches;
                max2 = genome_parts[k];
            }
        }

        const text = `
        Папка для сравнения: ${req.body.data}\n
        Работа с вирусами: ${most_common(one, two)[2].names[0]} и ${most_common(one, two)[2].names[1]}\n
        Обрезан вирус: ${most_common(one, two)[2].cut_file_name}\n
        Обрезанная часть: ${most_common(one, two)[2].part}\n
        Максимально непохожая часть обрезанного вируса с геномом ${genome_name}: ${max2}\n
        Количество несовпадений максимально непохожей части вируса с геномом: ${max1}
        `;

        fs.writeFileSync(path.join(__dirname, "public", "result.txt"), text);

        res.send(JSON.stringify({data: [most_common(one, two)[0], most_common(one, two)[1], most_common(one, two)[2]]}));
    }
});

app.listen(3000, () => console.log("Server is running on port", 3000));