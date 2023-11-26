export interface Test {
    base_url: string
    tests: TestCase[]
}

export interface TestCase {
    name: string
    path: string
    type: string
    headers: any
    body: any,
    response: ApiResponse
    pre_defined_env: Object
    assign_env: any
    pre_function: string
    post_function: string
    pre_script: string
    post_script: string
}

export interface ApiResponse {
    status_check: boolean
    body_check: boolean
    time_check: boolean
    body_check_type: string // exact, field
    status: number,
    body: any
    time_below: number
}


