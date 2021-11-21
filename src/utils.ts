namespace _utils {
  export const JSONPATH_JOIN_CHAR = '.'

  export const format = [
    { name: 'date-time' },
    { name: 'date' },
    { name: 'email' },
    { name: 'hostname' },
    { name: 'ipv4' },
    { name: 'ipv6' },
    { name: 'uri' }
  ]

  export const SCHEMA_TYPE = ['string', 'number', 'array', 'object', 'boolean', 'integer']

  export const defaultSchema: Record<string, any> = {
    string: {
      type: 'string'
    },
    number: {
      type: 'number'
    },
    array: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    object: {
      type: 'object',
      properties: {}
    },
    boolean: {
      type: 'boolean'
    },
    integer: {
      type: 'integer'
    }
  }

  // TODO: 这函数写的有点大病
  export function getData(state: Record<string, any>, keys: string[]): Record<string, any> {
    let curState = state
    for (let i = 0; i < keys.length; i++) {
      curState = curState[keys[i]]
    }
    return curState
  }

  export function setData(state: Record<string, any>, keys: string[], value: any): void {
    let curState = state
    for (let i = 0; i < keys.length - 1; i++) {
      curState = curState[keys[i]]
    }
    curState[keys[keys.length - 1]] = value
  }

  export function deleteData(state: Record<string, any>, keys: string[]): void {
    let curState = state
    for (let i = 0; i < keys.length - 1; i++) {
      curState = curState[keys[i]]
    }

    delete curState[keys[keys.length - 1]]
  }

  export function getParentKeys(keys: string[]): string[] {
    if (keys.length === 1) return []
    let arr = ([] as any[]).concat(keys)
    arr.splice(keys.length - 1, 1)
    return arr
  }

  // TODO: 这函数写的有点大病
  function getFieldsTitle(data: Record<string, any>): string[] {
    const requiredtitle: string[] = []
    Object.keys(data).map(title => {
      requiredtitle.push(title)
    })

    return requiredtitle
  }

  export function handleSchemaRequired(schema: any, checked: boolean): any {
    // console.log(schema)
    if (schema.type === 'object') {
      let requiredtitle = getFieldsTitle(schema.properties)

      // schema.required = checked ? [].concat(requiredtitle) : []
      if (checked) {
        schema.required = ([] as string[]).concat(requiredtitle)
      } else {
        delete schema.required
      }

      handleObject(schema.properties, checked)
    } else if (schema.type === 'array') {
      handleSchemaRequired(schema.items, checked)
    } else {
      return schema
    }
  }

  function handleObject(properties: Record<string, any>, checked: boolean): void {
    for (var key in properties) {
      if (properties[key].type === 'array' || properties[key].type === 'object')
        handleSchemaRequired(properties[key], checked)
    }
  }

  export function cloneObject(obj: any): any {
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        var newArr: any[] = []
        obj.forEach(function (item, index) {
          newArr[index] = cloneObject(item)
        })
        return newArr
      } else {
        var newObj: Record<string, any> = {}
        for (var key in obj) {
          newObj[key] = cloneObject(obj[key])
        }
        return newObj
      }
    } else {
      return obj
    }
  }
}

export default _utils
