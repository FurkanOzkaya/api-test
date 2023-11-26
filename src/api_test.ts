import axios, { AxiosError } from "axios"
import { ApiResponse, Test, TestCase } from "./models/testModel"
import generateRandom from "./utils/random"
import { compareBodyExact, compareBodyField, scriptsToText } from "./utils/utils"
import chalk from 'chalk';
import _ from "lodash"

const EXACT_CHECK_TYPE = "exact"
const FIELD_CHECK_TYPE = "field"
const ENV_CONSTANT = "$env_"
const RANDOM_CONSTANT = "$random_"
const LOWER_CONSTANT = "__lower"


class ApiTest {
    test_data: Test
    base_url: string | null = null
    result_messages: Array<any> = []
    ENV_VARIABLES: any = {}

    constructor(test_data: Test) {
        this.test_data = test_data
        this.base_url = test_data.base_url
    }

    preparePath(path: string) {
        if (path.includes(ENV_CONSTANT)) {
            let paths = path.split("/")
            let new_paths: string[] = []
            paths.forEach(element => {
                if (element.includes(ENV_CONSTANT)) {
                    // Assign env from enviroment variable
                    new_paths.push(this.ENV_VARIABLES[element.split(ENV_CONSTANT)[1]])
                } else {
                    new_paths.push(element)
                }
            })
            return new_paths.join("/")
        }
        return path
    }

    prepareBody(body: any): any {
        let key: any
        let value: any
        for ([key, value] of Object.entries(body)) {
            if (value.includes(LOWER_CONSTANT) && value.includes(RANDOM_CONSTANT)) {
                value = value.split(LOWER_CONSTANT)[0]
                value = value.split(RANDOM_CONSTANT)[1]
                console.log("value==> ", value)
                let temp: any = generateRandom(value)
                console.log("generated random ==> ", temp)
                body[key] = temp.toLowerCase()
            }
            else if (value.includes(RANDOM_CONSTANT)) {
                value = value.split(RANDOM_CONSTANT)[1]
                body[key] = generateRandom(value)
            }

        }
        body = this.applyEnvData(body)
        return body
    }

    /**
     * This function prepare response body if there is any enviroment variable check.
     * Which starts with env_
     */
    applyEnvData(data: any) {
        let key: string
        let value: any
        for ([key, value] of Object.entries(data)) {
            if (typeof value == 'string' && value.includes(ENV_CONSTANT)) {
                let values = value.split(ENV_CONSTANT)
                // It will also check after env spaces if there 
                // it appends them to end of enviroment variable with space
                let [first, ...rest] = values[1].split(" ")
                let variable: string = first
                if (rest.length != 0) {
                    data[key] = values[0] + this.ENV_VARIABLES[variable] + " " + rest
                }
                else {
                    data[key] = values[0] + this.ENV_VARIABLES[variable]
                }

            }
        }
        return data
    }


    async testApi(test_data: TestCase) {
        // Preparing path and body
        test_data.path = this.preparePath(test_data.path)
        test_data.body = this.prepareBody(test_data.body)

        test_data.headers = this.applyEnvData(test_data.headers)
        // Assign env variables
        // Make it before request for assigning random variables to the env
        this.assignENVVariable(test_data.assign_env, test_data.body)
        console.info("Requesting using type: ")
        console.info({
            type: test_data.type,
            path: test_data.path,
            headers: test_data.headers,
            body: test_data.body
        })
        let response
        try {
            response = await axios({
                method: test_data.type,
                url: this.base_url + test_data.path,
                headers: test_data.headers,
                data: test_data.body
            })
        }
        catch (error: any) {
            console.log("response ==> ")
            console.log(error)
            return error.response

        };


        return response
    }


