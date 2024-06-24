import fs from "fs";

type Schema = {
  [key: string]: string;
  type: string;
  len: string;
}[];
export class StorageEngine {
  resolveTableSchema(data: any) {
    const employeeSchema = `id int, name varchar(255), position varchar(255), salary real`;
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
          ? dec[1].slice(type.indexOf("(") + 1, type.indexOf(")"))
          : undefined,
        value: data[`${dec[0]}`],
      };
      return [...prev, scheme];
    }, []);
    return schema as unknown as Schema;
  }

  serializeData(data: any) {
    const schema = this.resolveTableSchema(data);
    // console.log(schema);
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
  deserializeEmployee(buffer: Buffer): any {
    const employees: any[] = [];
    let offset = 0;
    const recordSize = 4 + 255 + 255 + 4;

    while (offset + recordSize <= buffer.byteLength) {
      console.log(`Offset at start: ${offset}`);

      const id = buffer.readInt32LE(offset);
      offset += 4;

      const name = buffer
        .toString("utf-8", offset, offset + 255)
        .replace(/\x00/g, "");
      offset += 255;

      const position = buffer
        .toString("utf-8", offset, offset + 255)
        .replace(/\x00/g, "");
      offset += 255;

      const salary = buffer.readInt32LE(offset);
      offset += 4;

      console.log({ id, name, position, salary });
      employees.push({ id, name, position, salary });
      console.log(`Offset at end: ${offset}`);
    }

    console.log(employees);
  }

  saveToFile(filename: string, employee: any): void {
    const buffer = this.serializeData(employee);
    fs.writeFileSync(filename, buffer);
    console.log(`Employee data saved to ${filename}`);
  }
  readEmployeeFromFile(filename: string): any | null {
    if (!fs.existsSync(filename)) {
      console.error(`File ${filename} does not exist.`);
      return null;
    }

    const buffer = fs.readFileSync(filename);
    return this.deserializeEmployee(buffer);
  }
  getOffset(key: string, data: any) {
    const schema = this.resolveTableSchema(data);
    //@Todo implement this when needed
  }
}
