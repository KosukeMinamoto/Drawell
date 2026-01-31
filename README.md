# Drawell

簡易的なプラント設計図描画ツール（Vite + React）

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## URL で公開する（GitHub Pages）

### 0. 「git status で ../../ や ../ ばかり出る」場合（drawell を単独リポジトリにする）

親フォルダやホームがリポジトリになっていると、drawell の変更が GitHub に届きません。**drawell フォルダだけ**をリポジトリにします。

```bash
cd /Users/kosukeminamoto/kminamoto/drawell

# drawell 内で新規リポジトリを作成（既に .git があればスキップ）
git init

# すべて追加（.gitignore で node_modules, dist は除外済み）
git add .
git status   # drawell 内のファイルだけ出れば OK

git commit -m "Initial commit with GitHub Pages workflow"
git remote add origin https://github.com/KosukeMinamoto/Drawell.git
git push -u origin main
```

GitHub の Drawell に既に別の履歴がある場合は、`git push -u origin main --force` で上書きできます（他に共同編集していなければ）。

### 1. 通常のプッシュ（drawell がすでに単独リポジトリの場合）

```bash
git add .
git commit -m "Add GitHub Actions workflow for GitHub Pages"
git push origin main
```

### 2. GitHub で Pages を「GitHub Actions」に設定（必須）

**「There isn't a GitHub Pages site here」と出る場合は、ここが未設定です。**

1. リポジトリの **Settings**（設定）を開く
2. 左メニューの **Pages** をクリック
3. **Build and deployment** の **Source** で  
   **「GitHub Actions」** を選択（「Deploy from a branch」ではない）

### 3. ワークフローを実行する

- **main にプッシュ済みなら:** リポジトリの **Actions** タブを開き、「Deploy to GitHub Pages」ワークフローが実行中または完了しているか確認
- **まだ実行されていない場合:** Actions タブ → 「Deploy to GitHub Pages」→ **Run workflow** で手動実行

初回は 1〜2 分かかることがあります。緑のチェックになればデプロイ完了です。

**公開 URL:** `https://<あなたのユーザー名>.github.io/Drawell/`

GitHub Pages を使う場合は、`vite.config.js` の `base` を `'/Drawell/'` に戻してください。

---

## Vercel で公開する

このプロジェクトは Vercel 用に `base: '/'` と `vercel.json` を設定済みです。

### 手順

1. **Vercel にログイン**  
   [vercel.com](https://vercel.com) で GitHub アカウントと連携

2. **「Add New Project」**  
   GitHub の drawell リポジトリをインポート

3. **設定（そのままで OK）**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Deploy** をクリック

数分でデプロイが完了し、`https://<プロジェクト名>.vercel.app` で公開されます。  
以降は `main` にプッシュするたびに自動で再デプロイされます。

### ローカルでプレビュー

```bash
npm run build
npm run preview
```

## ライセンス

MIT
