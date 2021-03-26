import 'mocha'

import { attr} from '../src/helper'
import { test } from './utils'
import { expect } from 'chai'

describe('string schema stringify', () => {
    it('右引号是否添加正确', () => {
        const schema = {
            a: attr('string')
        }

        const obj = {
            a: 'string'
        }

        expect(test(schema, obj)).to.not.throw()
    }) 

    it('左引号在数组的情况下是否添加正确', () => {
        const schema = [
            attr('string')
        ]
        
        const obj = ['string']

        expect(test(schema, obj)).to.not.throw()
    })

    it('在嵌套情况下引号是否添加正确', () => {
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