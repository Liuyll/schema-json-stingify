interface _ISchema {
    [key: string]: SchemaAttr | _ISchema
}

type ISchema = _ISchema | SchemaAttr[]

class SchemaAttr {
    __isSls: boolean
    constructor(public type: string, public serializer ?: Array<SchemaAttr> | ISchema) {
        this.__isSls = true
    }
}

const isSchemaAttr = (v: any): v is SchemaAttr => (v as SchemaAttr).__isSls == true

interface IChunk {
    // 填充关闭符号数量
    fill ?: number
    raw: string,
    clearQuoteChunk: string | boolean,
    position: number
}

interface GetVal {
    (obj: Object): string
}

interface ClearChunkRedundantChar {
    (str: string): string
}

interface IQueue {
    lastKey: string,
    getVal: GetVal,
    type: string,
    nestInArray ?: boolean
}

export {
    SchemaAttr,
    ISchema,
    isSchemaAttr,
    IChunk,
    IQueue,
    GetVal,
    ClearChunkRedundantChar
}

