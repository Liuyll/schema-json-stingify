import 'mocha'

import { attr} from '../src/helper'
import { test } from './utils'
import { expect } from 'chai'

describe('array schema stringify', () => {
    // [1,2,3,...]
    it('nest simple zero layer', () => {
        const schema = [attr('number'), attr('number'), attr('number')]

        const obj = [1,2,3]
        expect(test(schema, obj)).to.not.throw()
    })

    it('nest one layer', () => {
        const schema = {
            a: attr('array', [
                attr('number'),
                attr('number')
            ])
        }

        const oneLayerNestArray = {
            a: [1,2]
        }

        expect(test(schema, oneLayerNestArray)).to.not.throw()
    })

    it('nest two layer', () => {
        const schema = {
            a: attr('array', [
                attr('array', [
                    attr('number')
                ])
            ])
        }

        const twoLayerNestArray = {
            a: [
                [
                    1
                ]
            ]
        }

        expect(test(schema, twoLayerNestArray)).to.not.throw()
    })
})
