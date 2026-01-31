# SVGアイコンの差し替えガイド

Inkscapeで作成したSVGを差し替える方法を説明します。

## 新しい方法（推奨）

SVGファイルを個別のファイルとして管理する方式に変更しました。

### SVGファイルの配置場所

**`public/svg/`** ディレクトリにSVGファイルを配置します。

例：
- `public/svg/packer.svg`
- `public/svg/tubing.svg`
- `public/svg/valve.svg`

**注意**: `src/assets/svg/` ではなく、`public/svg/` に配置してください。

### 差し替え手順

1. InkscapeでSVGを作成・編集
2. ファイル名を部品タイプ名に合わせる（例：`packer.svg`）
3. **`public/svg/` ディレクトリに保存**
4. アプリを再読み込みすると自動的に反映されます

**これだけです！** コードを編集する必要はありません。

## 旧方法（コード内に直接記述）

以前は以下の2つのファイルで定義されていましたが、現在はファイルベースの方式に変更されています：

1. ~~`src/components/PartIcon.jsx`~~ - 現在は自動的にSVGファイルを読み込みます
2. ~~`src/components/SvgIcon.jsx`~~ - 現在は自動的にSVGファイルを読み込みます

## 手順

### 1. InkscapeでSVGを準備

1. InkscapeでSVGを作成・編集
2. ファイルを保存する際、以下の設定を推奨：
   - **幅・高さ**: 80x80px または適切なサイズ
   - **viewBox**: `0 0 80 80` など、適切な値に設定
   - **不要な要素を削除**: メタデータ、不要なグループなど

### 2. SVGコードを取得

Inkscapeで作成したSVGファイルをテキストエディタで開き、`<svg>`タグの中身をコピーします。

例：
```xml
<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <!-- ここにInkscapeで作成したSVGの内容を貼り付け -->
</svg>
```

### 3. PartIcon.jsx を編集

`src/components/PartIcon.jsx` を開き、該当する部品タイプのアイコンを置き換えます。

**例：`packer`のアイコンを差し替える場合**

```jsx
packer: (
  <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
    {/* Inkscapeで作成したSVGの内容をここに貼り付け */}
    {/* 注意: JSXなので、属性名はcamelCase（strokeWidthなど） */}
  </svg>
),
```

**重要な注意点：**
- JSXでは属性名がcamelCaseになります（例：`stroke-width` → `strokeWidth`）
- `class` → `className`
- `fill-rule` → `fillRule`
- コメントは `{/* */}` 形式

### 4. SvgIcon.jsx を編集

`src/components/SvgIcon.jsx` を開き、`getSvgString`関数内の該当する部品タイプのSVG文字列を置き換えます。

**例：`packer`のアイコンを差し替える場合**

```javascript
packer: '<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">...</svg>',
```

**重要な注意点：**
- 文字列形式なので、属性名は通常のSVG形式（`stroke-width`など）でOK
- シングルクォート内に配置するため、内部のクォートはエスケープが必要な場合があります
- 改行は可能ですが、読みやすさを考慮してください

### 5. 部品タイプの確認

差し替えたい部品のタイプ名を確認するには、`src/data/partsData.js` を参照してください。

例：
- `wellhead` → Wellhead
- `packer` → Packer
- `valve` → Valve
- など

## 実践例

### 例1: `wellhead`のアイコンを差し替える

**PartIcon.jsx:**
```jsx
wellhead: (
  <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
    {/* Inkscapeで作成したSVGの内容 */}
    <path d="M..." fill="#4A4A4A" strokeWidth="2"/>
  </svg>
),
```

**SvgIcon.jsx:**
```javascript
wellhead: '<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path d="M..." fill="#4A4A4A" stroke-width="2"/></svg>',
```

## トラブルシューティング

### アイコンが表示されない場合

1. SVGの構文エラーを確認（ブラウザのコンソールを確認）
2. `viewBox`が正しく設定されているか確認
3. 幅・高さが適切に設定されているか確認

### サイズが合わない場合

- `viewBox`を調整
- `width`と`height`属性を調整
- PartIcon.jsxでは48x48、SvgIcon.jsxでは80x80が標準サイズ

### 色が反映されない場合

- Inkscapeで作成したSVGに`fill`や`stroke`属性が含まれているか確認
- インラインスタイルが優先される場合があります

## 新しい部品タイプを追加する場合

1. `src/data/partsData.js`に新しい部品を追加
2. `PartIcon.jsx`の`icons`オブジェクトに追加
3. `SvgIcon.jsx`の`getSvgString`関数内の`svgs`オブジェクトに追加

## 参考

- Inkscape公式ドキュメント: https://inkscape.org/learn/
- SVG仕様: https://www.w3.org/TR/SVG/
