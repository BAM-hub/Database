import { StorageEngine } from "./storage_engine";

const employee = {
  id: 2147483647,
  name: "Alice",
  position: "Manager",
  salary: 60003,
};

const storage = new StorageEngine();

// const data = storage.serializeData(employee);
// storage.saveToFile("employee.bin", employee);
storage.saveToFile("employee.bin", employee);
console.log(storage.readEmployeeFromFile("employee.bin"));
