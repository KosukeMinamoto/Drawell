import React, { useRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { Stage, Layer, Group, Rect, Circle, Line, Ellipse, Text, Image, Transformer } from 'react-konva'
import SvgIcon from './SvgIcon'
import './Canvas.css'

const ImageShape = React.forwardRef(({ shape, isSelected, onSelect, onDragEnd, onTransformEnd }, ref) => {
  const [img, setImg] = useState(null)
  useEffect(() => {
    if (!shape.src) return
    const image = new window.Image()
    image.onload = () => setImg(image)
    image.src = shape.src
  }, [shape.src])
  if (!img) return null
  return (
    <Image
      ref={ref}
      image={img}
      x={shape.x}
      y={shape.y}
      width={shape.width || 100}
      height={shape.height || 100}
      rotation={shape.rotation || 0}
      opacity={shape.opacity !== undefined ? shape.opacity : 1}
      draggable
      stroke={isSelected ? '#FF6B6B' : undefined}
      strokeWidth={isSelected ? 3 : 0}
      onClick={(e) => onSelect(e, shape)}
      onTap={(e) => onSelect(e, shape)}
      onDragEnd={(e) => onDragEnd(e, shape)}
      onTransformEnd={(e) => onTransformEnd(e, shape)}
    />
  )
})
ImageShape.displayName = 'ImageShape'

const Canvas = React.forwardRef(({ 
  shapes, 
  selectedShape, 
  selectedShapes,
  onSelectShape, 
  onSelectShapes,
  onUpdateShape, 
  rotateMode = false,
  onRotateModeChange,
}, ref) => {
  const stageRef = useRef(null)
  const transformerRef = useRef(null)
  const shapeRefs = useRef({})
  const [editingTextId, setEditingTextId] = useState(null)
  const [textOverlayRect, setTextOverlayRect] = useState(null)
  const textareaRef = useRef(null)

  // テキスト編集オーバーレイの位置を計算
  useEffect(() => {
    if (!editingTextId || !stageRef.current) {
      setTextOverlayRect(null)
      return
    }
    const shape = shapes.find(s => s.id === editingTextId)
    if (!shape) {
      setEditingTextId(null)
      return
    }
    const stage = stageRef.current.getStage()
    const container = stage.container()
    const rect = container.getBoundingClientRect()
    setTextOverlayRect({
      left: rect.left + shape.x,
      top: rect.top + shape.y,
      width: Math.max(80, shape.width || 120),
      height: Math.max(24, shape.height || 32),
      fontSize: shape.fontSize || 16,
      text: shape.text !== undefined ? shape.text : '',
    })
  }, [editingTextId, shapes])

  // テキスト編集オーバーレイ表示時にフォーカス
  useEffect(() => {
    if (textOverlayRect && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [textOverlayRect])

  // Escape で編集終了（内容を保存）
  useEffect(() => {
    if (!editingTextId) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        const value = textareaRef.current?.value ?? ''
        onUpdateShape(editingTextId, { text: value })
        setEditingTextId(null)
        setTextOverlayRect(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editingTextId, onUpdateShape])

  // ケーシング系（縦線＋三角形）: 縦方向は線のみ、横方向は三角形のみ伸びる
  const CASING_TYPES = ['casing']
  const CASING_LINE_DEFAULT = 200
  const CASING_TRIANGLE_WIDTH_DEFAULT = 40
  const CASING_TRIANGLE_HEIGHT = 40

  const renderCasingShape = (shape, isSelected) => {
    const lineLength = shape.casingLineLength ?? (shape.height != null ? shape.height - CASING_TRIANGLE_HEIGHT : CASING_LINE_DEFAULT)
    const triW = shape.casingTriangleWidth ?? shape.width ?? CASING_TRIANGLE_WIDTH_DEFAULT
    const triH = CASING_TRIANGLE_HEIGHT
    const stroke = isSelected ? '#FF6B6B' : '#000000'
    const strokeWidth = isSelected ? 3 : 2
    const triStroke = isSelected ? '#FF6B6B' : '#23445d'
    // 三角形底部の丸み（ライナー接続部の円錐状表現）
    const roundBulge = Math.min(4, triH * 0.15)
    const triBottomY = lineLength + triH

    return (
      <Group
        key={shape.id}
        ref={(node) => {
          if (node) {
            shapeRefs.current[shape.id] = node
          } else {
            delete shapeRefs.current[shape.id]
          }
        }}
        x={shape.x}
        y={shape.y}
        rotation={shape.rotation || 0}
        opacity={shape.opacity !== undefined ? shape.opacity : 1}
        draggable
        onClick={(e) => handleShapeClick(e, shape)}
        onTap={(e) => handleShapeClick(e, shape)}
        onDragEnd={(e) => handleShapeDragEnd(e, shape)}
        onTransformEnd={(e) => handleTransformEnd(e, shape)}
      >
        {/* ヒット・バウンディング用の透明矩形（丸み分を含む） */}
        <Rect
          width={triW}
          height={lineLength + triH + roundBulge}
          listening={true}
          stroke={undefined}
          fill="transparent"
        />
        {/* 縦線: パイプの肉厚を表現（薄い幅の矩形＋縁） */}
        <Rect
          x={0}
          y={0}
          width={2}
          height={lineLength}
          fill="#d8d8d8"
          stroke={stroke}
          strokeWidth={strokeWidth}
          listening={false}
        />
        <Line
          points={[0, 0, 0, lineLength]}
          stroke={stroke}
          strokeWidth={strokeWidth}
          listening={false}
        />
        {/* 三角形: 底部を丸みのある円錐状に（ライナー接続部をイメージ） */}
        <Line
          points={[
            0, lineLength,
            0, triBottomY,
            triW * 0.25, triBottomY + roundBulge,
            triW * 0.5, triBottomY,
            triW * 0.75, triBottomY + roundBulge,
            triW, triBottomY,
          ]}
          closed
          fill="#e0e0e0"
          stroke={triStroke}
          strokeWidth={strokeWidth}
          lineJoin="round"
          lineCap="round"
          listening={false}
        />
      </Group>
    )
  }

  // 省略記号をレンダリングする関数
  const renderOmissionShape = (shape, isSelected) => {
    const width = shape.width || 100
    const height = shape.height || 20
    const spacing = height * 0.3 // 2本の線の間隔
    const stroke = isSelected ? '#FF6B6B' : (shape.stroke || '#000000')
    const strokeWidth = isSelected ? 3 : (shape.strokeWidth || 2)

    const baseProps = {
      x: shape.x,
      y: shape.y,
      rotation: shape.rotation || 0,
      opacity: shape.opacity !== undefined ? shape.opacity : 1,
      stroke,
      strokeWidth,
      draggable: true,
      onClick: (e) => handleShapeClick(e, shape),
      onTap: (e) => handleShapeClick(e, shape),
      onDragEnd: (e) => handleShapeDragEnd(e, shape),
      onTransformEnd: (e) => handleTransformEnd(e, shape),
    }

    // refは最初の要素に設定
    const refProps = {
      ref: (node) => {
        if (node) {
          shapeRefs.current[shape.id] = node
        } else {
          delete shapeRefs.current[shape.id]
        }
      }
    }

    if (shape.type === 'omission-wave') {
      // 波線（2本）
      const wavePoints1 = []
      const wavePoints2 = []
      const segments = 20
      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * width
        const y1 = Math.sin((i / segments) * Math.PI * 4) * (height / 4) + height / 2
        const y2 = Math.sin((i / segments) * Math.PI * 4) * (height / 4) + height / 2 + spacing
        wavePoints1.push(x, y1)
        wavePoints2.push(x, y2)
      }
      return (
        <React.Fragment key={shape.id}>
          <Line {...baseProps} {...refProps} points={wavePoints1} />
          <Line {...baseProps} points={wavePoints2} />
        </React.Fragment>
      )
    } else if (shape.type === 'omission-slash') {
      // 斜線（2本）
      const line1 = [0, 0, width, height]
      const line2 = [0, spacing, width, height + spacing]
      return (
        <React.Fragment key={shape.id}>
          <Line {...baseProps} {...refProps} points={line1} />
          <Line {...baseProps} points={line2} />
        </React.Fragment>
      )
    } else if (shape.type === 'omission-dot') {
      // ドット線（2本）
      const dotSize = 3
      const dotSpacing = 8
      const dotElements = []
      let dotIndex = 0
      
      // 1本目のドット線
      for (let x = 0; x <= width; x += dotSpacing) {
        dotElements.push(
          <Circle
            key={`dot1-${dotIndex}`}
            {...baseProps}
            x={shape.x + x}
            y={shape.y + height / 2}
            radius={dotSize}
            fill={stroke}
            {...(dotIndex === 0 ? refProps : {})}
          />
        )
        dotIndex++
      }
      
      // 2本目のドット線
      for (let x = 0; x <= width; x += dotSpacing) {
        dotElements.push(
          <Circle
            key={`dot2-${dotIndex}`}
            {...baseProps}
            x={shape.x + x}
            y={shape.y + height / 2 + spacing}
            radius={dotSize}
            fill={stroke}
          />
        )
        dotIndex++
      }
      return <React.Fragment key={shape.id}>{dotElements}</React.Fragment>
    }
    return null
  }

  // 画像出力機能（形式・コンテンツに合わせて切り出し対応）
  useImperativeHandle(ref, () => ({
    exportImage: (options = {}) => {
      const stage = stageRef.current
      if (!stage) return
      const mimeType = options.mimeType || 'image/png'
      const quality = mimeType === 'image/jpeg' ? 0.92 : 1
      const pixelRatio = 2
      const padding = 20

      const getBounds = () => {
        const visible = shapes.filter(s => s.type !== 'group')
        if (visible.length === 0) return null
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        visible.forEach(s => {
          const x = s.x ?? 0
          const y = s.y ?? 0
          const w = s.width ?? 80
          const h = s.height ?? 80
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x + w)
          maxY = Math.max(maxY, y + h)
        })
        return { minX, minY, maxX, maxY }
      }

      const bounds = options.cropToContent ? getBounds() : null
      const stageW = stage.width()
      const stageH = stage.height()

      if (bounds) {
        const cropX = Math.max(0, bounds.minX - padding)
        const cropY = Math.max(0, bounds.minY - padding)
        const cropW = Math.min(stageW - cropX, bounds.maxX - bounds.minX + padding * 2)
        const cropH = Math.min(stageH - cropY, bounds.maxY - bounds.minY + padding * 2)
        const fullDataURL = stage.toDataURL({ pixelRatio, mimeType: 'image/png', quality: 1 })
        const img = new window.Image()
        img.onload = () => {
          const pr = pixelRatio
          const tw = Math.round(cropW * pr)
          const th = Math.round(cropH * pr)
          const canvas = document.createElement('canvas')
          canvas.width = tw
          canvas.height = th
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, cropX * pr, cropY * pr, cropW * pr, cropH * pr, 0, 0, tw, th)
          const dataURL = canvas.toDataURL(mimeType, quality)
          const ext = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/webp' ? 'webp' : 'png'
          const link = document.createElement('a')
          link.download = `drawell-export-${Date.now()}.${ext}`
          link.href = dataURL
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
        img.src = fullDataURL
      } else {
        const dataURL = stage.toDataURL({ pixelRatio, mimeType, quality })
        const ext = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/webp' ? 'webp' : 'png'
        const link = document.createElement('a')
        link.download = `drawell-export-${Date.now()}.${ext}`
        link.href = dataURL
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }), [shapes])

  const handleShapeClick = (e, shape) => {
    e.cancelBubble = true
    
    // Shiftキーを押しながらクリックで複数選択
    if (e.evt.shiftKey && selectedShapes && selectedShapes.length > 0) {
      const isAlreadySelected = selectedShapes.some(s => s.id === shape.id)
      if (isAlreadySelected) {
        onSelectShapes(selectedShapes.filter(s => s.id !== shape.id))
      } else {
        onSelectShapes([...selectedShapes, shape])
      }
    } else {
      onSelectShape(shape)
      onSelectShapes([shape])
    }
  }

  const handleStageClick = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage()
    if (clickedOnEmpty) {
      onSelectShape(null)
      onSelectShapes([])
      if (onRotateModeChange) {
        onRotateModeChange(false) // 選択解除時に回転モードもリセット
      }
    }
  }

  // Transformerの枠をクリックして回転モードを切り替え
  const handleTransformerBorderClick = useCallback((e) => {
    if (onRotateModeChange) {
      onRotateModeChange(!rotateMode)
    }
    e.cancelBubble = true
  }, [rotateMode, onRotateModeChange])

  const handleShapeDragEnd = (e, shape) => {
    onUpdateShape(shape.id, {
      x: e.target.x(),
      y: e.target.y(),
    })
  }

  const handleTransformEnd = (e, shape) => {
    const node = e.target
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    const rotation = node.rotation()

    // スケールをリセットして、width/heightを更新
    node.scaleX(1)
    node.scaleY(1)

    const updates = {
      x: node.x(),
      y: node.y(),
    }

    // 回転角度も保存
    if (rotateMode && rotation !== 0) {
      updates.rotation = rotation
      node.rotation(0) // リセット
    }

    if (shape.type === 'circle' || shape.type === 'ellipse') {
      // 円・楕円の場合は平均スケールを使用してアスペクト比を維持
      const avgScale = (scaleX + scaleY) / 2
      if (shape.type === 'circle') {
        const newRadius = Math.max(2.5, (shape.width / 2) * avgScale)
        updates.width = newRadius * 2
        updates.height = newRadius * 2
      } else {
        updates.width = Math.max(5, shape.width * avgScale)
        updates.height = Math.max(5, shape.height * avgScale)
      }
    } else if (shape.type === 'line') {
      // 線の場合は幅のみ変更
      updates.width = Math.max(10, shape.width * scaleX)
    } else if (shape.type === 'text') {
      updates.width = Math.max(20, (shape.width || 120) * scaleX)
      updates.height = Math.max(12, (shape.height || 32) * scaleY)
      updates.fontSize = Math.max(8, Math.round((shape.fontSize || 16) * Math.min(scaleX, scaleY)))
    } else if (shape.type === 'omission-wave' || shape.type === 'omission-slash' || shape.type === 'omission-dot') {
      // 省略記号の場合
      updates.width = Math.max(20, shape.width * scaleX)
      updates.height = Math.max(10, shape.height * scaleY)
    } else if (CASING_TYPES.includes(shape.type)) {
      // ケーシング: 縦は線のみ、横は三角形のみ伸ばす
      const lineLen = shape.casingLineLength ?? (shape.height != null ? shape.height - CASING_TRIANGLE_HEIGHT : CASING_LINE_DEFAULT)
      const triW = shape.casingTriangleWidth ?? shape.width ?? CASING_TRIANGLE_WIDTH_DEFAULT
      updates.casingLineLength = Math.max(10, lineLen * scaleY)
      updates.casingTriangleWidth = Math.max(10, triW * scaleX)
      updates.width = updates.casingTriangleWidth
      updates.height = updates.casingLineLength + CASING_TRIANGLE_HEIGHT
    } else if (shape.type === 'image') {
      updates.width = Math.max(5, (shape.width || 100) * scaleX)
      updates.height = Math.max(5, (shape.height || 100) * scaleY)
    } else if (shape.type !== 'rect' && shape.type !== 'circle' && shape.type !== 'line' && shape.type !== 'triangle' && shape.type !== 'trapezoid' && shape.type !== 'ellipse' && shape.type !== 'polygon') {
      // SVGアイコンの場合
      updates.width = Math.max(5, shape.width * scaleX)
      updates.height = Math.max(5, shape.height * scaleY)
    } else {
      // その他の基本図形の場合は自由にサイズ変更
      updates.width = Math.max(5, shape.width * scaleX)
      updates.height = Math.max(5, shape.height * scaleY)
    }

    onUpdateShape(shape.id, updates)
  }

  // Transformerを選択された図形にアタッチ
  useEffect(() => {
    if (transformerRef.current) {
      const nodes = []
      
      // 複数選択の場合
      if (selectedShapes && selectedShapes.length > 0) {
        selectedShapes.forEach(shape => {
          const node = shapeRefs.current[shape.id]
          if (node) {
            nodes.push(node)
          }
        })
      }
      // 単一選択の場合
      else if (selectedShape) {
        const selectedNode = shapeRefs.current[selectedShape.id]
        if (selectedNode) {
          nodes.push(selectedNode)
        }
      }
      
      if (nodes.length > 0) {
        transformerRef.current.nodes(nodes)
        transformerRef.current.getLayer().batchDraw()
        
        // Transformerのborderにクリックイベントを追加
        setTimeout(() => {
          const transformer = transformerRef.current
          if (transformer) {
            // border要素を取得
            const border = transformer.findOne('.border')
            if (border) {
              // 既存のイベントリスナーを削除
              border.off('click')
              border.off('tap')
              // 新しいイベントリスナーを追加
              border.on('click', handleTransformerBorderClick)
              border.on('tap', handleTransformerBorderClick)
            }
          }
        }, 0)
      } else {
        transformerRef.current.nodes([])
        if (onRotateModeChange) {
          onRotateModeChange(false) // 選択解除時に回転モードもリセット
        }
      }
    }
  }, [selectedShape, selectedShapes, handleTransformerBorderClick, onRotateModeChange])

  const handleTextOverlayBlur = () => {
    if (!editingTextId) return
    const value = textareaRef.current?.value ?? ''
    onUpdateShape(editingTextId, { text: value })
    setEditingTextId(null)
    setTextOverlayRect(null)
  }

  return (
    <div className="canvas-container" tabIndex={0}>
      {textOverlayRect && (
        <textarea
          ref={textareaRef}
          className="canvas-text-edit"
          style={{
            position: 'fixed',
            left: textOverlayRect.left,
            top: textOverlayRect.top,
            width: textOverlayRect.width,
            height: textOverlayRect.height,
            fontSize: textOverlayRect.fontSize,
            zIndex: 10000,
            margin: 0,
            padding: 4,
            border: '2px solid #4A90E2',
            outline: 'none',
            resize: 'none',
            fontFamily: 'sans-serif',
            boxSizing: 'border-box',
          }}
          defaultValue={textOverlayRect.text}
          onBlur={handleTextOverlayBlur}
        />
      )}
      <Stage
        ref={stageRef}
        width={window.innerWidth - 450}
        height={window.innerHeight - 50}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          {shapes
            .filter(shape => shape.type !== 'group') // グループオブジェクトは除外
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)) // z-indexで並び替え
            .map((shape) => {
            const isSelected = selectedShape?.id === shape.id
            const isMultiSelected = selectedShapes?.some(s => s.id === shape.id) || false

            // 省略記号の場合
            if (shape.type === 'omission-wave' || shape.type === 'omission-slash' || shape.type === 'omission-dot') {
              return renderOmissionShape(shape, isSelected || isMultiSelected)
            }

            // ケーシング系: 縦線＋三角形の複合（縦は線のみ、横は三角形のみ伸びる）
            if (CASING_TYPES.includes(shape.type)) {
              return renderCasingShape(shape, isSelected || isMultiSelected)
            }

            // 貼り付け画像
            if (shape.type === 'image') {
              return (
                <ImageShape
                  key={shape.id}
                  ref={(node) => {
                    if (node) shapeRefs.current[shape.id] = node
                    else delete shapeRefs.current[shape.id]
                  }}
                  shape={shape}
                  isSelected={isSelected || isMultiSelected}
                  onSelect={handleShapeClick}
                  onDragEnd={handleShapeDragEnd}
                  onTransformEnd={handleTransformEnd}
                />
              )
            }

            // SVGアイコンの場合（基本図形と省略記号・ケーシング以外はすべてSVGアイコン）
            const basicShapes = ['rect', 'circle', 'line', 'triangle', 'trapezoid', 'ellipse', 'polygon', 'text']
            if (!basicShapes.includes(shape.type)) {
              return (
                <SvgIcon
                  key={shape.id}
                  ref={(node) => {
                    if (node) {
                      shapeRefs.current[shape.id] = node
                    } else {
                      delete shapeRefs.current[shape.id]
                    }
                  }}
                  shape={shape}
                  isSelected={isSelected || isMultiSelected}
                  onSelect={(e) => handleShapeClick(e, shape)}
                  onDragEnd={(e) => handleShapeDragEnd(e, shape)}
                  onTransformEnd={(e) => handleTransformEnd(e, shape)}
                />
              )
            }

            // テキストの場合
            if (shape.type === 'text') {
              const isEditing = editingTextId === shape.id
              return (
                <React.Fragment key={shape.id}>
                  <Text
                    ref={(node) => {
                      if (node) {
                        shapeRefs.current[shape.id] = node
                      } else {
                        delete shapeRefs.current[shape.id]
                      }
                    }}
                    x={shape.x}
                    y={shape.y}
                    rotation={shape.rotation || 0}
                    opacity={shape.opacity !== undefined ? shape.opacity : 1}
                    text={shape.text !== undefined && shape.text !== '' ? shape.text : '\u00A0'}
                    fontSize={shape.fontSize || 16}
                    width={shape.width || 120}
                    height={shape.height || 32}
                    fill="#000000"
                    listening={!isEditing}
                    draggable={!isEditing}
                    onClick={(e) => handleShapeClick(e, shape)}
                    onTap={(e) => handleShapeClick(e, shape)}
                    onDblClick={() => setEditingTextId(shape.id)}
                    onDblTap={() => setEditingTextId(shape.id)}
                    onDragEnd={(e) => handleShapeDragEnd(e, shape)}
                    onTransformEnd={(e) => handleTransformEnd(e, shape)}
                  />
                </React.Fragment>
              )
            }

            // 基本図形の場合
            const commonProps = {
              key: shape.id,
              ref: (node) => {
                if (node) {
                  shapeRefs.current[shape.id] = node
                } else {
                  delete shapeRefs.current[shape.id]
                }
              },
              x: shape.x,
              y: shape.y,
              rotation: shape.rotation || 0,
              opacity: shape.opacity !== undefined ? shape.opacity : 1,
              fill: shape.fill,
              stroke: (isSelected || isMultiSelected) ? '#FF6B6B' : shape.stroke,
              strokeWidth: (isSelected || isMultiSelected) ? 3 : shape.strokeWidth,
              draggable: true,
              onClick: (e) => handleShapeClick(e, shape),
              onTap: (e) => handleShapeClick(e, shape),
              onDragEnd: (e) => handleShapeDragEnd(e, shape),
              onTransformEnd: (e) => handleTransformEnd(e, shape),
            }

            if (shape.type === 'circle') {
              return (
                <Circle
                  {...commonProps}
                  radius={shape.width / 2}
                />
              )
            } else if (shape.type === 'ellipse') {
              return (
                <Ellipse
                  {...commonProps}
                  radiusX={shape.width / 2}
                  radiusY={shape.height / 2}
                />
              )
            } else if (shape.type === 'line') {
              return (
                <Line
                  {...commonProps}
                  points={[0, 0, shape.width || 100, 0]}
                  fill={shape.fill}
                />
              )
            } else if (shape.type === 'triangle') {
              const points = [
                0, shape.height || 60,
                (shape.width || 60) / 2, 0,
                shape.width || 60, shape.height || 60
              ]
              return (
                <Line
                  {...commonProps}
                  points={points}
                  closed={true}
                  fill={shape.fill}
                />
              )
            } else if (shape.type === 'trapezoid') {
              const w = shape.width || 80
              const h = shape.height || 60
              const offset = w * 0.2 // 台形の上辺を20%短く
              const points = [
                offset, 0,
                w - offset, 0,
                w, h,
                0, h
              ]
              return (
                <Line
                  {...commonProps}
                  points={points}
                  closed={true}
                  fill={shape.fill}
                />
              )
            } else if (shape.type === 'polygon') {
              // 六角形として実装
              const w = shape.width || 60
              const h = shape.height || 60
              const centerX = w / 2
              const centerY = h / 2
              const radius = Math.min(w, h) / 2
              const points = []
              for (let i = 0; i < 6; i++) {
                const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2
                points.push(centerX + radius * Math.cos(angle))
                points.push(centerY + radius * Math.sin(angle))
              }
              return (
                <Line
                  {...commonProps}
                  points={points}
                  closed={true}
                  fill={shape.fill}
                />
              )
            } else {
              return (
                <Rect
                  {...commonProps}
                  width={shape.width}
                  height={shape.height}
                />
              )
            }
          })}
          {(selectedShape || (selectedShapes && selectedShapes.length > 0)) && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // 最小サイズを制限
                if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                  return oldBox
                }
                return newBox
              }}
              anchorSize={8}
              borderEnabled={true}
              borderStroke={rotateMode ? "#FF6B6B" : "#4A90E2"}
              borderStrokeWidth={2}
              anchorStroke="#4A90E2"
              anchorFill="#FFFFFF"
              rotateEnabled={rotateMode}
              enabledAnchors={rotateMode ? [] : ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']}
            />
          )}
        </Layer>
      </Stage>
    </div>
  )
})

Canvas.displayName = 'Canvas'

export default Canvas
