import React, { useEffect, useRef, useState } from 'react'
import { Image } from 'react-konva'
import { loadSvg, parseSvgDimensions } from '../utils/svgLoader'
import { applyPatternToSvg, PATTERN_TYPES } from '../utils/patternGenerator'
import { updatePerforationCount } from '../utils/perforationGenerator'

// フォールバック用のデフォルトSVG（ファイルが見つからない場合）
const getDefaultSvg = (type) => {
  return `<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
    <rect x="15" y="15" width="50" height="50" fill="#4A90E2" stroke="#2E5C8A" stroke-width="2" rx="4"/>
    <text x="40" y="45" text-anchor="middle" font-size="10" fill="#2E5C8A" font-weight="bold">?</text>
  </svg>`
}

const SvgIcon = React.forwardRef(({ shape, isSelected, onSelect, onDragEnd, onTransformEnd }, ref) => {
  const [image, setImage] = useState(null)
  const [dimensions, setDimensions] = useState(null)

  useEffect(() => {
    let isMounted = true
    const img = new window.Image()

    const loadSvgImage = async () => {
      try {
        // SVGファイルを読み込む
        let svgString = await loadSvg(shape.type)
        
        // ファイルが見つからない場合はデフォルトを使用
        if (!svgString) {
          svgString = getDefaultSvg(shape.type)
        }
        
        if (!isMounted) return

        // Perforationタイプの場合、三角形の個数を適用
        if (shape.type === 'perforation' && shape.perforationCount !== undefined) {
          svgString = updatePerforationCount(svgString, shape.perforationCount)
        }

        // SVGのサイズ情報を解析
        const svgDimensions = parseSvgDimensions(svgString)
        if (svgDimensions && isMounted) {
          setDimensions(svgDimensions)
        }

        // パターンを適用（shape.fillPatternが設定されている場合）
        if (shape.fillPattern !== undefined) {
          if (shape.fillPattern === PATTERN_TYPES.SOLID) {
            // 塗り潰しの場合は色を直接適用
            svgString = applyPatternToSvg(
              svgString,
              PATTERN_TYPES.SOLID,
              shape.fillPatternColor || '#000000',
              12
            )
          } else {
            // その他のパターンの場合
            svgString = applyPatternToSvg(
              svgString,
              shape.fillPattern,
              shape.fillPatternColor || '#000000',
              shape.fillPatternSize || 12
            )
          }
        }
        
        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        
        img.onload = () => {
          if (isMounted) {
            setImage(img)
          }
          URL.revokeObjectURL(url)
        }
        img.onerror = () => {
          console.error('Failed to load SVG:', shape.type)
          if (isMounted) {
            // エラー時はデフォルトSVGを使用
            const defaultSvg = getDefaultSvg(shape.type)
            const defaultBlob = new Blob([defaultSvg], { type: 'image/svg+xml' })
            const defaultUrl = URL.createObjectURL(defaultBlob)
            const defaultImg = new window.Image()
            defaultImg.onload = () => {
              if (isMounted) {
                setImage(defaultImg)
              }
              URL.revokeObjectURL(defaultUrl)
            }
            defaultImg.src = defaultUrl
          }
          URL.revokeObjectURL(url)
        }
        img.src = url
      } catch (error) {
        console.error('Error loading SVG:', error)
        if (isMounted) {
          const defaultSvg = getDefaultSvg(shape.type)
          const defaultBlob = new Blob([defaultSvg], { type: 'image/svg+xml' })
          const defaultUrl = URL.createObjectURL(defaultBlob)
          const defaultImg = new window.Image()
          defaultImg.onload = () => {
            if (isMounted) {
              setImage(defaultImg)
            }
            URL.revokeObjectURL(defaultUrl)
          }
          defaultImg.src = defaultUrl
        }
      }
    }

    loadSvgImage()

    return () => {
      isMounted = false
    }
  }, [shape.type, shape.fillPattern, shape.fillPatternColor, shape.fillPatternSize, shape.perforationCount])

  if (!image) return null

  // アスペクト比を考慮したサイズ計算
  let displayWidth = shape.width || 80
  let displayHeight = shape.height || 80

  // 初回表示時、SVGのアスペクト比に基づいてサイズを設定
  if (dimensions && !shape.width && !shape.height) {
    const baseSize = 80
    if (dimensions.aspectRatio > 1) {
      // 横長の場合
      displayWidth = baseSize * dimensions.aspectRatio
      displayHeight = baseSize
    } else {
      // 縦長の場合
      displayWidth = baseSize
      displayHeight = baseSize / dimensions.aspectRatio
    }
  } else if (dimensions && (shape.width || shape.height)) {
    // 既にサイズが設定されている場合、アスペクト比を維持
    if (shape.width && !shape.height) {
      displayHeight = shape.width / dimensions.aspectRatio
    } else if (shape.height && !shape.width) {
      displayWidth = shape.height * dimensions.aspectRatio
    }
  }

  return (
    <Image
      ref={ref}
      image={image}
      x={shape.x}
      y={shape.y}
      offsetX={displayWidth / 2}
      offsetY={displayHeight / 2}
      width={displayWidth}
      height={displayHeight}
      scaleX={shape.scaleX ?? 1}
      scaleY={shape.scaleY ?? 1}
      rotation={shape.rotation || 0}
      opacity={shape.opacity !== undefined ? shape.opacity : 1}
      draggable={true}
      onClick={(e) => onSelect(e, shape)}
      onTap={(e) => onSelect(e, shape)}
      onDragEnd={(e) => onDragEnd(e, shape)}
      onTransformEnd={(e) => onTransformEnd && onTransformEnd(e, shape)}
      stroke={isSelected ? '#FF6B6B' : (shape.stroke || 'transparent')}
      strokeWidth={isSelected ? 3 : (shape.strokeWidth ?? 0)}
    />
  )
})

SvgIcon.displayName = 'SvgIcon'

export default SvgIcon
