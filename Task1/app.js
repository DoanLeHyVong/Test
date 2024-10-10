const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const moment = require("moment");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, "report.xlsx");
  },
});

function getLatestFile(directory) {
  const files = fs.readdirSync(directory);

  // Lọc chỉ lấy file .xlsx
  const xlsxFiles = files.filter((file) => path.extname(file) === ".xlsx");

  // Nếu không có file nào thì trả về null
  if (xlsxFiles.length === 0) return null;

  // Lấy file mới nhất dựa trên thời gian sửa đổi
  const latestFile = xlsxFiles
    .map((file) => ({
      file,
      time: fs.statSync(path.join(directory, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time)[0].file;

  return latestFile;
}

app.get("/read-latest-file", (req, res) => {
  const { startTime, endTime } = req.query;

  if (!startTime || !endTime) {
    return res.status(400).json({
      message: "Please provide both startTime and endTime in HH:mm format",
    });
  }

  const start = moment(startTime, "HH:mm");
  const end = moment(endTime, "HH:mm");
  console.log(start);

  if (!start.isValid() || !end.isValid()) {
    return res
      .status(400)
      .json({ message: "Invalid time format. Please use HH:mm format." });
  }

  const uploadDir = path.join(__dirname, "uploads");
  const latestFile = getLatestFile(uploadDir);

  if (!latestFile) {
    return res
      .status(404)
      .json({ message: "No .xlsx file found in uploads directory" });
  }

  const filePath = path.join(uploadDir, latestFile);

  // Đọc file .xlsx
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json(sheet);

    const filteredData = data.filter((row) => {
      const rowTime = moment(row["Giờ"], "HH:mm");
      return rowTime.isBetween(start, end, null, "[]");
    });

    res.json({
      message: "File read successfully",
      file: latestFile,
      data: filteredData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error reading file", error: error.message });
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== ".xlsx") {
      return cb(new Error("Only .xlsx files are allowed!"));
    }
    cb(null, true);
  },
});

let latestFilePath = null;

app.post("/upload", upload.single("file"), (req, res) => {
  console.log(req.file);
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  latestFilePath = path.join(__dirname, "uploads", "report.xlsx");
  res.status(200).json({ message: "File uploaded successfully" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
