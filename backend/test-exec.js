import { execSync } from "child_process";

console.log("Testing Node:", execSync("node -e \"console.log('Node OK: ' + (10+20))\"").toString().trim());
console.log("Testing Python:", execSync("python -c \"print('Python OK: ' + str(10+20))\"").toString().trim());
