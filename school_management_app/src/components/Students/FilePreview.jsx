import { useEffect, useState } from 'react'
import { FaSpinner, FaDownload, FaFile } from 'react-icons/fa'

const TEXT_EXT = new Set([
  'txt', 'md', 'csv', 'json', 'xml', 'yml', 'yaml',
  'py', 'js', 'jsx', 'ts', 'tsx', 'java', 'c', 'cpp', 'cs',
  'rb', 'go', 'rs', 'php', 'swift', 'kt',
  'html', 'htm', 'css', 'scss', 'sql', 'sh', 'bash',
])

function extFromName(name = '') {
  return name.split('.').pop()?.toLowerCase() || ''
}

export default function FilePreview({ url, name, onClose }) {
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState(null)
  const ext = extFromName(name)
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext)
  const isPdf = ext === 'pdf'
  const isText = TEXT_EXT.has(ext)

  useEffect(() => {
    if (!isText || !url) return
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to load file')
        const t = await res.text()
        if (!cancelled) setText(t)
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [url, isText])

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 min-w-0">
            <FaFile className="text-[#faa853]" />
            <p className="text-sm font-medium text-[#2d3f5d] truncate">{name}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <FaDownload /> Download
            </a>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-xl leading-none px-2"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50">
          {loading && (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <FaSpinner className="animate-spin mr-2" /> Loading preview…
            </div>
          )}
          {error && <div className="p-6 text-sm text-red-700">{error}</div>}
          {!loading && !error && isPdf && (
            <iframe src={url} title={name} className="w-full h-[70vh] border-0" />
          )}
          {!loading && !error && isImage && (
            <div className="p-6 flex items-center justify-center">
              <img src={url} alt={name} className="max-w-full max-h-[70vh]" />
            </div>
          )}
          {!loading && !error && isText && (
            <pre className="p-4 text-xs bg-white m-0 whitespace-pre-wrap break-words font-mono">
              {text || '(empty)'}
            </pre>
          )}
          {!loading && !error && !isPdf && !isImage && !isText && (
            <div className="p-10 text-center text-sm text-gray-600">
              Preview not available for this file type.
              <br />
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-[#faa853] hover:underline inline-flex items-center gap-1 mt-2"
              >
                <FaDownload /> Download to view
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}