# <picture><source media="(prefers-color-scheme: dark)" srcset="/img/inspekt-logo-white.png"><source media="(prefers-color-scheme: light)" srcset="/img/inspekt-logo.png"><img alt="Inspekt-Web logo" width="30"></picture> [Inspekt-Web](https://infinitex95.github.io/inspekt-web/)

Inspekt-Web is an audio file spectrum viewer powered by [ffmpeg-wasm](https://github.com/ffmpegwasm/ffmpeg.wasm).

[Material Web](https://github.com/material-components/material-web/tree/main) toolkit is used for styling.

A deployment is available [HERE](https://infinitex95.github.io/inspekt-web/).

## Preview
| Desktop        | Phone           |
| -------------- |:---------------:|
| <img src="https://github.com/InfiniteX95/inspekt-web/assets/29018679/3630a79b-b67a-45dc-8759-51ce88d502d4"/> | <img src="https://github.com/InfiniteX95/inspekt-web/assets/29018679/42caf10e-dbda-4a53-8b3f-ac611fbd46f2" width="50%"/> |



## Setup
[Node.js and NPM](https://nodejs.org/en) are needed to download the required dependencies.

You can run this on your own server by cloning this repository and installing the dependencies with :
```sh
git clone https://github.com/InfiniteX95/inspekt-web.git
cd inspekt-web
npm install
```

## Development
You can start a local devserver with :
```sh
npm run start
```

To update `bundle.js` after modifying the component list in `material.js` :
```sh
npm run material
```
