import React, { PureComponent } from 'react'
import {
  Dropdown,
  Menu,
  Input,
  InputNumber,
  Row,
  Col,
  Form,
  Select,
  Checkbox,
  Button,
  Icon,
  Modal,
  message,
  Tooltip,
  Switch
} from 'antd'
import { isUndefined } from 'underscore'
import PropTypes from 'prop-types'
import AceEditor from '../AceEditor/AceEditor'
import nls from '../../nls'
import './schemaJson.css'

const Option = Select.Option
const { TextArea } = Input

const changeOtherValue = (value, name, data, change) => {
  data[name] = value
  change(data)
}

class SchemaString extends PureComponent {
  constructor(props, context) {
    super(props)
    this.state = {
      checked: isUndefined(props.data.enum) ? false : true
    }
    this.format = context.Model.__jsonSchemaFormat
  }

  componentWillReceiveProps(nextprops) {
    if (this.props.data.enum !== nextprops.data.enum) {
      this.setState({
        checked: isUndefined(nextprops.data.enum) ? false : true
      })
    }
  }

  changeOtherValue = (value, name, data) => {
    data[name] = value
    this.context.changeCustomValue(data)
  }

  changeEnumOtherValue = (value, data) => {
    var arr = value.split('\n')
    if (arr.length === 0 || (arr.length == 1 && !arr[0])) {
      delete data.enum
      this.context.changeCustomValue(data)
    } else {
      data.enum = arr
      this.context.changeCustomValue(data)
    }
  }

  changeEnumDescOtherValue = (value, data) => {
    data.enumDesc = value
    this.context.changeCustomValue(data)
  }

  onChangeCheckBox = (checked, data) => {
    this.setState({
      checked
    })
    if (!checked) {
      delete data.enum
      this.context.changeCustomValue(data)
    }
  }

  render() {
    const { data } = this.props
    return (
      <div>
        <div className="default-setting">{nls.localize('base_setting')}</div>
        <Row className="other-row" type="flex" align="middle">
          <Col span={4} className="other-label">
            {nls.localize('default')}：
          </Col>
          <Col span={20}>
            <Input
              value={data.default}
              placeholder={nls.localize('default')}
              onChange={e => this.changeOtherValue(e.target.value, 'default', data)}
            />
          </Col>
        </Row>
        <Row className="other-row" type="flex" align="middle">
          <Col span={12}>
            <Row type="flex" align="middle">
              <Col span={8} className="other-label">
                {nls.localize('minLength')}：
              </Col>
              <Col span={16}>
                <InputNumber
                  value={data.minLength}
                  placeholder="min.length"
                  onChange={e => this.changeOtherValue(e, 'minLength', data)}
                />
              </Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row type="flex" align="middle">
              <Col span={8} className="other-label">
                {nls.localize('maxLength')}：
              </Col>
              <Col span={16}>
                <InputNumber
                  value={data.maxLength}
                  placeholder="max.length"
                  onChange={e => this.changeOtherValue(e, 'maxLength', data)}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="other-row" type="flex" align="middle">
          <Col span={4} className="other-label">
            <span>
              Pattern&nbsp;
              <Tooltip title={nls.localize('pattern')}>
                <Icon type="question-circle-o" style={{ width: '10px' }} />
              </Tooltip>
              &nbsp; :
            </span>
          </Col>
          <Col span={20}>
            <Input
              value={data.pattern}
              placeholder="Pattern"
              onChange={e => this.changeOtherValue(e.target.value, 'pattern', data)}
            />
          </Col>
        </Row>
        <Row className="other-row" type="flex" align="middle">
          <Col span={4} className="other-label">
            <span>
              {nls.localize('enum')}
              <Checkbox
                checked={this.state.checked}
                onChange={e => this.onChangeCheckBox(e.target.checked, data)}
              />{' '}
              :
            </span>
          </Col>
          <Col span={20}>
            <TextArea
              value={data.enum && data.enum.length && data.enum.join('\n')}
              disabled={!this.state.checked}
              placeholder={nls.localize('enum_msg')}
              autosize={{ minRows: 2, maxRows: 6 }}
              onChange={e => {
                this.changeEnumOtherValue(e.target.value, data)
              }}
            />
          </Col>
        </Row>
        {this.state.checked && (
          <Row className="other-row" type="flex" align="middle">
            <Col span={4} className="other-label">
              <span>{nls.localize('enum_desc')}</span>
            </Col>
            <Col span={20}>
              <TextArea
                value={data.enumDesc}
                disabled={!this.state.checked}
                placeholder={nls.localize('enum_desc_msg')}
                autosize={{ minRows: 2, maxRows: 6 }}
                onChange={e => {
                  this.changeEnumDescOtherValue(e.target.value, data)
                }}
              />
            </Col>
          </Row>
        )}
        <Row className="other-row" type="flex" align="middle">
          <Col span={4} className="other-label">
            <span>format :</span>
          </Col>
          <Col span={20}>
            <Select
              showSearch
              style={{ width: 150 }}
              value={data.format}
              dropdownClassName="json-schema-react-editor-adv-modal-select"
              placeholder="Select a format"
              optionFilterProp="children"
              optionLabelProp="value"
              onChange={e => this.changeOtherValue(e, 'format', data)}
              filterOption={(input, option) => {
                return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }}
            >
              {this.format.map(item => {
                return (
                  <Option value={item.name} key={item.name}>
                    {item.name} <span className="format-items-title">{item.title}</span>
                  </Option>
                )
              })}
            </Select>
          </Col>
        </Row>
      </div>
    )
  }
}

