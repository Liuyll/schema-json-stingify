import { attr } from '../src/helper'
import { testPropertyValue, test } from './utils'
import { expect } from 'chai'

describe('string schema stringify', () => {
    it('对象中undefined的key不序列化', () => {
        const schema = {
            a: attr('string')
        }

        const obj = {
            a: undefined
        }

        expect(testPropertyValue(schema, obj, 'a', undefined)).to.not.throw()
    }) 

    it('数组中undefined的key序列化为null', () => {
        const schema = [
            attr('string')
        ]

        const obj = [
            undefined
        ]

        expect(testPropertyValue(schema, obj, '0', null)).to.not.throw()
    }) 

    it('数组中多个连续的key为undefined', () => {
        const schema = [
            attr('string'),
            attr('string')
        ]

        const obj = [
            undefined,
            undefined
        ]

        expect(testPropertyValue(schema, obj, '0', null)).to.not.throw()
    }) 

    it('数组中多个连续的key为undefined，且相邻key类型不同', () => {
        const schema = [
            attr('string'),
            attr('number')
        ]

        const obj = [
            undefined,
            undefined
        ]

        expect(testPropertyValue(schema, obj, '0', null)).to.not.throw()
    }) 

    it('对象中前序key为undefined，判断逗号和引号的去除', () => {
        const schema = {
            a: attr('object', {
                b: attr('string'),
                c: attr('string')
            })
        }

        const obj = {
            a: {
                b: undefined,
                c: 'qwe'
            },
        }

        expect(test(schema, obj)).to.not.throw()
    }) 
    
    it('数组中前序key为undefined，判断逗号的保留和引号的去除', () => {
        const schema = [
            attr('string'),
            attr('string')
        ]

        const obj = [undefined, 2]

        expect(test(schema, obj)).to.not.throw()
    }) 
})