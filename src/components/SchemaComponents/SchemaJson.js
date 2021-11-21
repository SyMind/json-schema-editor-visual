import React, { useContext, Component, PureComponent } from 'react'
import {
  Dropdown,
  Menu,
  Row,
  Col,
  Form,
  Select,
  Checkbox,
  Button,
  Icon,
  Input,
  Modal,
  message,
  Tooltip
} from 'antd'
import _ from 'underscore'
import FieldInput from './FieldInput'
import PropTypes from 'prop-types'
import utils from '../../utils'
import nls from '../../nls'
import MockSelect from '../MockSelect'
import EditorContext from '../EditorContext'
import './schemaJson.css'

const FormItem = Form.Item
const Option = Select.Option
const { TextArea } = Input
const InputGroup = Input.Group

const mapping = (name, data, showEdit, showAdv) => {
  switch (data.type) {
    case 'array':
      return <SchemaArray prefix={name} data={data} showEdit={showEdit} showAdv={showAdv} />
      break
    case 'object':
      let nameArray = [].concat(name, 'properties')
      return <SchemaObject prefix={nameArray} data={data} showEdit={showEdit} showAdv={showAdv} />
      break
    default:
      return null
  }
}

class SchemaArray extends PureComponent {
  static contextType = EditorContext

  constructor(props, context) {
    super(props)
    this._tagPaddingLeftStyle = {}
    this.Model = context
  }

  componentWillMount() {
    const { prefix } = this.props
    let length = prefix.filter(name => name != 'properties').length
    this.__tagPaddingLeftStyle = {
      paddingLeft: `${20 * (length + 1)}px`
    }
  }

  getPrefix() {
    return [].concat(this.props.prefix, 'items')
  }

  // 修改数据类型
  handleChangeType = value => {
    let prefix = this.getPrefix()
    let key = [].concat(prefix, 'type')
    this.Model.changeType(key, value)
  }

  // 修改备注信息
  handleChangeDesc = e => {
    let prefix = this.getPrefix()
    let key = [].concat(prefix, `description`)
    let value = e.target.value
    this.Model.changeValue(key, value)
  }

  // 修改mock信息
  handleChangeMock = e => {
    let prefix = this.getPrefix()
    let key = [].concat(prefix, `mock`)
    let value = e ? { mock: e } : ''
    this.Model.changeValue(key, value)
  }

  handleChangeTitle = e =>{
    let prefix = this.getPrefix()
    let key = [].concat(prefix, `title`)
    let value = e.target.value
    this.Model.changeValue(key, value)
  }

  // 增加子节点
  handleAddChildField = () => {
    let prefix = this.getPrefix()
    let keyArr = [].concat(prefix, 'properties')
    this.Model.addChildField(keyArr)
    this.Model.setOpenValue(keyArr, value)
  }

  handleClickIcon = () => {
    let prefix = this.getPrefix()
    // 数据存储在 properties.name.properties下
    let keyArr = [].concat(prefix, 'properties')
    this.Model.setOpenValue(keyArr)
  }

  handleShowEdit = (name, type) => {
    let prefix = this.getPrefix()
    this.props.showEdit(prefix, name, this.props.data.items[name], type)
  }

  handleShowAdv = () => {
    this.props.showAdv(this.getPrefix(), this.props.data.items)
  }

