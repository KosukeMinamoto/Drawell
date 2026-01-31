// SVGファイルを動的に読み込むユーティリティ

// SVGファイルを読み込む（publicディレクトリから読み込む）
export const loadSvg = async (type) => {
  try {
    // publicディレクトリ内のファイルはルートパスから直接アクセス可能
    const base = import.meta.env.BASE_URL
    const svgPath = `${base}svg/${type}.svg`
    const response = await fetch(svgPath)
    
    if (response.ok) {
      return await response.text()
    } else {
      console.warn(`SVG file not found: ${type}.svg (path: ${svgPath}, status: ${response.status})`)
      return null
    }
  } catch (error) {
    console.error(`Error loading SVG for type ${type}:`, error)
    return null
  }
}

// SVGのviewBoxやサイズ情報を解析してアスペクト比を取得
export const parseSvgDimensions = (svgString) => {
  if (!svgString) return null

  try {
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml')
    const svgElement = svgDoc.querySelector('svg')
    
    if (!svgElement) return null

    let width = 80
    let height = 80
    let viewBox = null

    // viewBoxを取得
    const viewBoxAttr = svgElement.getAttribute('viewBox')
    if (viewBoxAttr) {
      const parts = viewBoxAttr.split(/\s+/)
      if (parts.length >= 4) {
        viewBox = {
          x: parseFloat(parts[0]) || 0,
          y: parseFloat(parts[1]) || 0,
          width: parseFloat(parts[2]) || 80,
          height: parseFloat(parts[3]) || 80,
        }
        width = viewBox.width
        height = viewBox.height
      }
    }

    // width/height属性を取得（viewBoxがない場合）
    if (!viewBox) {
      const widthAttr = svgElement.getAttribute('width')
      const heightAttr = svgElement.getAttribute('height')
      
      if (widthAttr) {
        width = parseFloat(widthAttr.replace(/px|mm|cm|in/, '')) || 80
      }
      if (heightAttr) {
        height = parseFloat(heightAttr.replace(/px|mm|cm|in/, '')) || 80
      }
    }

    const aspectRatio = width / height

    return {
      width,
      height,
      aspectRatio,
      viewBox,
    }
  } catch (error) {
    console.error('Error parsing SVG dimensions:', error)
    return null
  }
}
