import ApiTest from "./api_test"
import fs from 'fs';

function readJsonFile(file: string) {
    let test_data = fs.readFileSync(file, "utf-8");
    return JSON.parse(test_data)
}

let test1_data = readJsonFile('./static/test1.json')

let afo: ApiTest = new ApiTest(test1_data)
afo.testAllApis()