  render() {
    const { data, prefix, showEdit, showAdv } = this.props
    const items = data.items
    let prefixArray = [].concat(prefix, 'items')

    let prefixArrayStr = [].concat(prefixArray, 'properties').join(utils.JSONPATH_JOIN_CHAR)
    let showIcon = this.context.getOpenValue([prefixArrayStr])
    return (
      !_.isUndefined(data.items) && (
        <div className="array-type">
          <Row className="array-item-type" type="flex" justify="space-around" align="middle">
            <Col
              span={8}
              className="col-item name-item col-item-name"
              style={this.__tagPaddingLeftStyle}
            >
              <Row type="flex" justify="space-around" align="middle">
                <Col span={2} className="down-style-col">
                  {items.type === 'object' ? (
                    <span className="down-style" onClick={this.handleClickIcon}>
                      {showIcon ? (
                        <Icon className="icon-object" type="caret-down" />
                      ) : (
                        <Icon className="icon-object" type="caret-right" />
                      )}
                    </span>
                  ) : null}
                </Col>
                <Col span={22}>
                  <Input addonAfter={<Checkbox disabled />} disabled value="Items" />
                </Col>
              </Row>
            </Col>
            <Col span={3} className="col-item col-item-type">
              <Select
                name="itemtype"
                className="type-select-style"
                onChange={this.handleChangeType}
                value={items.type}
              >
                {utils.SCHEMA_TYPE.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  )
                })}
              </Select>
            </Col>
            {this.context.isMock && (
              <Col span={3} className="col-item col-item-mock">
                
                <MockSelect
                  schema={items}
                  showEdit={() => this.handleShowEdit('mock', items.type)}
                  onChange={this.handleChangeMock}
                />
              </Col>
            )}
            <Col span={this.context.isMock ? 4 : 5} className="col-item col-item-mock">
              <Input
                addonAfter={<Icon type="edit" onClick={() => this.handleShowEdit('title')} />}
                placeholder={nls.localize('title')}
                value={items.title}
                onChange={this.handleChangeTitle}
              />
            </Col>
            <Col span={this.context.isMock ? 4 : 5} className="col-item col-item-desc">
              <Input
                addonAfter={<Icon type="edit" onClick={() => this.handleShowEdit('description')} />}
                placeholder={nls.localize('description')}
                value={items.description}
                onChange={this.handleChangeDesc}
              />
            </Col>
            <Col span={this.context.isMock ? 2: 3} className="col-item col-item-setting">
              <span className="adv-set" onClick={this.handleShowAdv}>
                <Tooltip placement="top" title={nls.localize('adv_setting')}>
                  <Icon type="setting" />
                </Tooltip>
              </span>

              {items.type === 'object' ? (
                <span onClick={this.handleAddChildField}>
                  <Tooltip placement="top" title={nls.localize('add_child_node')}>
                    <Icon type="plus" className="plus" />
                  </Tooltip>
                </span>
              ) : null}
            </Col>
          </Row>
          <div className="option-formStyle">{mapping(prefixArray, items, showEdit, showAdv)}</div>
        </div>
      )
    )
  }
}

class SchemaItem extends PureComponent {
  static contextType = EditorContext

  constructor(props, context) {
    super(props)
    this._tagPaddingLeftStyle = {}
    // this.num = 0
    this.Model = context
  }

  componentWillMount() {
    const { prefix } = this.props
    let length = prefix.filter(name => name != 'properties').length
    this.__tagPaddingLeftStyle = {
      paddingLeft: `${20 * (length + 1)}px`
    }
  }

  getPrefix() {
    return [].concat(this.props.prefix, this.props.name)
  }

  // 修改节点字段名
  handleChangeName = e => {
    const { data, prefix, name } = this.props
    let value = e.target.value

    if (data.properties[value] && typeof data.properties[value] === 'object') {
      return message.error(`The field "${value}" already exists.`)
    }

    this.Model.changeName(value, prefix, name)
  }

  // 修改备注信息
  handleChangeDesc = e => {
    let prefix = this.getPrefix()
    let key = [].concat(prefix, 'description')
    let value = e.target.value
    this.Model.changeValue(key, value)
  }

  // 修改mock 信息
  handleChangeMock = e => {
    let prefix = this.getPrefix()
    let key = [].concat(prefix, `mock`)
    let value = e ? { mock: e } : ''
    this.Model.changeValue(key, value)
  }

