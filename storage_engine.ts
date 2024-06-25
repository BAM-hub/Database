import fs from "fs";
import { ParsedQuery } from "./query_engine";

type Schema = {
  [key: string]: string;
  type: string;
  //@ts-ignore
  len: number;
}[];
export class StorageEngine {
  parsedQuery: ParsedQuery;
  filename: string;
  constructor(parsedQuery: ParsedQuery) {
    this.parsedQuery = parsedQuery;
    this.filename = parsedQuery.from + ".bin";
  }

  resolveTableSchema() {
    const employeeSchema = `id int, name varchar(255), position varchar(255), salary int`;
    const tokens = employeeSchema.split(",");
    // @ts-ignore
    const schema = tokens.reduce((prev, curr) => {
      const dec = curr.trim().split(" ");
      const type = dec[1];
      let scheme = {};

      scheme = {
        [dec[0]]: dec[0],
        type:
          type.indexOf("(") !== -1 ? dec[1].slice(0, type.indexOf("(")) : type,
        len: dec[1].includes("varchar")
          ? parseInt(dec[1].slice(type.indexOf("(") + 1, type.indexOf(")")))
          : 4,
      };
      return [...prev, scheme];
    }, []);
    return schema as unknown as Schema;
  }

  serializeData(data: any) {
    const arrayOfData = Object.values(data);
    const fileData = fs.readFileSync("./employee.bin");
    const buffer = Buffer.alloc(
      255 + 255 + 4 + 4 + fs.statSync("./employee.bin").size
    );
    fileData.copy(buffer, 0);
    let offset = fileData.length;
    let i = 0;
    console.log(arrayOfData);
    while (offset < buffer.byteLength) {
      const data = arrayOfData[i];
      console.log(data);
      if (typeof data === "number" && !Number.isInteger(data)) {
        buffer.writeFloatLE(data as unknown as number, offset);
        offset += 4;
        continue;
      }
      if (typeof data === "number") {
        buffer.writeInt32LE(data, offset);
        offset += 4;
      }
      if (typeof data === "string") {
        buffer.writeUInt8(255, offset);
        buffer.write(data as unknown as string, offset, "utf-8");
        offset += 255;
      }
      i++;
    }
    console.log(offset);
    return buffer;
  }
  deserializeData(buffer: Buffer): any {
    const output: any[] = [];
    const schema = this.resolveTableSchema();
    let offset = 0;
    const recordSize = 4 + 255 + 255 + 4;

    while (offset + recordSize <= buffer.byteLength) {
      const value = schema.reduce((prev, curr) => {
        if (!this.parsedQuery.get.includes(Object.keys(curr)[0])) return prev;
        let value;
        if (curr.type === "int") {
          value = buffer.readInt32LE(offset);
          offset += this.getOffset(Object.keys(curr)[0]);
        }
        if (curr.type === "varchar") {
          value = buffer
            .toString("utf-8", offset, offset + 255)
            .replace(/\x00/g, "");
          offset += this.getOffset(Object.keys(curr)[0]);
        }
        return {
          ...prev,
          [Object.keys(curr)[0]]: value,
        };
      }, {});

      output.push(value);
    }
    return output;
  }

  saveToFile(filename: string, employee: any): void {
    const buffer = this.serializeData(employee);
    fs.writeFileSync(filename, buffer);
    console.log(`Employee data saved to ${filename}`);
  }
  readDataFromFile(): any | null {
    if (!fs.existsSync(this.filename)) {
      console.error(`Table ${this.filename} does not exist.`);
      return null;
    }

    const buffer = fs.readFileSync(this.filename);
    return this.deserializeData(buffer);
  }
  getOffset(key: string) {
    const schema = this.resolveTableSchema();
    let i = schema.findIndex((item) => Object.keys(item)[0] === key);

    let sum = schema[i].len;
    while (
      i + 1 < schema.length &&
      !this.parsedQuery.get.includes(Object.keys(schema[i + 1])[0])
    ) {
      i++;

      sum += schema[i].len;
    }

    return sum;
  }
}
