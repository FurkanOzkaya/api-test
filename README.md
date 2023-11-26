# Api test

Test RESTful API's. 

Features:
 - Environment Variable assigning
 - Random Generator
 - Status Check
 - Response data check
 - Time Check
 - Pre-Post Script Running reaching class enviroment variables.

# ENV VARIABLES
Assign enviroment variables with 

```
 "assign_env": {
    "key": "response_data_key_path_with_dots"
 }
```

Key:  which you want to assign. you can use this key in other test cases. (example: "usernmae"  use it like "$env_username")

Value:  which you want to use from response data (example: user.username, users[0].username etc.)

Note: 

 - For using enviroment variable in other test cases you can add $env_ prefix to your key.
 - You can use enviroment variables in body, headers, response body.


## Pre Defined enviroment variables

These enviroment variables directly assigned to ENV_VARIABLES for future usage.

```
"pre_defined_env": {
    "a: "b"
}
```

## Body Check

### Exact Check (exact)

It should be exactly same with given body json.


## Field Check (field)

Check specific fields.

```
response:
{
    "user": {
        "username": "afo"
        "data": "some_data"
    }
    "some_array": [
        {
            "data_x": "X data"
        }
    ]
}

body
{
    "user.username": "afo",
    "user.data": "data",
    "some_array[0].data_x": "X data"
}
```

## Random

You can use these randoms. Add $random_ prefix when using (example: $random_username)

```
$random_username
$random_name
$random_email
$random_assword
$random_string
$random_integer
$random_float
$random_bool
$random_sentence
$random_date
```


## Pre Function && Post Function
Danger: Uses eval function.

You can use class enviroments and change them
it should given directly with testCase json


## Pre Script && Post Script
Danger: Uses eval function.

You can use class enviroments and change them

Path should given to TestCase json. 
js files should be under static/script

Note :

You can use these with pre-post Scripts.
Be aware of that any change will effect to running process
```
this.test_data
this.base_url
this.result_messages
this.ENV_VARIABLES
```

Structure of API test json file.
```
{
    "base_url": "BASE_URL", 
    "tests": [
        {
            "name": "Test Case Name",
            "path": "path/to/test",
            "type": "post",
            "headers": {},
            "body": {},
            "response": {
                "status_check": true,
                "body_check": true,
                "time_check": true,
                "body_check_type": "field", // exact, field
                "status": 201,
                "body": {},
                "time_below": 200  // milisecond
            },
            "predefined_env": {},
            "assign_env": {  // key value pairs in value part you can define with dots like a.b[0].c
                "user_id": "id",
                "username": "user.username",
            },
            "pre_function": "",  // plain text 
            "post_function": "", // plain text
            "pre_script": "",  // script file under static/script folder  
            "post_script": "" // script file  under static/script folder  

        }
    ]
}
```

### Example TEST Json File


```
{
    "base_url": "http://127.0.0.1:9000/api/",
    "tests": [
        {
            "name": "Create User Success",
            "path": "user/",
            "type": "post",
            "headers": {},
            "body": {
                "username": "$random_username__lower",
                "password": "$random_password",
                "email": "$random_email"
            },
            "response": {
                "status_check": true,
                "body_check": true,
                "time_check": true,
                "body_check_type": "field",
                "status": 201,
                "body": {
                },
                "time_below": 200
            },
            "pre_defined_env": {
                "a": "b"
            },
            "assign_env": {
                "user_id": "id",
                "username": "username",
                "email": "email",
                "password": "password"
            },
            "pre_function": "",
            "post_function": "",
            "pre_script": "",
            "post_script": ""

        },
        {
            "name": "Login User Success",
            "path": "token/",
            "type": "post",
            "headers": {},
            "body": {
                "username": "$env_username",
                "password": "$env_password"
            },
            "response": {
                "status_check": true,
                "body_check": true,
                "time_check": true,
                "body_check_type": "field",
                "status": 200,
                "body": {},
                "time_below": 200
            },
            "pre_defined_env": { },
            "assign_env": {
                "access_token": "access",
                "refresh_token": "refresh"
            },
            "pre_function": "",
            "post_function": "",
            "pre_script": "",
            "post_script": ""
        },
        {
            "name": "Update User",
            "path": "user/$env_user_id/",
            "type": "patch",
            "headers": {
                "Authorization": "Bearer $env_access_token"
            },
            "body": {
                "first_name": "$random_name",
                "last_name": "$random_name"
            },
            "response": {
                "status_check": true,
                "body_check": true,
                "time_check": true,
                "body_check_type": "field",
                "status": 200,
                "body": {},
                "time_below": 200
            },
            "pre_defined_env": { },
            "assign_env": {
                "access_token": "access",
                "refresh_token": "refresh"
            },
            "pre_function": "",
            "post_function": "",
            "pre_script": "",
            "post_script": ""
        },
        {
            "name": "Get Users",
            "path": "user/",
            "type": "get",
            "headers": {
                "Authorization": "Bearer $env_access_token"
            },
            "body": {},
            "response": {
                "status_check": true,
                "body_check": false,
                "time_check": true,
                "body_check_type": "",
                "status": 403,
                "body": {},
                "time_below": 200
            },
            "pre_defined_env": { },
            "assign_env": {},
            "pre_function": "",
            "post_function": "",
            "pre_script": "",
            "post_script": ""
        }

    ]
}
```


