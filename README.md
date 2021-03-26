## schema-json-stringify

## test
```
npm run test
```

## use
### attr
```
type SchemaAttrType = 'string' | 'number' | 'object' | 'array' | 'null' | 'bool'

attr(type: SchemaAttrType, serialize ?: Object)
```
#### eg:

+ array: 
    ```
    attr('array', [
        attr('number'),
        attr('number')
    ])
    ```

+ object:
    ```
    attr('object', {
        key: attr('string')
    })
    ```

### Schema
```
const json = new Schema(schema: ISchema, isArray ?: bool)
const obj = ...
json.stringify(obj)
```

#### isArray
whether serialize a array object.

eg:
```
const schema = [
    attr('number')
]
const json = new Schema(schema, true)
json.stringify([1])
```