class SchemaNumber extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      checked: isUndefined(props.data.enum) ? false : true,
      enum: isUndefined(props.data.enum) ? '' : props.data.enum.join('\n')
    }
  }

  componentWillReceiveProps(nextprops) {
    const enumStr = isUndefined(this.props.data.enum) ? '' : this.props.data.enum.join('\n')
    const nextEnumStr = isUndefined(nextprops.data.enum) ? '' : nextprops.data.enum.join('\n')
    if (enumStr !== nextEnumStr) {
      this.setState({ enum: nextEnumStr })
    }
  }

  onChangeCheckBox = (checked, data) => {
    this.setState({
      checked
    })

    if (!checked) {
      delete data.enum
      this.setState({ enum: '' })
      this.context.changeCustomValue(data)
    }
  }

  changeEnumOtherValue = (value, data) => {
    this.setState({ enum: value })
    var arr = value.split('\n')
    if (arr.length === 0 || (arr.length == 1 && !arr[0])) {
      delete data.enum
      this.context.changeCustomValue(data)
    } else {
      data.enum = arr.map(item => +item)
      this.context.changeCustomValue(data)
    }
  }

  onEnterEnumOtherValue = (value, data) => {
    let arr = value.split('\n').map(item => +item)
    data.enum = arr
    this.context.changeCustomValue(data)
  }

  changeEnumDescOtherValue = (value, data) => {
    data.enumDesc = value
    this.context.changeCustomValue(data)
  }

  render() {
    const { data } = this.props
    return (
      <div>
        <div className="default-setting">{nls.localize('base_setting')}</div>
        <Row className="other-row" type="flex" align="middle">
          <Col span={4} className="other-label">
            {nls.localize('default')}：
          </Col>
          <Col span={20}>
            <Input
              value={data.default}
              placeholder={nls.localize('default')}
              onChange={e =>
                changeOtherValue(e.target.value, 'default', data, this.context.changeCustomValue)
              }
            />
          </Col>
        </Row>
        <Row className="other-row" type="flex" align="middle">
          <Col span={12}>
            <Row type="flex" align="middle">
              <Col span={13} className="other-label">
                <span>
                  exclusiveMinimum&nbsp;
                  <Tooltip title={nls.localize('exclusiveMinimum')}>
                    <Icon type="question-circle-o" style={{ width: '10px' }} />
                  </Tooltip>
                  &nbsp; :
                </span>
              </Col>
              <Col span={11}>
                <Switch
                  checked={data.exclusiveMinimum}
                  placeholder="exclusiveMinimum"
                  onChange={e =>
                    changeOtherValue(e, 'exclusiveMinimum', data, this.context.changeCustomValue)
                  }
                />
              </Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row type="flex" align="middle">
              <Col span={13} className="other-label">
                <span>
                  exclusiveMaximum&nbsp;
                  <Tooltip title={nls.localize('exclusiveMaximum')}>
                    <Icon type="question-circle-o" style={{ width: '10px' }} />
                  </Tooltip>
                  &nbsp; :
                </span>
              </Col>
              <Col span={11}>
                <Switch
                  checked={data.exclusiveMaximum}
                  placeholder="exclusiveMaximum"
                  onChange={e =>
                    changeOtherValue(e, 'exclusiveMaximum', data, this.context.changeCustomValue)
                  }
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="other-row" type="flex" align="middle">
          <Col span={12}>
            <Row type="flex" align="middle">
              <Col span={8} className="other-label">
                {nls.localize('minimum')}：
              </Col>
              <Col span={16}>
                <InputNumber
                  value={data.minimum}
                  placeholder={nls.localize('minimum')}
                  onChange={e =>
                    changeOtherValue(e, 'minimum', data, this.context.changeCustomValue)
                  }
                />
              </Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row type="flex" align="middle">
              <Col span={8} className="other-label">
                {nls.localize('maximum')}：
              </Col>
              <Col span={16}>
                <InputNumber
                  value={data.maximum}
                  placeholder={nls.localize('maximum')}
                  onChange={e =>
                    changeOtherValue(e, 'maximum', data, this.context.changeCustomValue)
                  }
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="other-row" type="flex" align="middle">
          <Col span={4} className="other-label">
            <span>
              {nls.localize('enum')}
              <Checkbox
                checked={this.state.checked}
                onChange={e => this.onChangeCheckBox(e.target.checked, data)}
              />{' '}
              :
            </span>
          </Col>
          <Col span={20}>
            <TextArea
              // value={data.enum && data.enum.length && data.enum.join('\n')}
              value={this.state.enum}
              disabled={!this.state.checked}
              placeholder={nls.localize('enum_msg')}
              autosize={{ minRows: 2, maxRows: 6 }}
              onChange={e => {
                this.changeEnumOtherValue(e.target.value, data)
              }}
            />
          </Col>
        </Row>
        {this.state.checked && (
          <Row className="other-row" type="flex" align="middle">
            <Col span={4} className="other-label">
              <span>{nls.localize('enum_desc')} ：</span>
            </Col>
            <Col span={20}>
              <TextArea
                value={data.enumDesc}
                disabled={!this.state.checked}
                placeholder={nls.localize('enum_desc_msg')}
                autosize={{ minRows: 2, maxRows: 6 }}
                onChange={e => {
                  this.changeEnumDescOtherValue(e.target.value, data)
                }}
              />
            </Col>
          </Row>
        )}
      </div>
    )
  }
}

