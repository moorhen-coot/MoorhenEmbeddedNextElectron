'use client'

import Script from 'next/script'
import Image from "next/image";

import { Client } from './Client';

export default function Home() {
  return (
  <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min.js"
        onLoad={() => {
        const loadScript = (src:string) => {
            return new Promise((resolve, reject) => {
              const script = document.createElement('script')
              script.src = src
              script.onload = () => resolve(src)
              script.onerror = () => reject(new Error('Failed to load script: ' + src))
              document.head.appendChild(script)
            })
          }
          const memory64 = WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 5, 3, 1, 4, 1]))
          if (memory64) {
            loadScript('/moorhen64.js').then(src => {
              createCoot64Module({
                print(t: string) { console.log(["output", t]) },
                printErr(t: string) { console.error(["output", t]) },
                locateFile(path: string, prefix: string) {
                // if it's a mem init file, use a custom dir
                if (path.endsWith(".data")) return "/" + path;
                // otherwise, use the default, the prefix (JS file's dir) + the path
                return prefix + path;
              }
              })
              .then((returnedModule) => {
                // @ts-ignore
                window.cootModule = returnedModule
                // @ts-ignore
                window.CCP4Module = returnedModule
                const cootModuleAttachedEvent = new CustomEvent("cootModuleAttached", { })
                document.dispatchEvent(cootModuleAttachedEvent)
                console.log(src + ' loaded 64-bit successfully.')
              })
              .catch((error) => {
                console.log("There was a problem creating Coot64Module...")
                console.error(error.message)
                console.log("Trying 32-bit fallback")
                loadScript('/moorhen.js')
                  .then(src => {
                    console.log(src + ' loaded 32-bit successfully (fallback).')
                    createCootModule({
                      print(t: string) { console.log(["output", t]) },
                      printErr(t: string) { console.log(["output", t]) }
                    })
                    .then((returnedModule) => {
                      // @ts-ignore
                      window.cootModule = returnedModule;
                      // @ts-ignore
                      window.CCP4Module = returnedModule;
                      const cootModuleAttachedEvent = new CustomEvent("cootModuleAttached", { })
                      document.dispatchEvent(cootModuleAttachedEvent)
                      console.log(src + ' loaded 32-bit successfully.')
                    })
                  })
                });
              })
              .catch((error) => {
              });
        } else {
          loadScript('/moorhen.js').then(src => {
              createCootModule({
                print(t: string) { console.log(["output", t]) },
                printErr(t: string) { console.log(["output", t]) },
                locateFile(path: string, prefix: string) {
                // if it's a mem init file, use a custom dir
                if (path.endsWith(".data")) return "/" + path;
                // otherwise, use the default, the prefix (JS file's dir) + the path
                return prefix + path;
              }
              })
              .then((returnedModule) => {
                // @ts-ignore
                window.cootModule = returnedModule
                // @ts-ignore
                window.CCP4Module = returnedModule
                const cootModuleAttachedEvent = new CustomEvent("cootModuleAttached", { })
                document.dispatchEvent(cootModuleAttachedEvent)
                console.log(src + ' loaded 32-bit successfully.')
              })
              .catch((e) => {
                console.log(e)
              });
            })
        }
        }}
      />
      <Client/>
  </>
  );
}
