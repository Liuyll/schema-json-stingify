import 'mocha'

import { attr} from '../src/helper'
import { test } from './utils'
import { expect } from 'chai'

describe('number schema stringify', () => {
    it('simple case in object', () => {
        const schema = {
            a: attr('number')
        }

        const obj = {
            a: 10
        }

        expect(test(schema, obj)).to.not.throw()
    }) 

    it('simple case in array', () => {
        const schema = [
            attr('number')
        ]

        const obj = [
            10
        ]

        expect(test(schema, obj)).to.not.throw()
    }) 
})