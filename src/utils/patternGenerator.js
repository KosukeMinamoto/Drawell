// SVGパターンを生成するユーティリティ

// パターンの種類定義
export const PATTERN_TYPES = {
  SOLID: 'solid',
  DOTS: 'dots',
  STRIPES_H: 'stripes-h', // 横縞
  STRIPES_V: 'stripes-v', // 縦縞
  STRIPES_D: 'stripes-d', // 斜め縞
  GRID: 'grid',
  CROSS: 'cross', // 格子
}

// パターン名の日本語ラベル
export const PATTERN_LABELS = {
  [PATTERN_TYPES.SOLID]: '塗り潰し',
  [PATTERN_TYPES.DOTS]: '点',
  [PATTERN_TYPES.STRIPES_H]: '横縞',
  [PATTERN_TYPES.STRIPES_V]: '縦縞',
  [PATTERN_TYPES.STRIPES_D]: '斜め縞',
  [PATTERN_TYPES.GRID]: 'グリッド',
  [PATTERN_TYPES.CROSS]: '格子',
}

// パターン用のSVG定義を生成
export const generatePatternSvg = (patternType, color = '#000000', size = 12) => {
  switch (patternType) {
    case PATTERN_TYPES.SOLID:
      return null // パターンなし（fill属性で直接指定）

    case PATTERN_TYPES.DOTS:
      return `
        <pattern id="pattern-${PATTERN_TYPES.DOTS}" patternUnits="userSpaceOnUse" width="${size}" height="${size}">
          <circle cx="${size / 2}" cy="${size / 2}" r="${size / 4}" fill="${color}"/>
        </pattern>
      `

    case PATTERN_TYPES.STRIPES_H:
      return `
        <pattern id="pattern-${PATTERN_TYPES.STRIPES_H}" patternUnits="userSpaceOnUse" width="${size}" height="${size}">
          <rect width="${size}" height="${size / 2}" fill="${color}"/>
        </pattern>
      `

    case PATTERN_TYPES.STRIPES_V:
      return `
        <pattern id="pattern-${PATTERN_TYPES.STRIPES_V}" patternUnits="userSpaceOnUse" width="${size}" height="${size}">
          <rect width="${size / 2}" height="${size}" fill="${color}"/>
        </pattern>
      `

    case PATTERN_TYPES.STRIPES_D:
      return `
        <pattern id="pattern-${PATTERN_TYPES.STRIPES_D}" patternUnits="userSpaceOnUse" width="${size}" height="${size}" patternTransform="rotate(45)">
          <rect width="${size}" height="${size / 3}" fill="${color}"/>
        </pattern>
      `

    case PATTERN_TYPES.GRID:
      return `
        <pattern id="pattern-${PATTERN_TYPES.GRID}" patternUnits="userSpaceOnUse" width="${size}" height="${size}">
          <rect width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="1"/>
        </pattern>
      `

    case PATTERN_TYPES.CROSS:
      return `
        <pattern id="pattern-${PATTERN_TYPES.CROSS}" patternUnits="userSpaceOnUse" width="${size}" height="${size}">
          <rect width="${size}" height="1" fill="${color}"/>
          <rect width="1" height="${size}" fill="${color}"/>
        </pattern>
      `

    default:
      return null
  }
}

// SVG文字列にパターンを適用
export const applyPatternToSvg = (svgString, patternType, color = '#000000', size = 12) => {
  if (!svgString) return svgString

  try {
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml')
    const svgElement = svgDoc.querySelector('svg')

    if (!svgElement) return svgString

    // 既存のパターン定義を削除
    const existingDefs = svgElement.querySelector('defs')
    if (existingDefs) {
      const existingPatterns = existingDefs.querySelectorAll('pattern')
      existingPatterns.forEach(p => p.remove())
    }

    // パターンがSOLIDの場合は、fill属性を直接設定
    if (patternType === PATTERN_TYPES.SOLID) {
      // fill属性を持つ要素を探して更新（パターン参照を削除して色を直接設定）
      const fillElements = svgDoc.querySelectorAll('[fill]')
      fillElements.forEach(el => {
        const originalFill = el.getAttribute('fill')
        // パターン参照（url(#...)）の場合は色に置き換え
        if (originalFill && originalFill.includes('url(')) {
          el.setAttribute('fill', color)
        } else if (originalFill && originalFill !== 'none') {
          // 既に色が設定されている場合は更新
          el.setAttribute('fill', color)
        }
      })
    } else {
      // パターン定義を追加
      let defs = existingDefs || svgDoc.createElementNS('http://www.w3.org/2000/svg', 'defs')
      if (!existingDefs) {
        svgElement.insertBefore(defs, svgElement.firstChild)
      }

      const patternSvg = generatePatternSvg(patternType, color, size)
      if (patternSvg) {
        const patternDoc = parser.parseFromString(patternSvg, 'image/svg+xml')
        const patternElement = patternDoc.querySelector('pattern')
        if (patternElement) {
          defs.appendChild(patternElement)
        }
      }

      // fill属性をパターン参照に変更
      const patternId = `pattern-${patternType}`
      const fillElements = svgDoc.querySelectorAll('path[fill], rect[fill], circle[fill], polygon[fill]')
      fillElements.forEach(el => {
        const fill = el.getAttribute('fill')
        // fill属性がある要素（none以外）にパターンを適用
        if (fill && fill !== 'none') {
          el.setAttribute('fill', `url(#${patternId})`)
        }
      })
    }

    // SVG文字列に戻す
    const serializer = new XMLSerializer()
    return serializer.serializeToString(svgElement)
  } catch (error) {
    console.error('Error applying pattern to SVG:', error)
    return svgString
  }
}
