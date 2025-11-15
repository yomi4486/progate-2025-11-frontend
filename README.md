# Progate 58ハッカソン　11月！

### セットアップ
> リポジトリをクローンして自分のパソコンで使えるようにする
```sh
git clone https://github.com/yomi4486/progate-2025-11-frontend.git
```

> npm/pnpm と node と nvm のインストール

### Expo アプリの立ち上げ

1. 必要なツールを用意する

- nvm（Node Version Manager）を使うと Node.js の管理が楽です。インストール方法の一例:


> nvm のインストール（まだ入れていない場合）
```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.6/install.sh
```
> シェルをリロードして nvm を使えるようにする
```sh
source ~/.zshrc
```
> 安定版の Node をインストールして使う
```sh
nvm install latest
nvm use latest
```

2. リポジトリの依存関係をインストールする (pnpm を使う)

pnpm は高速で軽量なパッケージマネージャです。まだ入れていない場合は次でインストールします:

```sh
npm install -g pnpm
```

プロジェクトルート（この `README.md` がある場所）で次を実行します:

```sh
# pnpm を使って依存関係をインストール
pnpm install
```

3. Expo CLI をインストール（pnpm 経由で実行）

```sh
pnpm add -g expo-cli

pnpm exec expo start
```

4. シミュレータ / エミュレータで確認する

- iOS シミュレータ（macOS のみ）: Xcodeのインストール後、次で起動できます。

```sh
pnpm exec expo run:ios
```

- Android エミュレータ: Android Studio をインストールしてエミュレータを作成後、次で起動できます。

```sh
pnpm exec expo run:android
```

参考コマンドまとめ

```sh
# 依存関係インストール
pnpm install

# 開発サーバー起動
pnpm exec expo start

# iOS シミュレータで起動
pnpm exec expo run:ios

# Android エミュレータで起動
pnpm exec expo run:android
```