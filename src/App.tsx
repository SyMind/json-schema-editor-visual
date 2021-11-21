import { useContext, FC, Component } from 'react'
import {
  Input,
  Row,
  Tooltip,
  Col,
  Select,
  Checkbox,
  Button,
  Icon,
  Modal,
  Tabs
} from 'antd'
import _ from 'underscore'
import type { JSONSchema7 } from 'json-schema'
import AceEditor from './components/AceEditor/AceEditor'
import SchemaJson from './components/SchemaComponents/SchemaJson'
import utils from './utils'
import handleSchema from './schema'
import CustomItem from './components/SchemaComponents/SchemaOther'
import nls from './nls';
import MockSelect from './components/MockSelect'
import EditerContext from './components/EditorContext'
import './index.css'

const Option = Select.Option
const { TextArea } = Input
const TabPane = Tabs.TabPane

interface JSONSchemaEditorProps {
    schema: JSONSchema7
    open: Record<string, boolean>
    data?: string
    onChange?: (data: string) => void
    showEditor?: boolean
    isMock?: boolean
    Model: any
}

interface JSONSchemaEditorState {
    visible: boolean
    show: boolean
    editVisible: boolean
    description: string
    descriptionKey?: string[]
    advVisible: boolean
    itemKey: string[]
    curItemCustomValue?: any
    checked: boolean
    editorModalName: string
    mock: string
}

