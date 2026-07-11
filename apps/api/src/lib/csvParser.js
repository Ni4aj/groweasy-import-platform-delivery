import fs from "fs";
import csv from "csv-parser";

export function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    let headers = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("headers", (csvHeaders) => {
        headers = csvHeaders;
      })
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", () => {
        resolve({
          headers,
          rows
        });
      })
      .on("error", reject);
  });
}