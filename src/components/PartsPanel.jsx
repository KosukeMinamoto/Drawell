import React, { useState } from 'react'
import PartIcon from './PartIcon'
import { partsCategories } from '../data/partsData'
import './PartsPanel.css'

function PartsPanel({ onAddShape }) {
  const [activeTab, setActiveTab] = useState(partsCategories[0].id)

  const activeCategory = partsCategories.find(cat => cat.id === activeTab) || partsCategories[0]

  return (
    <div className="parts-panel">
      <h2>Parts</h2>
      <div className="parts-tabs">
        {partsCategories.map((category) => (
          <button
            key={category.id}
            className={`parts-tab ${activeTab === category.id ? 'active' : ''}`}
            onClick={() => setActiveTab(category.id)}
            title={category.label}
          >
            {category.label}
          </button>
        ))}
      </div>
      <div className="parts-list">
        {activeCategory.parts.map((part) => (
          <button
            key={part.type}
            className="part-button"
            onClick={() => onAddShape(part.type)}
            title={`Add ${part.label}`}
          >
            {['rect', 'circle', 'line', 'triangle', 'trapezoid', 'ellipse', 'polygon', 'text', 'omission-wave', 'omission-slash', 'omission-dot'].includes(part.type) ? (
              <div className={`part-icon ${part.type}-icon`}></div>
            ) : (
              <div className="part-icon-svg">
                <PartIcon type={part.type} />
              </div>
            )}
            <span>{part.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default PartsPanel
