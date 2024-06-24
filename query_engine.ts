import { StorageEngine } from "./storage_engine";

class Query {
  query: string;
  parsedQuery: {
    get: string[];
    from: string;
  };
  constructor(query: string) {
    this.query = query;
    this.parsedQuery = {
      get: [],
      from: "",
    };
    this.parse();
  }
  parse() {
    const tokens = this.query.split(" ");

    for (let i = 0; i < tokens.length; i++) {
      switch (tokens[i]) {
        case "select":
          i++;
          while (tokens[i] !== "from") {
            this.parsedQuery.get = [...this.parsedQuery.get, tokens[i]];
            i++;
          }
          i--;
          break;
        case "from":
          this.parsedQuery.from = tokens[i + 1].replace(";", "");
          i++;
          break;
      }
    }
    console.log(this.parsedQuery);
  }
  exec() {
    const storage = new StorageEngine();
    storage.readEmployeeFromFile("./employee.bin");
  }
}

const query = new Query("select * from employee;");
query.exec();
