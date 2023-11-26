import _ from "lodash"
import fs from 'fs';

export function compareBodyExact(body: any, expectedBody: any) {
    let res: any = _.isEqual(body, expectedBody)
    console.info("Compare result: ", res)
    return res
}

export function compareBodyField(body: any, expectedBody: any) {
    let key, value: any
    for ([key, value] of Object.entries(expectedBody)) {
        let response_value = _.get(body, key)
        if (value != "" && value != response_value) {
            return false
        }
    }
    return true
}

export function scriptsToText(file_name: string) {
    let pre_script = fs.readFileSync("./static/script/" + file_name, "utf-8");
    return pre_script
}