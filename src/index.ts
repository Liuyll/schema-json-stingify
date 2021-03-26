import { generateQueueAndChunks } from './helper'
import { ISchema } from './interface'

class Schema {
    private isArray: boolean
    constructor(public schema : ISchema) {
        if(Array.isArray(schema)) this.isArray = true
    }

    stringify(obj: Object) {
        const [queue, chunks] = generateQueueAndChunks(this.schema, this.isArray)
        
        let ret = this.generateStartOrEndChar()

        // 如果上一个值为null， 且值为字符串时，需要删除右引号
        let deleteRedundantRightQuote = false
        let continualUndefineCount = 0
        for(let i = 0; i < queue.length; i++) {
            const { getVal, type, nestInArray } = queue[i]
            const val = getVal(obj)
            if(typeof val === 'undefined') {
                if(nestInArray) {
                    if(continualUndefineCount) {
                        ret += ','
                    }
                    ret += 'null'
                }
                continualUndefineCount++
                if(type === 'string') deleteRedundantRightQuote = true
                continue
            }
            // 处理前序undefined case
            let { raw: chunk, fill, clearQuoteChunk, position } = chunks[i]
            if(position && (position - continualUndefineCount === 0) && !nestInArray) {
                // 删除第一个逗号
                chunk = chunk.replace(',', '')
            }

            continualUndefineCount = 0
            
            if(deleteRedundantRightQuote) {
                chunk = chunk.slice(1)
                deleteRedundantRightQuote = false
            }
            if(type === 'object' || type === 'array') {
                ret += chunk
            } else {
                if(val === null) {
                    if(typeof clearQuoteChunk !== 'boolean') {
                        // last
                        if(i === queue.length - 1) {
                            if(fill === 1) {
                                // 去除引号即可
                                clearQuoteChunk = clearQuoteChunk.slice(0, -1)
                            }
                            else clearQuoteChunk = clearQuoteChunk.slice(0, -fill) + clearQuoteChunk.slice(-fill + 1)
                            fill--
                        }
                        chunk = clearQuoteChunk as string
                        deleteRedundantRightQuote = true
                    }
                }
                if(fill) {
                    ret = ret + chunk.slice(0, -fill) + val + chunk.slice(-fill)  
                }
                else ret = ret + chunk + val
            }
        }
        return ret + this.generateStartOrEndChar(true)
    }

    generateStartOrEndChar(isEnd ?: boolean) {
        if(this.isArray) {
            if(isEnd) return ']'
            return '['
        }
        return isEnd ? '}' : '{'
    }
}

export {
    Schema
}