  handleChangeTitle = e => {
    let prefix = this.getPrefix()
    let key = [].concat(prefix, `title`)
    let value = e.target.value
    this.Model.changeValue(key, value)
  }

  // 修改数据类型
  handleChangeType = e => {
    let prefix = this.getPrefix()
    let key = [].concat(prefix, 'type')
    this.Model.changeType(key, e)
  }

  // 删除节点
  handleDeleteItem = () => {
    const { prefix, name } = this.props
    let nameArray = this.getPrefix()
    this.Model.deleteItem(nameArray)
    this.Model.enableRequire(prefix, name, false)
  }
  /*
  展示备注编辑弹窗
  editorName: 弹窗名称 ['description', 'mock']
  type: 如果当前字段是object || array showEdit 不可用
  */
  handleShowEdit = (editorName, type) => {
    const { data, name, showEdit } = this.props

    showEdit(this.getPrefix(), editorName, data.properties[name][editorName], type)
  }

  // 展示高级设置弹窗
  handleShowAdv = () => {
    const { data, name, showAdv } = this.props
    showAdv(this.getPrefix(), data.properties[name])
  }

  //  增加子节点
  handleAddField = () => {
    const { prefix, name } = this.props
    this.Model.addField(prefix, name)
  }

  // 控制三角形按钮
  handleClickIcon = () => {
    let prefix = this.getPrefix()
    // 数据存储在 properties.xxx.properties 下
    let keyArr = [].concat(prefix, 'properties')
    this.Model.setOpenValue(keyArr)
  }

  // 修改是否必须
  handleEnableRequire = e => {
    const { prefix, name } = this.props
    let required = e.target.checked
    // this.enableRequire(this.props.prefix, this.props.name, e.target.checked)
    this.Model.enableRequire(prefix, name, required)
  }

  render() {
    let { name, data, prefix, showEdit, showAdv } = this.props
    let value = data.properties[name]
    let prefixArray = [].concat(prefix, name)

    let prefixStr = prefix.join(utils.JSONPATH_JOIN_CHAR)
    let prefixArrayStr = [].concat(prefixArray, 'properties').join(utils.JSONPATH_JOIN_CHAR)
    let show = this.context.getOpenValue([prefixStr])
    let showIcon = this.context.getOpenValue([prefixArrayStr])
    return show ? (
      <div>
        <Row type="flex" justify="space-around" align="middle">
          <Col
            span={8}
            className="col-item name-item col-item-name"
            style={this.__tagPaddingLeftStyle}
          >
            <Row type="flex" justify="space-around" align="middle">
              <Col span={2} className="down-style-col">
                {value.type === 'object' ? (
                  <span className="down-style" onClick={this.handleClickIcon}>
                    {showIcon ? (
                      <Icon className="icon-object" type="caret-down" />
                    ) : (
                      <Icon className="icon-object" type="caret-right" />
                    )}
                  </span>
                ) : null}
              </Col>
              <Col span={22}>
                <FieldInput
                  addonAfter={
                    <Tooltip placement="top" title={nls.localize('required')}>
                      <Checkbox
                        onChange={this.handleEnableRequire}
                        checked={
                          _.isUndefined(data.required) ? false : data.required.indexOf(name) != -1
                        }
                      />
                    </Tooltip>
                  }
                  onChange={this.handleChangeName}
                  value={name}
                />
              </Col>
            </Row>
          </Col>


          <Col span={3} className="col-item col-item-type">
            <Select
              className="type-select-style"
              onChange={this.handleChangeType}
              value={value.type}
            >
              {utils.SCHEMA_TYPE.map((item, index) => {
                return (
                  <Option value={item} key={index}>
                    {item}
                  </Option>
                )
              })}
            </Select>
          </Col>


          {this.context.isMock && (
            <Col span={3} className="col-item col-item-mock">
              {/* <Input
                addonAfter={
                  <Icon type="edit" onClick={() => this.handleShowEdit('mock', value.type)} />
                }
                placeholder={nls.localize('mock')}
                value={value.mock ? value.mock.mock : ''}
                onChange={this.handleChangeMock}
                disabled={value.type === 'object' || value.type === 'array'}
              /> */}
              <MockSelect
                schema={value}
                showEdit={() => this.handleShowEdit('mock', value.type)}
                onChange={this.handleChangeMock}
              />
            </Col>
          )}

          <Col span={this.context.isMock ? 4 : 5} className="col-item col-item-mock">
            <Input
              addonAfter={<Icon type="edit" onClick={() => this.handleShowEdit('title')} />}
              placeholder={nls.localize('title')}
              value={value.title}
              onChange={this.handleChangeTitle}
            />
          </Col>

          <Col span={this.context.isMock ? 4 : 5} className="col-item col-item-desc">
            <Input
              addonAfter={<Icon type="edit" onClick={() => this.handleShowEdit('description')} />}
              placeholder={nls.localize('description')}
              value={value.description}
              onChange={this.handleChangeDesc}
            />
          </Col>

          
          <Col span={this.context.isMock ? 2: 3}  className="col-item col-item-setting">
            <span className="adv-set" onClick={this.handleShowAdv}>
              <Tooltip placement="top" title={nls.localize('adv_setting')}>
                <Icon type="setting" />
              </Tooltip>
            </span>
            <span className="delete-item" onClick={this.handleDeleteItem}>
              <Icon type="close" className="close" />
            </span>
            {value.type === 'object' ? (
              <DropPlus prefix={prefix} name={name} />
            ) : (
              <span onClick={this.handleAddField}>
                <Tooltip placement="top" title={nls.localize('add_sibling_node')}>
                  <Icon type="plus" className="plus" />
                </Tooltip>
              </span>
            )}
          </Col>
        </Row>
        <div className="option-formStyle">{mapping(prefixArray, value, showEdit, showAdv)}</div>
      </div>
    ) : null
  }
}

