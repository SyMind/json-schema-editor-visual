import React from 'react';
import { Input, AutoComplete, Icon } from 'antd';
import PropTypes from 'prop-types';
import EditorContext from '../EditorContext'
import nls from '../../nls';

const Option = AutoComplete.Option;

export default class MockSelect extends React.Component {
  static contextType = EditorContext

  constructor(props, context) {
    super(props);
    this.state = {
      mock: ''
    };
    this.mock = context.Model.__jsonSchemaMock || [];
  }

  static propTypes = {
    schema: PropTypes.object,
    showEdit: PropTypes.func,
    onChange: PropTypes.func
  };

  render() {
    const { schema } = this.props;
    const children = this.mock.map((item) => <Option key={item.mock}>{item.mock}</Option>);

    return (
      <div>
        <AutoComplete
          className="certain-category-search"
          dropdownMatchSelectWidth={false}
          dataSource={children}
          placeholder={nls.localize('mock')}
          optionLabelProp="value"
          filterOption={true}
          value={schema.mock ? schema.mock.mock : ''}
          onChange={this.props.onChange}
          disabled={schema.type === 'object' || schema.type === 'array'}
        >
          <Input addonAfter={<Icon type="edit" onClick={(e) => {e.stopPropagation(); this.props.showEdit()}} />} />
        </AutoComplete>
      </div>
    );
  }
}
