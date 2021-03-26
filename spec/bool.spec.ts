import 'mocha'

import { attr} from '../src/helper'
import { test } from './utils'
import { expect } from 'chai'

describe('bool schema stringify', () => {
    it('simple case in object (false)', () => {
        const schema = {
            a: attr('bool')
        }

        const obj = {
            a: false
        }

        expect(test(schema, obj)).to.not.throw()
    }) 

    it('simple case in object (true)', () => {
        const schema = {
            a: attr('bool')
        }

        const obj = {
            a: true
        }

        expect(test(schema, obj)).to.not.throw()
    }) 

    it('simple case in array', () => {
        const schema = [
            attr('bool')
        ]

        const obj = [
            false
        ]

        expect(test(schema, obj)).to.not.throw()
    }) 
})