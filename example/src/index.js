import React from 'react'
import { render } from 'react-dom'
import createJSONSchemaEditor from '@sharp/json-schema-editor-visual'
import 'antd/dist/antd.css'

// if (process.env.NODE_ENV !== 'production') {
//   window.Perf = require('react-addons-perf')
// }
// //import '../dist/main.css'
// const jeditor = require('../package/index.js')

const mock = [
  { name: '字符串', mock: '@string' },
  { name: '自然数', mock: '@natural' },
  { name: '浮点数', mock: '@float' },
  { name: '字符', mock: '@character' },
  { name: '布尔', mock: '@boolean' },
  { name: 'url', mock: '@url' },
  { name: '域名', mock: '@domain' },
  { name: 'ip地址', mock: '@ip' },
  { name: 'id', mock: '@id' },
  { name: 'guid', mock: '@guid' },
  { name: '当前时间', mock: '@now' },
  { name: '时间戳', mock: '@timestamp' }
]

const JEditor = createJSONSchemaEditor({ mock })

render(
  <div>
    <a target="_blank" href="https://github.com/YMFE/json-schema-editor-visual">
      <h1>JSON-Schema-Editor</h1>
    </a>
    <p style={{ fontSize: '16px' }}>
      A json-schema editor of high efficient and easy-to-use, base on React.&nbsp;
      <a target="_blank" href="https://github.com/YMFE/json-schema-editor-visual">
        Github
      </a>
    </p>
    <br />
    <h3>
      该工具已被用于开源接口管理平台：{' '}
      <a target="_blank" href="https://github.com/ymfe/yapi">
        YApi
      </a>
    </h3>

    <br />
    <h2>Example:</h2>
    <hr />

    <JEditor
      showEditor={true}
      isMock={false}
      data={''}
      onChange={e => {
        console.log('changeValue', e)
      }}
    />
  </div>,
  document.getElementById('root')
)
