import 'mocha'

import { attr} from '../src/helper'
import { test } from './utils'
import { expect } from 'chai'

describe('null schema stringify', () => {
    it('字符串为null时', () => {
        const schema = [
            attr('object', {
                a: attr('string')
            })
        ]

        const obj = [{
            a: null
        }]

        expect(test(schema, obj)).to.not.throw()
    })

    it('数字为null时', () => {
        const schema = [
            attr('object', {
                a: attr('number')
            })
        ]

        const obj = [{
            a: null
        }]

        expect(test(schema, obj)).to.not.throw()
    })

    it('嵌套的null', () => {
        const schema = [
            attr('object', {
                a: attr('string'),
                b: attr('object', {
                    c: attr('number')
                })
            })
        ]

        const obj = [{
            a: null,
            b: {
                c: null
            }
        }]

        expect(test(schema, obj)).to.not.throw()
    })

    it('对象中的字符串为null', () => {
        const schema = {
            a:attr('string')
        }

        const obj = {
            a: null
        }

        expect(test(schema, obj)).to.not.throw()
    })
})