class JSONSchemaEditor extends Component<JSONSchemaEditorProps, JSONSchemaEditorState> {
    Model: any
    jsonSchemaData?: JSONSchema7
    jsonData?: any
    importJsonType: 'json' | 'schema' = 'json'

    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            show: true,
            editVisible: false,
            description: '',
            descriptionKey: undefined,
            advVisible: false,
            itemKey: [],
            curItemCustomValue: undefined,
            checked: false,
            editorModalName: '', // 弹窗名称desctiption | mock
            mock: ''
        }
        this.Model = this.props.Model

        this.alterMsg = _.debounce(this.alterMsg, 2000)
    }

  // json 导入弹窗
  showModal = () => {
    this.setState({
      visible: true
    })
  }
  handleOk = () => {
    // if (this.importJsonType !== 'schema') {
    //   if (!this.jsonData) {
    //     return message.error('json 数据格式有误')
    //   }

    //   let jsonData = GenerateSchema(this.jsonData)
    //   this.Model.changeEditorSchema({ value: jsonData })
    // } else {
    //   if (!this.jsonSchemaData) {
    //     return message.error('json 数据格式有误')
    //   }
    //   this.Model.changeEditorSchema({ value: this.jsonSchemaData })
    // }
    // this.setState({ visible: false })
  }
  handleCancel = () => {
    this.setState({ visible: false })
  }

  componentWillReceiveProps(nextProps) {
    if (typeof this.props.onChange === 'function' && this.props.schema !== nextProps.schema) {
      let oldData = JSON.stringify(this.props.schema || '')
      let newData = JSON.stringify(nextProps.schema || '')
      if (oldData !== newData) return this.props.onChange(newData)
    }
    if (this.props.data && this.props.data !== nextProps.data) {
      this.Model.changeEditorSchema(JSON.parse(nextProps.data))
    }
  }

  componentWillMount() {
    let data = this.props.data
    if (!data) {
      data = `{
        "type": "object",
        "title": "title",
        "properties":{}
      }`
    }
    this.Model.changeEditorSchema(JSON.parse(data))
  }

  alterMsg = () => {
    // return message.error(nls.localize('valid_json'))
  }

  // AceEditor 中的数据
  handleParams = e => {
    if (!e.text) return
    // 将数据map 到store中
    if (e.format !== true) {
      return this.alterMsg()
    }
    handleSchema(e.jsonData)
    this.Model.changeEditorSchema(e.jsonData)
  }

  // 修改数据类型
  changeType = (key, value) => {
    this.Model.changeType([key], value)
  }

  handleImportJson = e => {
    if (!e.text || e.format !== true) {
      return (this.jsonData = null)
    }
    this.jsonData = e.jsonData
  }

  handleImportJsonSchema = e => {
    if (!e.text || e.format !== true) {
      return !!this.jsonSchemaData
    }
    this.jsonSchemaData = e.jsonData
  }
  // 增加子节点
  addChildField = key => {
    this.Model.addChildField([key])
    this.setState({ show: true })
  }

  clickIcon = () => {
    this.setState({ show: !this.state.show })
  }

  // 修改备注信息
  changeValue = (key, value) => {
    if (key[0] === 'mock') {
      value = value ? { mock: value } : ''
    }
    this.Model.changeValue(key, value)
  }

  // 备注/mock弹窗 点击ok 时
  handleEditOk = name => {
    this.setState({
      editVisible: false
    })
    let value = this.state[name]
    if (name === 'mock') {
      value = value ? { mock: value } : ''
    }
    this.Model.changeValue(this.state.descriptionKey, value)
  }

  handleEditCancel = () => {
    this.setState({
      editVisible: false
    })
  }
  /*
    展示弹窗modal
    prefix: 节点前缀信息
    name: 弹窗的名称 ['description', 'mock']
    value: 输入值
    type: 如果当前字段是object || array showEdit 不可用
  */
  showEdit = (prefix, name, value, type?) => {
    if (type === 'object' || type === 'array') {
      return
    }
    let descriptionKey = [].concat(prefix, name)

    value = name === 'mock' ? (value ? value.mock : '') : value
    this.setState({
      editVisible: true,
      [name]: value,
      descriptionKey,
      editorModalName: name
    } as any)
  }

  // 修改备注/mock参数信息
  changeDesc = (e, name) => {
    this.setState({
      [name]: e
    } as any)
  }

  // 高级设置
  handleAdvOk = () => {
    if (this.state.itemKey.length === 0) {
      this.Model.changeEditorSchema(this.state.curItemCustomValue)
    } else {
      this.Model.changeValue(this.state.itemKey, this.state.curItemCustomValue)
    }
    this.setState({
      advVisible: false
    })
  }
  handleAdvCancel = () => {
    this.setState({
      advVisible: false
    })
  }
  showAdv = (key, value) => {
    this.setState({
      advVisible: true,
      itemKey: key,
      curItemCustomValue: value // 当前节点的数据信息
    })
  }

  //  修改弹窗中的json-schema 值
  changeCustomValue = newValue => {
    this.setState({
      curItemCustomValue: newValue
    })
  }

  changeCheckBox = e => {
    this.setState({ checked: e })
    this.Model.requireAll(e, this.props.schema)
  }

  render() {
    const {
      visible,
      editVisible,
      advVisible,
      checked,
      editorModalName
    } = this.state
    const { schema } = this.props

    let disabled =
      this.props.schema.type === 'object' || this.props.schema.type === 'array' ? false : true

    return (
      <div className="json-schema-react-editor">
        <Button className="import-json-button" type="primary" onClick={this.showModal}>
          {nls.localize('import_json')}
        </Button>
        <Modal
          maskClosable={false}
          visible={visible}
          title={nls.localize('import_json')}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          className="json-schema-react-editor-import-modal"
          okText={'ok'}
          cancelText={nls.localize('cancel')}
          footer={[
            <Button key="back" onClick={this.handleCancel}>
              {nls.localize('cancel')}
            </Button>,
            <Button key="submit" type="primary" onClick={this.handleOk}>
              {nls.localize('ok')}
            </Button>
          ]}
        >
          <Tabs
            defaultActiveKey="json"
            onChange={key => {
              this.importJsonType = key as any
            }}
          >
            <TabPane tab="JSON" key="json">
              <AceEditor data="" mode="json" onChange={this.handleImportJson} />
            </TabPane>
            <TabPane tab="JSON-SCHEMA" key="schema">
              <AceEditor data="" mode="json" onChange={this.handleImportJsonSchema} />
            </TabPane>
          </Tabs>
        </Modal>

        <Modal
          title={
            <div>
              {nls.localize(editorModalName)}
              &nbsp;
              {editorModalName === 'mock' && (
                <Tooltip title={nls.localize('mockLink')}>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/YMFE/json-schema-editor-visual/issues/38"
                  >
                    <Icon type="question-circle-o" />
                  </a>
                </Tooltip>
              )}
            </div>
          }
          maskClosable={false}
          visible={editVisible}
          onOk={() => this.handleEditOk(editorModalName)}
          onCancel={this.handleEditCancel}
          okText={nls.localize('ok')}
          cancelText={nls.localize('cancel')}
        >
          <TextArea
            value={this.state[editorModalName]}
            placeholder={nls.localize(editorModalName)}
            onChange={e => this.changeDesc(e.target.value, editorModalName)}
            autosize={{ minRows: 6, maxRows: 10 }}
          />
        </Modal>

        {advVisible && (
          <Modal
            title={nls.localize('adv_setting')}
            maskClosable={false}
            visible={advVisible}
            onOk={this.handleAdvOk}
            onCancel={this.handleAdvCancel}
            okText={nls.localize('ok')}
            width={780}
            cancelText={nls.localize('cancel')}
            className="json-schema-react-editor-adv-modal"
          >
            <CustomItem data={JSON.stringify(this.state.curItemCustomValue, null, 2)} />
          </Modal>
        )}

        <Row>
          {this.props.showEditor && (
            <Col span={8}>
              <AceEditor
                className="pretty-editor"
                mode="json"
                data={JSON.stringify(schema, null, 2)}
                onChange={this.handleParams}
              />
            </Col>
          )}
          <Col span={this.props.showEditor ? 16 : 24} className="wrapper object-style">
            <Row type="flex" align="middle">
              <Col span={8} className="col-item name-item col-item-name">
                <Row type="flex" justify="space-around" align="middle">
                  <Col span={2} className="down-style-col">
                    {schema.type === 'object' ? (
                      <span className="down-style" onClick={this.clickIcon}>
                        {this.state.show ? (
                          <Icon className="icon-object" type="caret-down" />
                        ) : (
                          <Icon className="icon-object" type="caret-right" />
                        )}
                      </span>
                    ) : null}
                  </Col>
                  <Col span={22}>
                    <Input
                      addonAfter={
                        <Tooltip placement="top" title={'checked_all'}>
                          <Checkbox
                            checked={checked}
                            disabled={disabled}
                            onChange={e => this.changeCheckBox(e.target.checked)}
                          />
                        </Tooltip>
                      }
                      disabled
                      value="root"
                    />
                  </Col>
                </Row>
              </Col>
              <Col span={3} className="col-item col-item-type">
                <Select
                  className="type-select-style"
                  onChange={e => this.changeType(`type`, e)}
                  value={schema.type || 'object'}
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
              {this.props.isMock && (
                <Col span={3} className="col-item col-item-mock">
                  <MockSelect
                    schema={schema}
                    showEdit={() => this.showEdit([], 'mock', (schema as any).mock, schema.type)}
                    onChange={value => this.changeValue(['mock'], value)}
                  />
                </Col>
              )}
              <Col span={this.props.isMock ? 4 : 5} className="col-item col-item-mock">
                <Input
                  addonAfter={
                    <Icon
                      type="edit"
                      onClick={() =>
                        this.showEdit([], 'title', this.props.schema.title)
                      }
                    />
                  }
                  placeholder={nls.localize('title')}
                  value={this.props.schema.title}
                  onChange={e => this.changeValue(['title'], e.target.value)}
                />
              </Col>
              <Col span={this.props.isMock ? 4 : 5} className="col-item col-item-desc">
                <Input
                  addonAfter={
                    <Icon
                      type="edit"
                      onClick={() =>
                        this.showEdit([], 'description', this.props.schema.description)
                      }
                    />
                  }
                  placeholder={nls.localize('description')}
                  value={schema.description}
                  onChange={e => this.changeValue(['description'], e.target.value)}
                />
              </Col>
              <Col span={2} className="col-item col-item-setting">
                <span className="adv-set" onClick={() => this.showAdv([], this.props.schema)}>
                  <Tooltip placement="top" title={nls.localize('adv_setting')}>
                    <Icon type="setting" />
                  </Tooltip>
                </span>
                {schema.type === 'object' ? (
                  <span onClick={() => this.addChildField('properties')}>
                    <Tooltip placement="top" title={nls.localize('add_child_node')}>
                      <Icon type="plus" className="plus" />
                    </Tooltip>
                  </span>
                ) : null}
              </Col>
            </Row>
            {this.state.show && (
              <SchemaJson
                data={this.props.schema}
                showEdit={this.showEdit}
                showAdv={this.showAdv}
              />
            )}
          </Col>
        </Row>
      </div>
    )
  }
}

type JSONSchemaEditorConnectProps = Exclude<JSONSchemaEditorProps, 'Model'>

const JSONSchemaEditorConnect: FC<JSONSchemaEditorConnectProps> = ({...props}) => {
    const editorContext = useContext(EditerContext)

    return (
        <JSONSchemaEditor
            {...props}
            schema={editorContext.schema}
            open={editorContext.open}
            Model={editorContext}
        />
    )
}

export default JSONSchemaEditorConnect
