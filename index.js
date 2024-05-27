const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 5500;
const path = require("path");

app.use(cors());
app.use(bodyparser.json());

const { mkdir } = require("node:fs/promises");
const { join } = require("node:path");
const { readFile } = require("node:fs/promises");
const { resolve } = require("node:path");

const currentpath = join(__dirname, "\\logs");
const makeDirectory = async (DirName) => {
  const projectFolder = join(currentpath, DirName);
  const dirCreation = await mkdir(projectFolder, { recursive: true });
  console.log(dirCreation);
  return dirCreation;
};
// makeDirectory().catch(console.error);

// app.use((req, res, next) => {
//   console.log(`${req.method} request received for ${req.url}`);
//   next(); // Call next to pass control to the next middleware function
// });

const cheakDirectory = (DirName) => {
  const projectFolder = path.join(currentpath, DirName);
  if (fs.existsSync(projectFolder)) {
    return true;
  } else {
    return false;
  }
};

const cheakForTheMonth = (folders) => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const whole = `${month}-${year}`;
  const folderExists = folders.some((folder) => folder.name === whole);
  if (!folderExists) {
    makeDirectory(whole);
  }
};

// const cheakForTheFile = () => {
//   const currentDate = new Date();
//   const date = currentDate.getDate();
//   const year = currentDate.getFullYear();
//   const month = currentDate.getMonth() + 1;
//   const whole = `${date}-${month}-${year}`;
//   if (cheakDirectory(date)) {
//     return true;
//   } else {
//     return false;
//   }
// };

app.get("/logs/", async (req, res) => {
  const requestedPath = req.query.path || "";
  const currentDir = path.join(currentpath, requestedPath);
  fs.readdir(currentDir, { withFileTypes: true }, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Unable to scan directory" });
    }
    const folders = files.map((file) => ({
      name: file.name,
      isDirectory: file.isDirectory(),
      path: path.relative(currentpath, path.join(currentDir, file.name)),
    }));
    const currentDirName = path.basename(currentDir);
    console.log(currentDirName);
    const currentDate = new Date();
    const date = currentDate.getDate();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const whole = `${month}-${year}`;
    if (currentDirName === "logs") {
      console.log("cheaking in logfile");
      cheakForTheMonth(folders);
    } else {
      console.log("cheaking in inner file");
      if (currentDirName != whole) {
        const fileName = `${date}-${month}-${year}.log`;
        const filepath = path.join(currentDir, fileName);
        const data = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
        fs.appendFile(filepath, data, (err) => {
          if (err) {
            console.error("Error writing to log file:", err);
          }
        });
        const folderExists = folders.some((folder) => folder.name === fileName);
        if (!folderExists) {
          folders.push({
            name: fileName,
            isDirectory: false,
            path: path.relative(currentpath, path.join(currentDir, fileName)),
          });
        }

        console.log(folders);
      }
    }
    res.json({ folders });
  });
});

app.get("/file/", (req, res) => {
  const requestedPath = req.query.path || "";
  const currentDir = path.join(currentpath, requestedPath);

  res.sendFile(currentDir, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Error sending file");
    }
  });
});

app.listen(port, () => {
  console.log("LISTINING ON PORT", 5500);
});
