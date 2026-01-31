import React, { useRef, useState } from 'react'
import './Toolbar.css'

function Toolbar({
  onSave,
  onLoad,
  onExportImage,
  selectedShape,
  selectedShapes,
  onSendToFront,
  onSendToBack,
  onRotateModeChange,
  rotateMode,
  onDuplicateShape,
  onDeleteShape,
  onDeleteShapes,
  onAlignShapes,
  onGroupShapes,
  onUngroupShapes,
  onPasteImage,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) {
  const fileInputRef = useRef(null)
  const [exportOpen, setExportOpen] = useState(false)

  const hasSelection = selectedShape || (selectedShapes && selectedShapes.length > 0)
  const hasSingle = selectedShape && selectedShape.type !== 'group'
  const hasMultiple = selectedShapes && selectedShapes.length > 1
  const isGroup = selectedShape && selectedShape.type === 'group'

  const handleLoadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result)
          onLoad(data)
        } catch (error) {
          alert('Failed to load file. Please select a valid JSON file.')
        }
      }
      reader.readAsText(file)
    }
    e.target.value = ''
  }

  const handleExport = (format, cropToContent) => {
    const mimeTypes = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' }
    const ext = format === 'jpeg' ? 'jpg' : format
    onExportImage({ mimeType: mimeTypes[format], format, cropToContent })
    setExportOpen(false)
  }

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <button className="toolbar-button" onClick={onSave} title="Save project">
          💾 Save
        </button>
        <button className="toolbar-button" onClick={handleLoadClick} title="Load project">
          📂 Load
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
      <div className="toolbar-section">
        <button
          className="toolbar-button toolbar-button-ghost"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
        >
          ↩️ Undo
        </button>
        <button
          className="toolbar-button toolbar-button-ghost"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
        >
          ↪️ Redo
        </button>
      </div>
      <div className="toolbar-section toolbar-section-edit">
        <button
          className="toolbar-button toolbar-button-edit"
          onClick={() => hasSelection && onSendToFront(selectedShape?.id)}
          disabled={!hasSelection}
          title="Bring to front"
        >
          ⬆️ Front
        </button>
        <button
          className="toolbar-button toolbar-button-edit"
          onClick={() => hasSelection && onSendToBack(selectedShape?.id)}
          disabled={!hasSelection}
          title="Send to back"
        >
          ⬇️ Back
        </button>
        <button
          className={`toolbar-button toolbar-button-edit ${rotateMode ? 'active' : ''}`}
          onClick={() => onRotateModeChange && onRotateModeChange(!rotateMode)}
          disabled={!hasSelection}
          title={rotateMode ? 'Rotate mode' : 'Resize mode'}
        >
          {rotateMode ? '🔄 Rotate' : '↔️ Resize'}
        </button>
        <button
          className="toolbar-button toolbar-button-edit"
          onClick={() => hasSingle && onDuplicateShape(selectedShape.id)}
          disabled={!hasSingle}
          title="Duplicate"
        >
          📋 Duplicate
        </button>
        <button
          className="toolbar-button toolbar-button-delete"
          onClick={() => {
            if (hasMultiple) onDeleteShapes(selectedShapes.map(s => s.id))
            else if (selectedShape) onDeleteShape(selectedShape.id)
          }}
          disabled={!hasSelection}
          title="Delete"
        >
          🗑️ Delete
        </button>
      </div>
      {hasMultiple && (
        <div className="toolbar-section">
          <div className="toolbar-align-group">
            <button
              className="toolbar-button toolbar-button-small"
              onClick={() => onAlignShapes('top')}
              title="Align top"
            >
              ⬆️
            </button>
            <button
              className="toolbar-button toolbar-button-small"
              onClick={() => onAlignShapes('bottom')}
              title="Align bottom"
            >
              ⬇️
            </button>
            <button
              className="toolbar-button toolbar-button-small"
              onClick={() => onAlignShapes('left')}
              title="Align left"
            >
              ⬅️
            </button>
            <button
              className="toolbar-button toolbar-button-small"
              onClick={() => onAlignShapes('right')}
              title="Align right"
            >
              ➡️
            </button>
            <button
              className="toolbar-button toolbar-button-small"
              onClick={() => onAlignShapes('center')}
              title="Align center (horizontal)"
            >
              ↕️
            </button>
            <button
              className="toolbar-button toolbar-button-small"
              onClick={() => onAlignShapes('middle')}
              title="Align middle (vertical)"
            >
              ↔️
            </button>
          </div>
          <button
            className="toolbar-button toolbar-button-edit"
            onClick={() => onGroupShapes(selectedShapes.map(s => s.id))}
            title="Group"
          >
            📦 Group
          </button>
        </div>
      )}
      {isGroup && (
        <div className="toolbar-section">
          <button
            className="toolbar-button toolbar-button-edit"
            onClick={() => onUngroupShapes(selectedShape.id)}
            title="Ungroup"
          >
            📦 Ungroup
          </button>
        </div>
      )}
      <div className="toolbar-section">
        <button
          className="toolbar-button toolbar-button-ghost"
          onClick={onPasteImage}
          title="Paste image from clipboard (Ctrl+V)"
        >
          🖼️ Paste Image
        </button>
      </div>
      <div className="toolbar-section toolbar-export-wrap">
        <div className="toolbar-export-trigger">
          <button
            className="toolbar-button"
            onClick={() => setExportOpen(!exportOpen)}
            title="Export image"
          >
            🖼️ Export ▼
          </button>
          {exportOpen && (
            <>
              <div className="toolbar-export-backdrop" onClick={() => setExportOpen(false)} />
              <div className="toolbar-export-dropdown">
                <div className="toolbar-export-label">Format &amp; area</div>
                <button className="toolbar-export-option" onClick={() => handleExport('png', false)}>
                  PNG (full canvas)
                </button>
                <button className="toolbar-export-option" onClick={() => handleExport('png', true)}>
                  PNG (crop to content)
                </button>
                <button className="toolbar-export-option" onClick={() => handleExport('jpeg', false)}>
                  JPEG (full canvas)
                </button>
                <button className="toolbar-export-option" onClick={() => handleExport('jpeg', true)}>
                  JPEG (crop to content)
                </button>
                <button className="toolbar-export-option" onClick={() => handleExport('webp', false)}>
                  WebP (full canvas)
                </button>
                <button className="toolbar-export-option" onClick={() => handleExport('webp', true)}>
                  WebP (crop to content)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Toolbar
