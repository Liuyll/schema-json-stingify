import { generateQueueAndChunks, attr} from '../helper'
import { Schema } from '..'

const obj = {
    a: attr('number'),
    b: attr('object', {
        c: attr('string'),
        f: attr('string'),
        e: attr('object', {
            g: attr('string')
        }),
        i: attr("number")
    }),
    d: attr('number'),
}

const schema = new Schema(obj)
let val = schema.stringify({
    a: 1,
    b: {
        c: "2",
        f: "3",
        e: {
            g: 10
        },
        i: 20
    },
    d: 2,
})

console.log(val)

