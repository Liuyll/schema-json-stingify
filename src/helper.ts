import { IChunk, IQueue, ISchema, isSchemaAttr, SchemaAttr } from './interface'

const generateQueueAndChunks = (schema: ISchema, isArray ?: boolean): [Array<IQueue>, Array<IChunk>] => {
    const pathQueue:Array<IQueue> = []
    const chunks: IChunk[] = []
    const additional: string[] = []
    JSON.stringify(schema, makeSavePathReplacer(pathQueue, chunks, additional, isArray))
    additional.forEach(str => {
        chunks[chunks.length - 1].raw = chunks[chunks.length - 1].raw + str
        if(chunks[chunks.length - 1].clearQuoteChunk) {
            chunks[chunks.length - 1].clearQuoteChunk = chunks[chunks.length - 1].clearQuoteChunk + str
        }
        chunks[chunks.length - 1].fill++
    })
    return [pathQueue, chunks]
}

function makeSavePathReplacer(pathQueue: Array<IQueue>, chunks: Array<IChunk>, additional: string[], isArray: boolean) {
    const curPathList = []
    // 0: array, 1: object
    const pathNestWrapType = []
    let curNestObj: Array<any> | Object
    const helpMap: Map<Object, boolean> = new Map()
    let lastType
    let nestType = isArray ? 'array' : 'object'
    let isFirst = true
    const positionMap: Map<Object, number> = new Map()

    return function (key: string, val: SchemaAttr | string) {
        if(!key) return val
        if(positionMap.get(this) === undefined) {
            positionMap.set(this, 0)
        }
        if(helpMap.get(this)) {
            let flag = false
            let deleteChild = false
            for(let [k] of helpMap) {
                if(!flag) {
                    if(k === this) flag = true
                }
                if(flag) {
                    // 标识父级处理完毕，开始弹出additional
                    if(deleteChild) {
                        if(lastType === 'string') {
                            chunks[chunks.length - 1].raw = chunks[chunks.length - 1].raw + '"'
                            if(chunks[chunks.length - 1].clearQuoteChunk) {
                                chunks[chunks.length - 1].clearQuoteChunk = chunks[chunks.length - 1].clearQuoteChunk + '"'
                            }
                            chunks[chunks.length - 1].fill++
                            lastType = null
                            additional.shift()
                        }
                        const curAdditional = additional.pop()
                        chunks[chunks.length - 1].raw = chunks[chunks.length - 1].raw + curAdditional
                        if(chunks[chunks.length - 1].clearQuoteChunk) {
                            chunks[chunks.length - 1].clearQuoteChunk = chunks[chunks.length - 1].clearQuoteChunk + curAdditional
                        }
                        chunks[chunks.length - 1].fill++
                    }
                    deleteChild = true
                    helpMap.delete(k)
                    curPathList.pop()
                    pathNestWrapType.pop()
                }
            }
        } 

        helpMap.set(this, true)
        if(!isSchemaAttr(val)) throw Error(`path: ${curPathList.concat(key).join('.')} must be warper in attr!`)

        pathNestWrapType.push(nestType === 'array' ? 0 : 1)
        
        // 避免nestType被该轮重新赋值
        const lastNestType = nestType
        let chunk = ''
        let clearQuoteChunk
        // 处理上个字符串的右引号 
        if(lastType === 'string') {
            chunk += '"'
            additional.shift()
        } 

        // 处理是否添加逗号
        if(isFirst) isFirst = false
        else chunk += ','

        if(isNestType(val)) {
            isFirst = true
            curNestObj = val.serializer

            if(val.type === 'object') {
                additional.push('}')
                chunk += `"${key}":{`
                nestType = 'object'
            } else if(val.type === 'array') {
                additional.push(']')
                chunk += `"${key}":[`
                nestType = 'array'
            }
        } else if(val.type === 'string') {
            chunk += `"${key}":"`
            // 引号闭合永远位于最前方
            additional.unshift('"')
        } else {
            chunk += `"${key}":`
        }

        const position = positionMap.get(this)
        positionMap.set(this, position + 1)

        // array ignore chunk
        if(lastNestType === 'array') {
            chunk = chunk.replace(new RegExp(`"${key}":`), '')
        }

        if(val.type === 'string') clearQuoteChunk = chunk.replace(new RegExp(`("${key}":)"`), '$1')
        chunks.push({
            raw: chunk,
            fill: 0,
            clearQuoteChunk: clearQuoteChunk ? clearQuoteChunk : false,
            position
        })
        
        curPathList.push(key)
        const path = curPathList.slice()
        const pathWrapType = pathNestWrapType.slice()
        const getVal = (obj: Object) => {
            let findStr: string
            findStr = `obj`
            path.forEach((p, index) => {
                if(pathWrapType[index] === 0) findStr += `[${p}]`
                else findStr += `.${p}`
            })

            return eval(findStr)
        }

        pathQueue.push({
            getVal,
            lastKey: path[path.length - 1],
            type: val.type,
            nestInArray: lastNestType === 'array' ? true : false
        })

        lastType = val.type
        return val.serializer ? val.serializer : ''
    }
}

const isNestType = (schema: SchemaAttr) => schema.type === 'object' || schema.type === 'array'

const attr = (type: string, serializer ?: Array<SchemaAttr> | ISchema) => {
    return new SchemaAttr(type, serializer)
}
export {
    generateQueueAndChunks,
    attr
}