const SchemaBoolean = (props, context) => {
  const { data } = props
  let value = isUndefined(data.default) ? '' : data.default ? 'true' : 'false'
  return (
    <div>
      <div className="default-setting">{nls.localize('base_setting')}</div>
      <Row className="other-row" type="flex" align="middle">
        <Col span={4} className="other-label">
          {nls.localize('default')}：
        </Col>
        <Col span={20}>
          <Select
            value={value}
            onChange={e =>
              changeOtherValue(
                e === 'true' ? true : false,
                'default',
                data,
                context.changeCustomValue
              )
            }
            style={{ width: 200 }}
          >
            <Option value="true">true</Option>
            <Option value="false">false</Option>
          </Select>
        </Col>
      </Row>
    </div>
  )
}

const SchemaArray = (props, context) => {
  const { data } = props
  return (
    <div>
      <div className="default-setting">{nls.localize('base_setting')}</div>
      <Row className="other-row" type="flex" align="middle">
        <Col span={6} className="other-label">
          <span>
            uniqueItems&nbsp;
            <Tooltip title={nls.localize('unique_items')}>
              <Icon type="question-circle-o" style={{ width: '10px' }} />
            </Tooltip>
            &nbsp; :
          </span>
        </Col>
        <Col span={18}>
          <Switch
            checked={data.uniqueItems}
            placeholder="uniqueItems"
            onChange={e => changeOtherValue(e, 'uniqueItems', data, context.changeCustomValue)}
          />
        </Col>
      </Row>
      <Row className="other-row" type="flex" align="middle">
        <Col span={12}>
          <Row type="flex" align="middle">
            <Col span={12} className="other-label">
              {nls.localize('min_items')}：
            </Col>
            <Col span={12}>
              <InputNumber
                value={data.minItems}
                placeholder="minItems"
                onChange={e => changeOtherValue(e, 'minItems', data, context.changeCustomValue)}
              />
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row type="flex" align="middle">
            <Col span={12} className="other-label">
              {nls.localize('max_items')}：
            </Col>
            <Col span={12}>
              <InputNumber
                value={data.maxItems}
                placeholder="maxItems"
                onChange={e => changeOtherValue(e, 'maxItems', data, context.changeCustomValue)}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}

const mapping = data => {
  return {
    string: <SchemaString data={data} />,
    number: <SchemaNumber data={data} />,
    boolean: <SchemaBoolean data={data} />,
    integer: <SchemaNumber data={data} />,
    array: <SchemaArray data={data} />
  }[data.type]
}

const handleInputEditor = (e, change) => {
  if (!e.text) return
  change(e.jsonData)
}

const CustomItem = (props, context) => {
  const { data } = props
  const optionForm = mapping(JSON.parse(data))

  return (
    <div>
      <div>{optionForm}</div>
      <div className="default-setting">{nls.localize('all_setting')}</div>
      <AceEditor
        data={data}
        mode="json"
        onChange={e => handleInputEditor(e, context.changeCustomValue)}
      />
    </div>
  )
}

export default CustomItem
