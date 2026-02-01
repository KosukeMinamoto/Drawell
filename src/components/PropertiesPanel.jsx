import React from 'react'
import { partsCategories } from '../data/partsData'
import { PATTERN_TYPES, PATTERN_LABELS } from '../utils/patternGenerator'
import './PropertiesPanel.css'

function PropertiesPanel({ 
  selectedShape, 
  selectedShapes,
  onDeleteShape,
  onDeleteShapes,
  onUpdateShape,
}) {
  const getTypeLabel = (type) => {
    for (const category of partsCategories) {
      const part = category.parts.find(p => p.type === type)
      if (part) {
        return part.label
      }
    }
    return type
  }

  return (
    <div className="properties-panel">
      <h2>Properties</h2>
      {selectedShape ? (
        <div className="properties-content">
          <div className="property-item">
            <label>Type</label>
            <div className="property-value">{getTypeLabel(selectedShape.type)}</div>
          </div>
          {selectedShape.type !== 'group' && (
            <>
              <div className="property-item">
                <label>X</label>
                <input
                  type="number"
                  step="any"
                  value={selectedShape.x ?? ''}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value)
                    if (!Number.isNaN(v)) onUpdateShape(selectedShape.id, { x: v })
                  }}
                  className="property-input"
                />
              </div>
              <div className="property-item">
                <label>Y</label>
                <input
                  type="number"
                  step="any"
                  value={selectedShape.y ?? ''}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value)
                    if (!Number.isNaN(v)) onUpdateShape(selectedShape.id, { y: v })
                  }}
                  className="property-input"
                />
              </div>
              <div className="property-item">
                <label>Width</label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  value={selectedShape.width ?? ''}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value)
                    if (!Number.isNaN(v) && v > 0) onUpdateShape(selectedShape.id, { width: v })
                  }}
                  className="property-input"
                />
              </div>
              {selectedShape.type !== 'circle' && (
                <div className="property-item">
                  <label>Height</label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    value={selectedShape.height ?? ''}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value)
                      if (!Number.isNaN(v) && v > 0) onUpdateShape(selectedShape.id, { height: v })
                    }}
                    className="property-input"
                  />
                </div>
              )}
              {selectedShape.type === 'circle' && (
                <div className="property-item">
                  <label>Radius</label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    value={selectedShape.width != null ? selectedShape.width / 2 : ''}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value)
                      if (!Number.isNaN(v) && v > 0) onUpdateShape(selectedShape.id, { width: v * 2, height: v * 2 })
                    }}
                    className="property-input"
                  />
                </div>
              )}
              <div className="property-item">
                <label>Rotation (°)</label>
                <input
                  type="number"
                  step="any"
                  value={selectedShape.rotation ?? 0}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value)
                    if (!Number.isNaN(v)) onUpdateShape(selectedShape.id, { rotation: v })
                  }}
                  className="property-input"
                />
              </div>
              {['rect', 'circle', 'line', 'triangle', 'trapezoid', 'ellipse', 'polygon'].includes(selectedShape.type) && (
                <div className="property-item">
                  <label>Fill color</label>
                  <input
                    type="color"
                    value={(selectedShape.fill && selectedShape.fill !== 'transparent') ? selectedShape.fill : '#e8e8e8'}
                    onChange={(e) => onUpdateShape(selectedShape.id, { fill: e.target.value })}
                    className="property-input property-color-input"
                    title="Transparent shows as gray in picker"
                  />
                </div>
              )}
              <div className="property-item">
                <label>Stroke color</label>
                <input
                  type="color"
                  value={selectedShape.stroke ?? '#2E5C8A'}
                  onChange={(e) => onUpdateShape(selectedShape.id, { stroke: e.target.value })}
                  className="property-input property-color-input"
                />
              </div>
              <div className="property-item">
                <label>Stroke width</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={selectedShape.strokeWidth ?? 2}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value)
                    if (!Number.isNaN(v) && v >= 0.5) onUpdateShape(selectedShape.id, { strokeWidth: v })
                  }}
                  className="property-input"
                />
              </div>
              <div className="property-item">
                <label>Opacity (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round((selectedShape.opacity !== undefined ? selectedShape.opacity : 1) * 100)}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10)
                    if (!Number.isNaN(v)) onUpdateShape(selectedShape.id, { opacity: Math.max(0, Math.min(100, v)) / 100 })
                  }}
                  className="property-input"
                />
              </div>
            </>
          )}
          {selectedShape.type === 'text' && (
            <>
              <div className="property-item">
                <label>Text</label>
                <textarea
                  rows={3}
                  value={selectedShape.text ?? 'Text'}
                  onChange={(e) => onUpdateShape(selectedShape.id, { text: e.target.value })}
                  className="property-input"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
              <div className="property-item">
                <label>Font size</label>
                <input
                  type="number"
                  min="8"
                  max="120"
                  value={selectedShape.fontSize ?? 16}
                  onChange={(e) => onUpdateShape(selectedShape.id, { fontSize: Math.max(8, Math.min(120, parseInt(e.target.value) || 16)) })}
                  className="property-input"
                />
              </div>
            </>
          )}
          {selectedShape && selectedShape.type === 'perforation' && (
            <div className="property-item">
              <label>Triangle count (n)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={selectedShape.perforationCount !== undefined ? selectedShape.perforationCount : 5}
                onChange={(e) => {
                  const count = parseInt(e.target.value) || 5
                  onUpdateShape(selectedShape.id, { perforationCount: Math.max(1, Math.min(20, count)) })
                }}
                className="property-input"
              />
            </div>
          )}
          {selectedShape && selectedShape.type !== 'rect' && selectedShape.type !== 'circle' && (
            <div className="property-item">
              <label>Fill pattern</label>
              <div className="pattern-selector">
                {Object.entries(PATTERN_TYPES).map(([key, value]) => (
                  <button
                    key={value}
                    className={`pattern-button ${selectedShape.fillPattern === value ? 'active' : ''}`}
                    onClick={() => onUpdateShape(selectedShape.id, { fillPattern: value })}
                    title={PATTERN_LABELS[value]}
                  >
                    {PATTERN_LABELS[value]}
                  </button>
                ))}
              </div>
              {selectedShape.fillPattern && selectedShape.fillPattern !== PATTERN_TYPES.SOLID && (
                <div className="pattern-options">
                  <div className="pattern-option-item">
                    <label>Color</label>
                    <input
                      type="color"
                      value={selectedShape.fillPatternColor || '#000000'}
                      onChange={(e) => onUpdateShape(selectedShape.id, { fillPatternColor: e.target.value })}
                    />
                  </div>
                  <div className="pattern-option-item">
                    <label>Size</label>
                    <input
                      type="number"
                      min="4"
                      max="32"
                      value={selectedShape.fillPatternSize || 12}
                      onChange={(e) => onUpdateShape(selectedShape.id, { fillPatternSize: parseInt(e.target.value) || 12 })}
                    />
                  </div>
                </div>
              )}
              {selectedShape.fillPattern === PATTERN_TYPES.SOLID && (
                <div className="pattern-options">
                  <div className="pattern-option-item">
                    <label>Color</label>
                    <input
                      type="color"
                      value={selectedShape.fillPatternColor || '#000000'}
                      onChange={(e) => onUpdateShape(selectedShape.id, { fillPatternColor: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="property-actions">
            <button
              className="delete-button"
              onClick={() => selectedShapes?.length > 1 ? onDeleteShapes(selectedShapes.map(s => s.id)) : onDeleteShape(selectedShape.id)}
              title="Delete selected (Delete/Backspace)"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="properties-empty">
          <p>Select a shape</p>
        </div>
      )}
    </div>
  )
}

export default PropertiesPanel