class SchemaObjectComponent extends Component {
  shouldComponentUpdate(nextProps) {
    if (
      _.isEqual(nextProps.data, this.props.data) &&
      _.isEqual(nextProps.prefix, this.props.prefix) &&
      _.isEqual(nextProps.open, this.props.open)
    ) {
      return false
    }
    return true
  }

  render() {
    const { data, prefix, showEdit, showAdv } = this.props
    return (
      <div className="object-style">
        {Object.keys(data.properties).map((name, index) => (
          <SchemaItem
            key={index}
            data={this.props.data}
            name={name}
            prefix={prefix}
            showEdit={showEdit}
            showAdv={showAdv}
          />
        ))}
      </div>
    )
  }
}

const SchemaObject = ({...props}) => {
  const editorContext = useContext(EditorContext)
  return <SchemaObjectComponent open={editorContext.open} {...props} />
}

const DropPlus = ({ prefix, name, add }) => {
  const editorContext = useContext(EditorContext)
  const Model = editorContext
  const menu = (
    <Menu>
      <Menu.Item>
        <span onClick={() => Model.addField(prefix, name)}>
          {nls.localize('sibling_node')}
        </span>
      </Menu.Item>
      <Menu.Item>
        <span
          onClick={() => {
            Model.setOpenValue([].concat(prefix, name, 'properties'), true)
            Model.addChildField([].concat(prefix, name, 'properties'))
          }}
        >
          {nls.localize('child_node')}
        </span>
      </Menu.Item>
    </Menu>
  )

  return (
    <Tooltip placement="top" title={nls.localize('add_node')}>
      <Dropdown overlay={menu}>
        <Icon type="plus" className="plus" />
      </Dropdown>
    </Tooltip>
  )
}

const SchemaJson = props => {
  const item = mapping([], props.data, props.showEdit, props.showAdv)
  return <div className="schema-content">{item}</div>
}

export default SchemaJson
