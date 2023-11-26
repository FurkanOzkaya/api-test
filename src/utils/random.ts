import { Chance } from 'chance';
var chance = new Chance();


function generateRandom(type: string): (string | bigint | boolean | number | Date) {
    switch (type) {
        case "username":
            return chance.first()
        case "name":
            return chance.first()
        case "email":
            return chance.email({ domain: "afo.com" })
        case "password":
            return chance.first() + chance.integer() + chance.last()
        case "string":
            return chance.string()
        case "integer":
            return chance.integer()
        case "float":
            return chance.floating()
        case "bool":
            return chance.bool()
        case "sentence":
            return chance.sentence()
        case "date":
            return chance.date({ string: true, american: false })
    }
    return ""
}

export default generateRandom