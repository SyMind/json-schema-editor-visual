import { createContext, useState, useRef, useCallback, FC } from 'react'
import type { JSONSchema7 } from 'json-schema'
import { isUndefined } from 'underscore'
import utils from '../utils'
import handleSchema from '../schema'

export interface EditorContextProps {
    curItemCustomValue: any
    schema: JSONSchema7
    open: Record<string, boolean>
    __jsonSchemaFormat: any[]
    changeEditorSchema?: Function
    changeName?: Function
    changeValue?: Function
    changeType?: Function
    enableRequire?: Function
    requireAll?: Function
    deleteItem?: Function
    addField?: Function
    addChildField?: Function
    setOpenValue?: Function
    getOpenValue?: Function
    changeCustomValue?: Function
}

const EditorContext = createContext<EditorContextProps>({
    curItemCustomValue: {},
    schema: {
        title: '',
        type: 'object',
        properties: {},
        required: []
    },
    open: {
        properties: true
    },
    __jsonSchemaFormat: []
});

export const EditorProvider: FC = ({ children }) => {
    const fieldNum = useRef<number>(1)

    const [schema, setSchema] = useState<JSONSchema7>({
        title: '',
        type: 'object',
        properties: {},
        required: []
    });

    const [open, setOpen] = useState<Record<string, boolean>>({
        properties: true
    });

    const [curItemCustomValue, setCurItemCustomValue] = useState<any>({});

    const changeEditorSchema = useCallback((nextSchema: JSONSchema7): void => {
        handleSchema(nextSchema)
        setSchema(nextSchema)
    }, [])

    const changeName = useCallback((keys: string[], name: string, value: string): void => {
        const nextSchema = { ...schema };
        let parentKeys = utils.getParentKeys(keys)
        let parentData = utils.getData(nextSchema, parentKeys)
        let requiredData = ([] as string[]).concat(parentData.required || [])
        let propertiesData = utils.getData(nextSchema, keys)
        let newPropertiesData: Record<string, any> = {}

        let curData = propertiesData[name]
        let openKeys = ([] as string[]).concat(keys, value, 'properties').join(utils.JSONPATH_JOIN_CHAR)
        let oldOpenKeys = ([] as string[]).concat(keys, name, 'properties').join(utils.JSONPATH_JOIN_CHAR)
        if (curData.properties) {
            const nextOpen = { ...open }
            delete nextOpen[oldOpenKeys]
            nextOpen[openKeys] = true
            setOpen(nextOpen)
        }

        if (propertiesData[value] && typeof propertiesData[value] === 'object') {
            return
        }

        requiredData = requiredData.map(item => {
            if (item === name) return value
            return item
        })

        parentKeys.push('required')
        utils.setData(nextSchema, parentKeys, requiredData)

        for (let i in propertiesData) {
            if (i === name) {
                newPropertiesData[value] = propertiesData[i]
            } else newPropertiesData[i] = propertiesData[i]
        }

        utils.setData(nextSchema, keys, newPropertiesData)

        setSchema(nextSchema)
    }, [schema, open])

    const changeValue = useCallback((keys: string[], value: any): void => {
        const nextSchema = { ...schema };
        if (value) {
            utils.setData(nextSchema, keys, value)
        } else {
            utils.deleteData(nextSchema, keys)
        }
        setSchema(nextSchema)
    }, [schema])

    const changeType = useCallback((keys: string[], value: string): void => {
        const nextSchema = { ...schema };
        let parentKeys = utils.getParentKeys(keys)
        let parentData = utils.getData(nextSchema, parentKeys)
        if (parentData.type === value) {
            return
        }
        let nextParentDataItem = utils.defaultSchema[value]

        // 将备注过滤出来
        let parentDataItem = parentData.description ? { description: parentData.description } : {}
        let nextParentData = Object.assign({}, nextParentDataItem, parentDataItem)
        utils.setData(nextSchema, parentKeys, nextParentData)

        setSchema(nextSchema)
    }, [schema])

    const enableRequire = useCallback((keys: string[], name: string, required: boolean): void => {
        const nextSchema = { ...schema }
        let parentKeys = utils.getParentKeys(keys)
        let parentData = utils.getData(schema, parentKeys)
        let requiredData = ([] as string[]).concat(parentData.required || [])
        let index = requiredData.indexOf(name)

        if (!required && index >= 0) {
            requiredData.splice(index, 1)
            parentKeys.push('required')
            if (requiredData.length === 0) {
                utils.deleteData(nextSchema, parentKeys)
            } else {
                utils.setData(nextSchema, parentKeys, requiredData)
            }
        } else if (required && index === -1) {
            requiredData.push(name)
            parentKeys.push('required')
            utils.setData(nextSchema, parentKeys, requiredData)
        }

        setSchema(nextSchema)
    }, [schema])

    const requireAll = useCallback((required: boolean): void => {
        const nextSchema = utils.cloneObject(schema)
        utils.handleSchemaRequired(nextSchema, required)
        setSchema(nextSchema)
    }, [schema])

    const deleteItem = useCallback((keys: string[]): void => {
        const nextSchema = { ...schema }
        let name = keys[keys.length - 1]
        let parentKeys = utils.getParentKeys(keys)
        let parentData = utils.getData(nextSchema, parentKeys)
        let newParentData: Record<string, any> = {}
        for (let i in parentData) {
            if (i !== name) {
                newParentData[i] = parentData[i]
            }
        }
        utils.setData(nextSchema, parentKeys, newParentData)

        setSchema(nextSchema)
    }, [schema])

    const addField = useCallback((keys: string[], name: string): void => {
        const nextSchema = { ...schema }
        let propertiesData = utils.getData(nextSchema, keys)
        let newPropertiesData: Record<string, any> = {}

        let parentKeys = utils.getParentKeys(keys)
        let parentData = utils.getData(nextSchema, parentKeys)
        let requiredData = ([] as string[]).concat(parentData.required || [])

        if (!name) {
            newPropertiesData = Object.assign({}, propertiesData)
            let ranName = 'field_' + fieldNum.current++
            newPropertiesData[ranName] = utils.defaultSchema.string
            requiredData.push(ranName)
        } else {
            for (let i in propertiesData) {
                newPropertiesData[i] = propertiesData[i]
                if (i === name) {
                    let ranName = 'field_' + fieldNum.current++
                    newPropertiesData[ranName] = utils.defaultSchema.string
                    requiredData.push(ranName)
                }
            }
        }
        utils.setData(nextSchema, keys, newPropertiesData)
        // add required
        parentKeys.push('required')
        utils.setData(nextSchema, parentKeys, requiredData)

        setSchema(nextSchema)
    }, [schema])

    const addChildField = useCallback((keys: string[]): void => {
        const nextSchema = { ...schema }
        let propertiesData = utils.getData(nextSchema, keys)
        let newPropertiesData: Record<string, any> = {}

        newPropertiesData = Object.assign({}, propertiesData)
        let ranName = 'field_' + fieldNum.current++
        newPropertiesData[ranName] = utils.defaultSchema.string
        utils.setData(nextSchema, keys, newPropertiesData)

        // add required
        let parentKeys = utils.getParentKeys(keys)
        let parentData = utils.getData(nextSchema, parentKeys)
        let requiredData = ([] as string[]).concat(parentData.required || [])
        requiredData.push(ranName)
        parentKeys.push('required')
        utils.setData(nextSchema, parentKeys, requiredData)

        setSchema(nextSchema)
    }, [schema])

    const setOpenValue = useCallback((keys: string[], value: boolean): void => {
        const nextOpen = { ...open }
        const path = keys.join(utils.JSONPATH_JOIN_CHAR)

        let status
        if (isUndefined(value)) {
            status = utils.getData(nextOpen, [path]) ? false : true
        } else {
            status = value
        }
        utils.setData(nextOpen, [path], status)
    }, [open])

    return (
        <EditorContext.Provider
            value={{
                curItemCustomValue,
                __jsonSchemaFormat: [],
                schema,
                open,
                changeEditorSchema,
                changeName,
                changeValue,
                changeType,
                enableRequire,
                requireAll,
                deleteItem,
                addField,
                addChildField,
                setOpenValue,
                changeCustomValue: setCurItemCustomValue,
                getOpenValue: keys => {
                    return utils.getData(open, keys)
                }
            }}
        >
            {children}
        </EditorContext.Provider>
    );
}

export default EditorContext;
