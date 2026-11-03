import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { java } from '@codemirror/lang-java'
import { html } from '@codemirror/lang-html'

function pickLanguage({ languageHint, fileName }) {
  const hint = (languageHint || fileName || '').toLowerCase()
  if (hint.includes('python') || /\.py$/.test(hint)) return python()
  if (hint.includes('java') && !hint.includes('javascript')) return java()
  if (hint.includes('html') || hint.includes('htm')) return html()
  if (
    hint.includes('js') ||
    hint.includes('javascript') ||
    hint.includes('ts') ||
    hint.includes('tsx') ||
    hint.includes('jsx')
  )
    return javascript({ jsx: true, typescript: hint.includes('ts') })
  return javascript()
}

export default function CodeEditor({
  value,
  onChange,
  languageHint,
  fileName,
  readOnly = false,
  height = '420px',
}) {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <CodeMirror
        value={value}
        height={height}
        extensions={[pickLanguage({ languageHint, fileName })]}
        onChange={(v) => onChange?.(v)}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          foldGutter: true,
          autocompletion: true,
        }}
      />
    </div>
  )
}