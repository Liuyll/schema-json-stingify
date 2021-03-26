import 'mocha'

import { attr} from '../src/helper'
import { test } from './utils'
import { expect } from 'chai'

describe('object schema stringify', () => {
    it('nest one layer', () => {
        const schema = {
            a: attr('object', {
                b: attr('number'),
                c: attr('number')
            })
        }

        const oneLayerNestArray = {
            a: {
                b: 3,
                c: 4
            }
        }

        expect(test(schema, oneLayerNestArray)).to.not.throw()
    })

    // key is not exist in schema
    it('nest unqualified one layer', () => {
        const schema = {
            a: attr('object', {
                b: attr('number'),
                c: attr('number')
            })
        }

        const oneLayerNestArray = {
            a: {
                b: 3,
                d: 4
            }
        }

        expect(test(schema, oneLayerNestArray)).to.throw()
    })

    it('嵌套在数组内部', () => {
        const schema = [
            attr('object', {
                a: attr('string')
            })
        ]

        const obj = [{
            a: 'string'
        }]

        expect(test(schema, obj)).to.not.throw()
    })
})
