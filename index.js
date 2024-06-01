const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 5500;
const path = require("path");
const serveIndex = require("serve-index");
const host = "127.0.0.1";
app.use(cors());
app.use(bodyparser.json());

const { mkdir } = require("node:fs/promises");
const { join } = require("node:path");

const logsDirectory =
  "C:\\Users\\Parth\\Desktop\\FOLDER VIEWR ONLY BACKEND\\logs";

const currentpath = join(logsDirectory);

const makeDirectory = async (pathofdir) => {
  const dirCreation = await mkdir(pathofdir, { recursive: true });
};

const cheakDirectory = (DirName) => {
  const projectFolder = path.join(currentpath, DirName);
  if (fs.existsSync(projectFolder)) {
    return true;
  } else {
    return false;
  }
};

const cheakfolder = (reqpath, DirName) => {
  const projectFolder = path.join(reqpath, DirName);
  if (fs.existsSync(projectFolder)) {
    return true;
  } else {
    return false;
  }
};

const cheakForTheMonth = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const whole = `${month}-${year}`;
  const folderpath = join(currentpath, whole);
  if (!fs.existsSync(folderpath)) {
    makeDirectory(folderpath);
  }
  return folderpath;
};

app.use((req, res, next) => {
  const reqpath = req.url;
  const dirs = reqpath.split("/");
  console.log(req);
  if (dirs[1] == "logs") {
    console.log(dirs);
    if (dirs[dirs.length - 1].slice(-4) == ".log") {
      const filepath = join(
        "C:\\Users\\Parth\\Desktop\\FOLDER VIEWR ONLY BACKEND",
        reqpath
      );
      console.log(filepath);
      res.sendFile(filepath);
    } else {
      next();
    }
  } else {
    const monthpath = cheakForTheMonth();
    var pathtodir = join(monthpath, reqpath);
    if (!cheakfolder(monthpath, reqpath)) {
      makeDirectory(path.join(monthpath, reqpath));
    }
    const currentDate = new Date();
    const date = currentDate.getDate();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const whole = `${date}-${month}-${year}.log`;
    const data = `${new Date().toISOString()} - ${req.method} ${
      req.headers["user-agent"]
    }\n`;
    fs.appendFile(join(pathtodir, whole), data, (err) => {
      if (err) {
        console.error("Error writing to log file:", err);
      }
    });
    next();
  }
});

app.use("/logs", serveIndex(currentpath, { icons: true }));
app.listen(port, () => {
  console.log("LISTINING ON PORT", 5500);
});
