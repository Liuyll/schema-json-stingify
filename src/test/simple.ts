import { attr } from '../helper'
import { Schema } from '..'

const obj = [
    attr('string'),
    attr('string')
]

const schema = new Schema(obj)
const val = [undefined, 2]

console.log(
    schema.stringify(val)
)