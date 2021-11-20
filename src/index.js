import React from 'react'
import { render } from 'react-dom'
import PropTypes from 'prop-types'
import App from './App'
import { EditorProvider } from './components/EditorContext';
import utils from './utils'
import schema from './models/schema'

function createJSONSchemaEditor(config = {}) {
  if(config.lang) utils.lang = config.lang

  const Component = props => (
    <EditorProvider>
      <App {...props} />
    </EditorProvider>
  )

  Component.propTypes = {
    data: PropTypes.string,
    onChange: PropTypes.func,
    showEditor: PropTypes.bool
  }

  return Component
}

export default createJSONSchemaEditor
