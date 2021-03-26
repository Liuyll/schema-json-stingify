const isSchemaAttr = (v) => v.__isSls == true;

const generateQueueAndChunks = (schema, isArray) => {
    const pathQueue = [];
    const chunks = [];
    const additional = [];
    JSON.stringify(schema, makeSavePathReplacer(pathQueue, chunks, additional, isArray));
    additional.forEach(str => {
        chunks[chunks.length - 1].raw = chunks[chunks.length - 1].raw + str;
        if (chunks[chunks.length - 1].clearQuoteChunk) {
            chunks[chunks.length - 1].clearQuoteChunk = chunks[chunks.length - 1].clearQuoteChunk + str;
        }
        chunks[chunks.length - 1].fill++;
    });
    return [pathQueue, chunks];
};
function makeSavePathReplacer(pathQueue, chunks, additional, isArray) {
    const curPathList = [];
    // 0: array, 1: object
    const pathNestWrapType = [];
    const helpMap = new Map();
    let lastType;
    let nestType = isArray ? 'array' : 'object';
    let isFirst = true;
    const positionMap = new Map();
    return function (key, val) {
        if (!key)
            return val;
        if (positionMap.get(this) === undefined) {
            positionMap.set(this, 0);
        }
        if (helpMap.get(this)) {
            let flag = false;
            let deleteChild = false;
            for (let [k] of helpMap) {
                if (!flag) {
                    if (k === this)
                        flag = true;
                }
                if (flag) {
                    // 标识父级处理完毕，开始弹出additional
                    if (deleteChild) {
                        if (lastType === 'string') {
                            chunks[chunks.length - 1].raw = chunks[chunks.length - 1].raw + '"';
                            if (chunks[chunks.length - 1].clearQuoteChunk) {
                                chunks[chunks.length - 1].clearQuoteChunk = chunks[chunks.length - 1].clearQuoteChunk + '"';
                            }
                            chunks[chunks.length - 1].fill++;
                            lastType = null;
                            additional.shift();
                        }
                        const curAdditional = additional.pop();
                        chunks[chunks.length - 1].raw = chunks[chunks.length - 1].raw + curAdditional;
                        if (chunks[chunks.length - 1].clearQuoteChunk) {
                            chunks[chunks.length - 1].clearQuoteChunk = chunks[chunks.length - 1].clearQuoteChunk + curAdditional;
                        }
                        chunks[chunks.length - 1].fill++;
                    }
                    deleteChild = true;
                    helpMap.delete(k);
                    curPathList.pop();
                    pathNestWrapType.pop();
                }
            }
        }
        helpMap.set(this, true);
        if (!isSchemaAttr(val))
            throw Error(`path: ${curPathList.concat(key).join('.')} must be warper in attr!`);
        pathNestWrapType.push(nestType === 'array' ? 0 : 1);
        // 避免nestType被该轮重新赋值
        const lastNestType = nestType;
        let chunk = '';
        let clearQuoteChunk;
        // 处理上个字符串的右引号 
        if (lastType === 'string') {
            chunk += '"';
            additional.shift();
        }
        // 处理是否添加逗号
        if (isFirst)
            isFirst = false;
        else
            chunk += ',';
        if (isNestType(val)) {
            isFirst = true;
            val.serializer;
            if (val.type === 'object') {
                additional.push('}');
                chunk += `"${key}":{`;
                nestType = 'object';
            }
            else if (val.type === 'array') {
                additional.push(']');
                chunk += `"${key}":[`;
                nestType = 'array';
            }
        }
        else if (val.type === 'string') {
            chunk += `"${key}":"`;
            // 引号闭合永远位于最前方
            additional.unshift('"');
        }
        else {
            chunk += `"${key}":`;
        }
        const position = positionMap.get(this);
        positionMap.set(this, position + 1);
        // array ignore chunk
        if (lastNestType === 'array') {
            chunk = chunk.replace(new RegExp(`"${key}":`), '');
        }
        if (val.type === 'string')
            clearQuoteChunk = chunk.replace(new RegExp(`("${key}":)"`), '$1');
        chunks.push({
            raw: chunk,
            fill: 0,
            clearQuoteChunk: clearQuoteChunk ? clearQuoteChunk : false,
            position
        });
        curPathList.push(key);
        const path = curPathList.slice();
        const pathWrapType = pathNestWrapType.slice();
        const getVal = (obj) => {
            let findStr;
            findStr = `obj`;
            path.forEach((p, index) => {
                if (pathWrapType[index] === 0)
                    findStr += `[${p}]`;
                else
                    findStr += `.${p}`;
            });
            return eval(findStr);
        };
        pathQueue.push({
            getVal,
            lastKey: path[path.length - 1],
            type: val.type,
            nestInArray: lastNestType === 'array' ? true : false
        });
        lastType = val.type;
        return val.serializer ? val.serializer : '';
    };
}
const isNestType = (schema) => schema.type === 'object' || schema.type === 'array';

class Schema {
    constructor(schema) {
        this.schema = schema;
        if (Array.isArray(schema))
            this.isArray = true;
    }
    stringify(obj) {
        const [queue, chunks] = generateQueueAndChunks(this.schema, this.isArray);
        let ret = this.generateStartOrEndChar();
        // 如果上一个值为null， 且值为字符串时，需要删除右引号
        let deleteRedundantRightQuote = false;
        let continualUndefineCount = 0;
        for (let i = 0; i < queue.length; i++) {
            const { getVal, type, nestInArray } = queue[i];
            const val = getVal(obj);
            if (typeof val === 'undefined') {
                if (nestInArray) {
                    if (continualUndefineCount) {
                        ret += ',';
                    }
                    ret += 'null';
                }
                continualUndefineCount++;
                if (type === 'string')
                    deleteRedundantRightQuote = true;
                continue;
            }
            // 处理前序undefined case
            let { raw: chunk, fill, clearQuoteChunk, position } = chunks[i];
            if (position && (position - continualUndefineCount === 0) && !nestInArray) {
                // 删除第一个逗号
                chunk = chunk.replace(',', '');
            }
            continualUndefineCount = 0;
            if (deleteRedundantRightQuote) {
                chunk = chunk.slice(1);
                deleteRedundantRightQuote = false;
            }
            if (type === 'object' || type === 'array') {
                ret += chunk;
            }
            else {
                if (val === null) {
                    if (typeof clearQuoteChunk !== 'boolean') {
                        // last
                        if (i === queue.length - 1) {
                            if (fill === 1) {
                                // 去除引号即可
                                clearQuoteChunk = clearQuoteChunk.slice(0, -1);
                            }
                            else
                                clearQuoteChunk = clearQuoteChunk.slice(0, -fill) + clearQuoteChunk.slice(-fill + 1);
                            fill--;
                        }
                        chunk = clearQuoteChunk;
                        deleteRedundantRightQuote = true;
                    }
                }
                if (fill) {
                    ret = ret + chunk.slice(0, -fill) + val + chunk.slice(-fill);
                }
                else
                    ret = ret + chunk + val;
            }
        }
        return ret + this.generateStartOrEndChar(true);
    }
    generateStartOrEndChar(isEnd) {
        if (this.isArray) {
            if (isEnd)
                return ']';
            return '[';
        }
        return isEnd ? '}' : '{';
    }
}

export { Schema };
