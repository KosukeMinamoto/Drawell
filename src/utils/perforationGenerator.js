// Perforation SVGを動的に生成するユーティリティ

// Perforation SVGを生成（三角形の個数に応じて）
export const generatePerforationSvg = (count = 5, triangleHeight = 40, triangleWidth = 80) => {
  // 三角形の個数に応じてSVGの高さを計算
  const svgHeight = count * triangleHeight
  const svgWidth = triangleWidth

  // SVG文字列を生成
  let svgString = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg"
     version="1.1"
     width="${svgWidth}px"
     height="${svgHeight}px"
     viewBox="0 0 ${svgWidth} ${svgHeight}">

  <defs>
    <!-- single perforation triangle -->
    <symbol id="perforation-triangle" viewBox="0 0 ${triangleWidth} ${triangleHeight}">
      <path d="M 0 0 L ${triangleWidth} ${triangleHeight / 2} L 0 ${triangleHeight} Z"
            fill="none"
            stroke="#000000"
            stroke-width="2"
            stroke-miterlimit="10"/>
    </symbol>
  </defs>

`

  // 三角形を配置
  for (let i = 0; i < count; i++) {
    const y = i * triangleHeight
    svgString += `  <use href="#perforation-triangle" x="0" y="${y}"/>\n`
  }

  svgString += `</svg>`

  return svgString
}

// 既存のSVGからperforation用のSVGを生成（三角形の個数を変更）
export const updatePerforationCount = (svgString, count) => {
  if (!svgString) {
    return generatePerforationSvg(count)
  }

  try {
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml')
    const svgElement = svgDoc.querySelector('svg')

    if (!svgElement) {
      return generatePerforationSvg(count)
    }

    // symbolから三角形の高さを取得
    const symbol = svgDoc.querySelector('symbol#perforation-triangle')
    let triangleHeight = 40
    let triangleWidth = 80

    if (symbol) {
      const symbolViewBox = symbol.getAttribute('viewBox')
      if (symbolViewBox) {
        const parts = symbolViewBox.split(/\s+/)
        if (parts.length >= 4) {
          triangleWidth = parseFloat(parts[2]) || 80
          triangleHeight = parseFloat(parts[3]) || 40
        }
      }
    } else {
      // symbolがない場合は、既存のuse要素から計算
      const existingUses = svgDoc.querySelectorAll('use')
      if (existingUses.length > 1) {
        const firstY = parseFloat(existingUses[0].getAttribute('y')) || 0
        const secondY = parseFloat(existingUses[1].getAttribute('y')) || 40
        triangleHeight = secondY - firstY || 40
      } else if (existingUses.length === 1) {
        // viewBoxから計算
        const viewBox = svgElement.getAttribute('viewBox')
        if (viewBox) {
          const parts = viewBox.split(/\s+/)
          if (parts.length >= 4) {
            triangleWidth = parseFloat(parts[2]) || 80
            triangleHeight = parseFloat(parts[3]) || 40
          }
        }
      }
    }

    // 既存のuse要素を削除
    const existingUses = svgDoc.querySelectorAll('use')
    existingUses.forEach(use => use.remove())

    // 新しい三角形を追加
    const svgNS = 'http://www.w3.org/2000/svg'
    for (let i = 0; i < count; i++) {
      const useElement = svgDoc.createElementNS(svgNS, 'use')
      useElement.setAttribute('href', '#perforation-triangle')
      useElement.setAttribute('x', '0')
      useElement.setAttribute('y', String(i * triangleHeight))
      svgElement.appendChild(useElement)
    }

    // SVGの高さを更新
    const newHeight = count * triangleHeight
    svgElement.setAttribute('height', `${newHeight}px`)
    svgElement.setAttribute('viewBox', `0 0 ${triangleWidth} ${newHeight}`)

    const serializer = new XMLSerializer()
    return serializer.serializeToString(svgElement)
  } catch (error) {
    console.error('Error updating perforation count:', error)
    return generatePerforationSvg(count)
  }
}
