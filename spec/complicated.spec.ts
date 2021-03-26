import 'mocha'

import { attr} from '../src/helper'
import { test } from './utils'
import { expect } from 'chai'

describe('complicated schema stringify', () => {
    it('复杂的多层对象', () => {
        it('complicated multi layer object', () => {
            const schema = {
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
    
            const obj = {
                a: {
                    b: 3,
                    d: 4
                }
            }
            
            expect(test(schema, obj)).to.throw()
        })
    }) 
})