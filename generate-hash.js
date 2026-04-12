const bcrypt = require("bcryptjs");

async function run() {
  const plain = "Sat3sap1";
  const hashFromDb = "$2b$10$282RYdNhoSWryTFFrXOHeudzwCKquUyvZOGFhPopK0FjA.5Ue7MOq";

  const result = await bcrypt.compare(plain, hashFromDb);
  console.log("MATCH:", result);
}

run();