This app is an example of embedding the [Moorhen](https://github.com/moorhen-coot/Moorhen) molecular graphics program into a NextJS Electron app.

It is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

This is only tested on Mac.

# Moorhen Embedded in Electron/NextJS

On ARM (M1, etc.) Mac:
```bash
npm install
npm run make-mac
open out/Moorhen-darwin-arm64/Moorhen.app/
```

On Intel Linux:
```bash
npm install
npm run make-linux
out/Moorhen-linux-x64/Moorhen --no-sandbox
```

You can start tweaking this example app by modifying `src/app/MoorhenWrapper.tsx`. The page usually auto-updates as you edit the file.
