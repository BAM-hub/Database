import fs from "fs";
import readline from "readline";

class Page {
  buffer: Buffer;
  filePath: string;

  constructor(size = 8192) {
    this.buffer = Buffer.alloc(size);
  }

  read(offset, length) {
    return this.buffer.slice(offset, offset + length);
  }

  write(offset, data) {
    data.copy(this.buffer, offset);
  }
}

class StorageEngine {
  fileDescriptor: number;
  filePath: string;
  constructor(filePath: string) {
    this.filePath = filePath;
    this.fileDescriptor = fs.openSync(filePath, "w+");
  }

  writePage(page: Page, pageNumber: number) {
    const offset = pageNumber * page.buffer.length;
    fs.writeSync(
      this.fileDescriptor,
      page.buffer,
      0,
      page.buffer.length,
      offset
    );
  }

  readPage(pageNumber: number) {
    const page = new Page();
    const offset = pageNumber * page.buffer.length;
    fs.readSync(
      this.fileDescriptor,
      page.buffer,
      0,
      page.buffer.length,
      offset
    );
    return page;
  }
}

// Sample usage
const storage = new StorageEngine("dbfile.bin");
const page = new Page();
const data = Buffer.from("Hello, World!", "utf8");
page.write(0, data);
storage.writePage(page, 0);

const readPage = storage.readPage(0);
console.log(readPage.read(0, 13).toString("utf8"));
