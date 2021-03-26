import { generateQueueAndChunks, attr} from '../helper'
import { Schema } from '..'

const obj = {
    a: attr('array', [
        attr('number'),
        attr('number')
    ])
}

const schema = new Schema(obj)

const val = schema.stringify({
    a: [
        1,2
    ]
})

console.log(val)
