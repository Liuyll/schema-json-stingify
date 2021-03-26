import { Schema } from '../../src'
import { ISchema } from '../../src/interface'
import * as assert from 'assert'

const test = (schema: ISchema, obj: Object) => {
    return () => {
        const json = new Schema(schema)
        const str = json.stringify(obj)
        JSON.parse(str)
    }
}

const testPropertyValue = (schema: ISchema, obj: Object, key: string, val: any) => {
    return () => { 
        const json = new Schema(schema)
        const str = json.stringify(obj)
        const ret = JSON.parse(str)
        assert.strictEqual(ret[key], val)
    }
}

export {
    test,
    testPropertyValue
}