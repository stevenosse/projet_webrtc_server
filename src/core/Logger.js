import fs from "fs";
import path from "path";

const root = path.resolve("./");
console.log(root);
const logPath = `${root}/resources/logs`;

class Logger {
  write(room, message) {
    const d = new Date();
    const date = this._formatDate(d);
    fs.writeFile(
      `${logPath}/${room._id}.log`,
      `[${date}] - ${message}\n`,
      { flag: "a+" },
      (err) => {
        if (err) throw err;
        console.log("Failed to write log");
      }
    );
  }

  _formatDate(d) {
    return (
      d.getDate() +
      "-" +
      (d.getMonth() + 1) +
      "-" +
      d.getFullYear() +
      " " +
      d.getHours() +
      ":" +
      d.getMinutes()
    );
  }
}

export default new Logger();
