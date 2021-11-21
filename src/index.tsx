import PropTypes from 'prop-types'
import App from './App'
import { EditorProvider } from './components/EditorContext';
import nls from './nls'

interface JSONSchemaEditorConfig {
  lang?: string
}

function createJSONSchemaEditor(config: JSONSchemaEditorConfig = {}) {
  if(config.lang) nls.lang = config.lang

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
