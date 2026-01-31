import React, { useState, useEffect } from 'react'
import { loadSvg, parseSvgDimensions } from '../utils/svgLoader'

function PartIcon({ type }) {
  const [svgContent, setSvgContent] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true
    setError(false)
    
    const loadIcon = async () => {
      try {
        const svg = await loadSvg(type)
        if (isMounted) {
          if (svg) {
            // SVGのサイズを調整して48x48pxのコンテナに収める
            const adjustedSvg = adjustSvgSize(svg, 48, 48)
            setSvgContent(adjustedSvg)
          } else {
            setError(true)
          }
        }
      } catch (err) {
        console.error('Error loading icon:', err)
        if (isMounted) {
          setError(true)
        }
      }
    }
    loadIcon()
    
    return () => {
      isMounted = false
    }
  }, [type])

  // SVGのサイズを調整する関数
  const adjustSvgSize = (svgString, maxWidth, maxHeight) => {
    try {
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svgString, 'image/svg+xml')
      const svgElement = svgDoc.querySelector('svg')

      if (!svgElement) return svgString

      // viewBoxを取得
      const viewBox = svgElement.getAttribute('viewBox')
      let viewBoxWidth = maxWidth
      let viewBoxHeight = maxHeight

      if (viewBox) {
        const parts = viewBox.split(/\s+/)
        if (parts.length >= 4) {
          viewBoxWidth = parseFloat(parts[2]) || maxWidth
          viewBoxHeight = parseFloat(parts[3]) || maxHeight
        }
      } else {
        // viewBoxがない場合はwidth/heightから取得
        const width = svgElement.getAttribute('width')
        const height = svgElement.getAttribute('height')
        if (width) viewBoxWidth = parseFloat(width.replace(/px|mm|cm|in/, '')) || maxWidth
        if (height) viewBoxHeight = parseFloat(height.replace(/px|mm|cm|in/, '')) || maxHeight
      }

      // アスペクト比を計算
      const aspectRatio = viewBoxWidth / viewBoxHeight
      const containerAspectRatio = maxWidth / maxHeight

      let displayWidth = maxWidth
      let displayHeight = maxHeight

      // アスペクト比を維持しながらコンテナに収める
      if (aspectRatio > containerAspectRatio) {
        // 横長の場合
        displayHeight = maxWidth / aspectRatio
      } else {
        // 縦長の場合
        displayWidth = maxHeight * aspectRatio
      }

      // SVGのwidth/height属性を設定
      svgElement.setAttribute('width', `${displayWidth}px`)
      svgElement.setAttribute('height', `${displayHeight}px`)

      // viewBoxが設定されていない場合は設定
      if (!viewBox) {
        svgElement.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`)
      }

      // style属性を追加して中央揃えとサイズ制限
      svgElement.setAttribute('style', 'max-width: 100%; max-height: 100%; object-fit: contain;')

      const serializer = new XMLSerializer()
      return serializer.serializeToString(svgElement)
    } catch (error) {
      console.error('Error adjusting SVG size:', error)
      return svgString
    }
  }

  // エラー時またはローディング中はデフォルトアイコン
  if (error || !svgContent) {
    return (
      <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
        <rect x="15" y="15" width="50" height="50" fill="#4A90E2" stroke="#2E5C8A" strokeWidth="2" rx="4"/>
        <text x="40" y="45" textAnchor="middle" fontSize="10" fill="#2E5C8A" fontWeight="bold">?</text>
      </svg>
    )
  }

  // SVG文字列をReactコンポーネントとしてレンダリング
  // dangerouslySetInnerHTMLを使用（SVGは信頼できるソースからのみ）
  try {
    return (
      <div 
        style={{ 
          width: '48px', 
          height: '48px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden'
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    )
  } catch (err) {
    console.error('Error rendering SVG:', err)
    return (
      <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
        <rect x="15" y="15" width="50" height="50" fill="#4A90E2" stroke="#2E5C8A" strokeWidth="2" rx="4"/>
        <text x="40" y="45" textAnchor="middle" fontSize="10" fill="#2E5C8A" fontWeight="bold">?</text>
      </svg>
    )
  }
}

export default PartIcon
