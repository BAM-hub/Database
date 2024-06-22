import fs from "fs";

function lex() {
  const file = fs.readFileSync("./test.csv");

  const tokens = file
    .toString()
    .split("\n")
    .map((item) => item.trim().split(", "));
  console.log(tokens);
  const meta = tokens[0].reduce(
    (prev, curr, index) => ({
      ...prev,
      [curr]: index,
    }),
    {}
  );

  return {
    meta,
    tokens: tokens.slice(1, tokens.length),
  };
}

function getByName(name: string, key: string) {
  const { tokens, meta } = lex();
  console.log(tokens, meta);
  const index = meta[key as keyof typeof meta];
  let result = [];
  for (let i = 0; i < tokens.length; i++) {
    console.log(tokens[i][index]);
    if (tokens[i][index] === name) {
      result.push(tokens[i]);
    }
  }
  return result;
}

console.log(getByName("bshar", "name"));

function inputToBin() {
  const file = fs.readFileSync("./test.csv");
  console.log(file.buffer.byteLength);
  const outBuffer = Buffer.alloc(file.byteLength);

  for (let i = 0; i < file.byteLength; i++) {
    if (typeof file.at(i) === "number") {
      outBuffer.writeInt8(file.at(i) as number, i);
      console.log(file.at(i), i);
    }
  }

  //   for (let i = 0; i < outBuffer.buffer.byteLength; i++) {
  //     console.log(outBuffer.at(i));
  //   }
  fs.writeFile("./csv.bin", outBuffer, (err) => {
    if (err) throw err;
    console.log("written");
  });
}

console.log(inputToBin());
