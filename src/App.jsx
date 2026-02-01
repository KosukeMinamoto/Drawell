import React, { useState, useRef, useEffect, useCallback } from 'react'
import Canvas from './components/Canvas'
import PartsPanel from './components/PartsPanel'
import PropertiesPanel from './components/PropertiesPanel'
import Toolbar from './components/Toolbar'
import './App.css'

function App() {
  const [selectedShape, setSelectedShape] = useState(null)
  const [selectedShapes, setSelectedShapes] = useState([]) // 複数選択対応
  const [shapes, setShapes] = useState([])
  const canvasRef = useRef(null)
  
  const [history, setHistory] = useState([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [clipboard, setClipboard] = useState(null)
  const [rotateMode, setRotateMode] = useState(false)
  const [flipMode, setFlipMode] = useState(false)
  const addToHistory = useCallback((newShapes) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newShapes)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setShapes(JSON.parse(JSON.stringify(history[newIndex])))
      setSelectedShape(null)
      setSelectedShapes([])
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setShapes(JSON.parse(JSON.stringify(history[newIndex])))
      setSelectedShape(null)
      setSelectedShapes([])
    }
  }, [history, historyIndex])

  const addShape = async (type) => {
    const basicShapes = {
      'rect': { width: 80, height: 60 },
      'circle': { width: 60, height: 60 },
      'line': { width: 100, height: 2 },
      'triangle': { width: 60, height: 60 },
      'trapezoid': { width: 80, height: 60 },
      'ellipse': { width: 80, height: 60 },
      'polygon': { width: 60, height: 60 },
      'text': { width: 120, height: 32 },
    }

    if (basicShapes[type]) {
      const isText = type === 'text'
      const newShape = {
        id: Date.now(),
        type,
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200,
        width: basicShapes[type].width,
        height: basicShapes[type].height,
        fill: 'transparent',
        stroke: '#2E5C8A',
        strokeWidth: 2,
        zIndex: shapes.length,
        ...(isText && { text: 'Text', fontSize: 16 }),
      }
      const newShapes = [...shapes, newShape]
      setShapes(newShapes)
      addToHistory(newShapes)
      return
    }

    if (type === 'omission-wave' || type === 'omission-slash' || type === 'omission-dot') {
      const newShape = {
        id: Date.now(),
        type,
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200,
        width: 100,
        height: 20,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 2,
        zIndex: shapes.length,
      }
      const newShapes = [...shapes, newShape]
      setShapes(newShapes)
      addToHistory(newShapes)
      return
    }

    if (type === 'casing') {
      const newShape = {
        id: Date.now(),
        type: 'casing',
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200,
        width: 43,
        height: 240,
        casingLineLength: 200,
        casingTriangleWidth: 40,
        fill: '#4A90E2',
        stroke: '#2E5C8A',
        strokeWidth: 2,
        zIndex: shapes.length,
      }
      const newShapes = [...shapes, newShape]
      setShapes(newShapes)
      addToHistory(newShapes)
      return
    }

    try {
      const { loadSvg, parseSvgDimensions } = await import('./utils/svgLoader')
      const svgString = await loadSvg(type)
      
      let width = 80
      let height = 80

      if (svgString) {
        const dimensions = parseSvgDimensions(svgString)
        if (dimensions) {
          const baseSize = 80
          if (dimensions.aspectRatio > 1) {
            // 横長の場合
            width = baseSize * dimensions.aspectRatio
            height = baseSize
          } else {
            // 縦長の場合
            width = baseSize
            height = baseSize / dimensions.aspectRatio
          }
        }
      }

      const newShape = {
        id: Date.now(),
        type,
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200,
        width,
        height,
        fill: '#4A90E2',
        stroke: '#2E5C8A',
        strokeWidth: 2,
        zIndex: shapes.length,
        // Perforationタイプの場合、デフォルトの三角形の個数を設定
        ...(type === 'perforation' && { perforationCount: 5 }),
      }
      const newShapes = [...shapes, newShape]
      setShapes(newShapes)
      addToHistory(newShapes)
    } catch (error) {
      console.error('Error adding shape:', error)
      const newShape = {
        id: Date.now(),
        type,
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200,
        width: 80,
        height: 80,
        fill: '#4A90E2',
        stroke: '#2E5C8A',
        strokeWidth: 2,
        zIndex: shapes.length,
      }
      const newShapes = [...shapes, newShape]
      setShapes(newShapes)
      addToHistory(newShapes)
    }
  }

  const updateShape = (id, updates) => {
    const newShapes = shapes.map(shape => 
      shape.id === id ? { ...shape, ...updates } : shape
    )
    setShapes(newShapes)
    addToHistory(newShapes)
  }

  const deleteShape = (id) => {
    const newShapes = shapes.filter(shape => shape.id !== id)
    setShapes(newShapes)
    addToHistory(newShapes)
    if (selectedShape?.id === id) {
      setSelectedShape(null)
    }
    setSelectedShapes(selectedShapes.filter(s => s.id !== id))
  }

  const deleteShapes = (ids) => {
    const newShapes = shapes.filter(shape => !ids.includes(shape.id))
    setShapes(newShapes)
    addToHistory(newShapes)
    setSelectedShape(null)
    setSelectedShapes([])
  }

  const handleFlipHorizontal = (id) => {
    const shape = shapes.find(s => s.id === id)
    if (!shape || shape.type === 'group') return
    const next = (shape.scaleX ?? 1) * -1
    updateShape(id, { scaleX: next })
    setFlipMode(false)
  }

  const handleFlipVertical = (id) => {
    const shape = shapes.find(s => s.id === id)
    if (!shape || shape.type === 'group') return
    const next = (shape.scaleY ?? 1) * -1
    updateShape(id, { scaleY: next })
    setFlipMode(false)
  }

  const duplicateShape = (id) => {
    const shape = shapes.find(s => s.id === id)
    if (!shape || shape.type === 'group') return
    const maxZ = Math.max(0, ...shapes.map(s => s.zIndex ?? 0))
    const copy = {
      ...JSON.parse(JSON.stringify(shape)),
      id: Date.now(),
      x: shape.x + 20,
      y: shape.y + 20,
      zIndex: maxZ + 1,
    }
    const newShapes = [...shapes, copy]
    setShapes(newShapes)
    addToHistory(newShapes)
    setSelectedShape(copy)
    setSelectedShapes([copy])
  }

  const sendToFront = (id) => {
    if (!shapes.some(s => s.id === id)) return
    const maxZ = Math.max(...shapes.map(s => s.zIndex || 0))
    updateShape(id, { zIndex: maxZ + 1 })
  }

  const sendToBack = (id) => {
    if (!shapes.some(s => s.id === id)) return
    const minZ = Math.min(...shapes.map(s => s.zIndex || 0))
    updateShape(id, { zIndex: minZ - 1 })
  }

  const groupShapes = (ids) => {
    if (ids.length < 2) return
    
    const selectedShapesList = shapes.filter(s => ids.includes(s.id))
    if (selectedShapesList.length < 2) return

    const groupId = Date.now()
    const newShapes = shapes.map(shape => {
      if (ids.includes(shape.id)) {
        return {
          ...shape,
          groupId: groupId,
        }
      }
      return shape
    })

    setShapes(newShapes)
    addToHistory(newShapes)

    const groupShape = {
      id: groupId,
      type: 'group',
      children: ids,
    }
    setSelectedShape(groupShape)
    setSelectedShapes([])
  }

  const ungroupShapes = (groupId) => {
    const newShapes = shapes.map(shape => {
      if (shape.groupId === groupId) {
        const { groupId: _, ...rest } = shape
        return rest
      }
      return shape
    })

    setShapes(newShapes)
    addToHistory(newShapes)
    setSelectedShape(null)
    setSelectedShapes([])
  }

  const alignShapes = (alignment) => {
    if (selectedShapes.length < 2) return

    const shapesToAlign = selectedShapes.map(s => shapes.find(shape => shape.id === s.id)).filter(Boolean)
    if (shapesToAlign.length < 2) return

    const getW = (s) => s.width || 80
    const getH = (s) => s.height || 80
    let referenceValue = 0
    if (alignment === 'top') {
      referenceValue = Math.min(...shapesToAlign.map(s => s.y - getH(s) / 2))
    } else if (alignment === 'bottom') {
      referenceValue = Math.max(...shapesToAlign.map(s => s.y + getH(s) / 2))
    } else if (alignment === 'middle') {
      referenceValue = shapesToAlign.reduce((a, s) => a + s.y, 0) / shapesToAlign.length
    } else if (alignment === 'left') {
      referenceValue = Math.min(...shapesToAlign.map(s => s.x - getW(s) / 2))
    } else if (alignment === 'right') {
      referenceValue = Math.max(...shapesToAlign.map(s => s.x + getW(s) / 2))
    } else if (alignment === 'center') {
      referenceValue = shapesToAlign.reduce((a, s) => a + s.x, 0) / shapesToAlign.length
    }

    const newShapes = shapes.map(shape => {
      const selectedShape = shapesToAlign.find(s => s.id === shape.id)
      if (!selectedShape) return shape
      const updates = { ...shape }
      const w = getW(shape)
      const h = getH(shape)
      if (alignment === 'top') updates.y = referenceValue + h / 2
      else if (alignment === 'bottom') updates.y = referenceValue - h / 2
      else if (alignment === 'middle') updates.y = referenceValue
      else if (alignment === 'left') updates.x = referenceValue + w / 2
      else if (alignment === 'right') updates.x = referenceValue - w / 2
      else if (alignment === 'center') updates.x = referenceValue
      return updates
    })

    setShapes(newShapes)
    addToHistory(newShapes)
  }

  const copyShapes = useCallback(() => {
    const shapesToCopy = selectedShape 
      ? [selectedShape] 
      : selectedShapes.length > 0 
        ? selectedShapes 
        : []
    
    if (shapesToCopy.length > 0) {
      setClipboard(shapesToCopy.map(s => JSON.parse(JSON.stringify(s))))
    }
  }, [selectedShape, selectedShapes])

  const pasteShapes = useCallback(() => {
    if (!clipboard || clipboard.length === 0) return

    const offset = 20
    const newShapes = clipboard.map((shape, index) => ({
      ...shape,
      id: Date.now() + index,
      x: shape.x + offset,
      y: shape.y + offset,
      width: shape.width,
      height: shape.height,
    }))

    const newShapesList = [...shapes, ...newShapes]
    setShapes(newShapesList)
    addToHistory(newShapesList)
    setSelectedShape(newShapes[0])
    setSelectedShapes(newShapes)
  }, [clipboard, shapes, addToHistory])

  const handleSave = () => {
    const projectData = {
      version: '2.0',
      createdAt: new Date().toISOString(),
      shapes: shapes,
    }
    const dataStr = JSON.stringify(projectData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `drawell-project-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleLoad = (data) => {
    if (data.shapes && Array.isArray(data.shapes)) {
      const version = parseFloat(data.version) || 1
      const shapesWithZIndex = data.shapes.map((shape, index) => {
        let s = { ...shape, zIndex: shape.zIndex !== undefined ? shape.zIndex : index }
        if (shape.type !== 'group' && version < 2) {
          const w = s.width ?? 80
          const h = s.height ?? 80
          s = { ...s, x: (s.x ?? 0) + w / 2, y: (s.y ?? 0) + h / 2 }
        }
        return s
      })
      setShapes(shapesWithZIndex)
      setSelectedShape(null)
      setSelectedShapes([])
      addToHistory(shapesWithZIndex)
      alert('Project loaded.')
    } else {
      alert('Invalid project file.')
    }
  }

  const handleExportImage = (options = {}) => {
    if (canvasRef.current) {
      canvasRef.current.exportImage(options)
    }
  }

  const handlePasteImage = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read().catch(() => [])
      for (const item of items) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg') || item.types.includes('image/webp')) {
          const blob = await item.getType(item.types.find(t => t.startsWith('image/')))
          const dataUrl = await new Promise((resolve, reject) => {
            const r = new FileReader()
            r.onload = () => resolve(r.result)
            r.onerror = reject
            r.readAsDataURL(blob)
          })
          const img = new window.Image()
          img.onload = () => {
            const w = Math.min(img.width, 400)
            const h = (img.height / img.width) * w
            const newShape = {
              id: Date.now(),
              type: 'image',
              x: 200 + Math.random() * 200,
              y: 200 + Math.random() * 200,
              width: w,
              height: h,
              src: dataUrl,
              zIndex: 0,
              opacity: 1,
            }
            setShapes(prev => {
              newShape.zIndex = prev.length
              const next = [...prev, newShape]
              addToHistory(next)
              setSelectedShape(newShape)
              setSelectedShapes([newShape])
              return next
            })
          }
          img.src = dataUrl
          return
        }
      }
      alert('No image in clipboard.')
    } catch (err) {
      console.error(err)
      alert('Could not read clipboard. Try pasting with Ctrl+V (Cmd+V) while the canvas is focused.')
    }
  }, [addToHistory])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + C: コピー
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault()
        copyShapes()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        if (selectedShape && selectedShape.type !== 'group') {
          duplicateShape(selectedShape.id)
        }
      }
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && (selectedShape || selectedShapes.length > 0)) {
        e.preventDefault()
        if (selectedShapes.length > 0) {
          deleteShapes(selectedShapes.map(s => s.id))
        } else if (selectedShape) {
          deleteShape(selectedShape.id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedShape, selectedShapes, copyShapes, undo, redo, deleteShape, deleteShapes, duplicateShape])

  useEffect(() => {
    const handlePaste = (e) => {
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return
      }
      const items = e.clipboardData?.items
      if (items) {
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            e.preventDefault()
            const blob = item.getAsFile()
            if (blob) {
              const reader = new FileReader()
              reader.onload = () => {
                const dataUrl = reader.result
                const img = new window.Image()
                img.onload = () => {
                  const w = Math.min(img.width, 400)
                  const h = (img.height / img.width) * w
                  setShapes(prev => {
                    const newShape = {
                      id: Date.now(),
                      type: 'image',
                      x: 200,
                      y: 200,
                      width: w,
                      height: h,
                      src: dataUrl,
                      zIndex: prev.length,
                      opacity: 1,
                    }
                    const next = [...prev, newShape]
                    addToHistory(next)
                    setSelectedShape(newShape)
                    setSelectedShapes([newShape])
                    return next
                  })
                }
                img.src = dataUrl
              }
              reader.readAsDataURL(blob)
            }
            return
          }
        }
      }
      e.preventDefault()
      pasteShapes()
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [pasteShapes, addToHistory])

  const selectedShapeLive = selectedShape
    ? (shapes.find(s => s.id === selectedShape.id) ?? selectedShape)
    : null

  return (
    <div className="app">
      <Toolbar
        onSave={handleSave}
        onLoad={handleLoad}
        onExportImage={handleExportImage}
        selectedShape={selectedShape}
        selectedShapes={selectedShapes}
        onSendToFront={sendToFront}
        onSendToBack={sendToBack}
        onRotateModeChange={setRotateMode}
        rotateMode={rotateMode}
        onDuplicateShape={duplicateShape}
        onDeleteShape={deleteShape}
        onDeleteShapes={deleteShapes}
        onAlignShapes={alignShapes}
        onGroupShapes={groupShapes}
        onUngroupShapes={ungroupShapes}
        onPasteImage={handlePasteImage}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        flipMode={flipMode}
        onFlipHorizontal={handleFlipHorizontal}
        onFlipVertical={handleFlipVertical}
        onFlipModeExit={() => setFlipMode(false)}
      />
      <PartsPanel onAddShape={addShape} />
      <Canvas
        ref={canvasRef}
        shapes={shapes}
        selectedShape={selectedShape}
        selectedShapes={selectedShapes}
        onSelectShape={(s) => {
          setSelectedShape(s)
          if (!s) setFlipMode(false)
        }}
        onSelectShapes={(ss) => {
          setSelectedShapes(ss)
          if (!ss?.length) setFlipMode(false)
        }}
        onUpdateShape={updateShape}
        rotateMode={rotateMode}
        onRotateModeChange={setRotateMode}
        onFlipModeRequest={() => setFlipMode(true)}
      />
      <PropertiesPanel
        selectedShape={selectedShapeLive}
        selectedShapes={selectedShapes}
        onDeleteShape={deleteShape}
        onDeleteShapes={deleteShapes}
        onUpdateShape={updateShape}
      />
    </div>
  )
}

export default App