    checkApiResponse(test_response_data: ApiResponse, response: any, diff_time: number): Boolean {
        // Response status Check
        if (test_response_data.status_check) {
            if (response.status == test_response_data.status) {
                this.result_messages.push(chalk.green("Status Code Check Success"))
            }
            else {
                this.result_messages.push(chalk.red(`Expected Status Code ${test_response_data.status} found ${response.status}`))
                return false
            }
        }
        // Time Check
        if (test_response_data.time_check) {
            if (diff_time <= test_response_data.time_below) {
                this.result_messages.push(chalk.green(`Request took ${diff_time} which is below/equal of ${test_response_data.time_below}`))
            }
            else {
                this.result_messages.push(chalk.red(`Request took ${diff_time} which is upper than ${test_response_data.time_below}`))
                return false
            }
        }

        if (test_response_data.body_check && test_response_data.body_check_type) {
            // Prepare body if there is env variable
            let test_response_body = this.applyEnvData(test_response_data.body)
            let res: boolean | null = null
            if (test_response_data.body_check_type == EXACT_CHECK_TYPE) {
                res = compareBodyExact(response.data, test_response_body)
            }
            else if (test_response_data.body_check_type == FIELD_CHECK_TYPE) {
                res = compareBodyField(response.data, test_response_body)
            }
            if (res != null && !res) {
                this.result_messages.push(chalk.red(`Body match function is failed.`))
                this.result_messages.push(chalk.red(`Body match type:'${test_response_data.body_check_type}' Expected body:`))
                this.result_messages.push(test_response_body)
                this.result_messages.push(chalk.red("Found:"))
                this.result_messages.push(response.data)
                return false
            }
            else if (res != null) {
                this.result_messages.push(chalk.green(`Body match function success. type:'${test_response_data.body_check_type}' `))
            }

        }


        return true
    }

    assignENVVariable(assign_variable: any, data: any) {
        let key: string
        let value: any
        for ([key, value] of Object.entries(assign_variable)) {
            if (this.ENV_VARIABLES[key] == undefined) {
                this.ENV_VARIABLES[key] = _.get(data, value)
            }
        }
    }

    /**
     * 
     * @param pre_defined_env : 
     * Function assign enviroment variable to class ENV_VARIABLES from testCase.pre_defined_env
     */
    assignPreDefinedEnvVariables(pre_defined_env: object) {
        let key: string
        let value: any
        for ([key, value] of Object.entries(pre_defined_env || {})) {
            this.ENV_VARIABLES[key] = value
        }
    }

    async testAllApis() {
        for (let element of this.test_data!.tests) {
            // Assing pre defined enviroment variables.
            this.assignPreDefinedEnvVariables(element.pre_defined_env)

            // Run Pre Function.
            if (element.pre_function && element.pre_function != "") {
                eval(element.pre_function)
            }

            // Run pre Script.
            if (element.pre_script && element.pre_script != "") {
                let pre_script = scriptsToText(element.pre_script)
                eval(pre_script)
            }

            // Write test name.
            this.result_messages.push(chalk.bold.blue(element.name))

            // Request and Check part.
            let start_time: Date = new Date()
            let response = await this.testApi(element)
            let end_time: Date = new Date()
            let diff_time = end_time.getTime() - start_time.getTime()

            // Assign env variables.
            // Make it before check because of can be used in check api response.
            this.assignENVVariable(element.assign_env, response.data)
            let test_result = this.checkApiResponse(element.response, response, diff_time)
            if (!test_result) {
                break
            }

            // Run Post function.
            if (element.post_function && element.post_function != "") {
                eval(element.post_function)
            }

            // Run post Script.
            if (element.post_script && element.post_script != "") {
                let post_script = scriptsToText(element.post_script);
                eval(post_script)
            }
        }

        console.log("\n ENV VARIABLES ASSIGNED: ", this.ENV_VARIABLES)
        console.log(chalk.bold.yellow("\n\n\n TEST RUN RESULTS\n"))
        this.result_messages.forEach(element => {
            console.log("------> " + element)
        });

    }



}
export default ApiTest;