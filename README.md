[![Angular Logo](./logo-angular.jpg)](https://angular.io/) [![Electron Logo](./logo-electron.jpg)](https://electron.atom.io/)

[![Travis Build Status][build-badge]][build]
[![Dependencies Status][dependencyci-badge]][dependencyci]
[![Make a pull request][prs-badge]][prs]
[![License](http://img.shields.io/badge/Licence-MIT-brightgreen.svg)](LICENSE.md)

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]

# Introduction

Bootstrap and package your project with Angular 6(+) and Electron (Typescript + SASS + Hot Reload) for creating Desktop applications.

Currently runs with:

- Angular v6.1.2
- Electron v2.0.7
- Electron Builder v20.28.1
- [angular-unity](https://unitylist.com/p/h6r/angular-Unity)

With this sample, you can :

- Run your app in a local development environment with Electron & Hot reload
- Run your app in a production environment
- Package your app into an executable file for Linux, Windows & Mac

## Getting Started

Clone this repository locally :

``` bash
git clone https://gitlab.com/sasaco/flacselecter.git
```

Install dependencies with npm :

``` bash
npm install
```

There is an issue with `yarn` and `node_modules` that are only used in electron on the backend when the application is built by the packager. Please use `npm` as dependencies manager.


If you want to generate Angular components with Angular-cli , you **MUST** install `@angular/cli` in npm global context.  
Please follow [Angular-cli documentation](https://github.com/angular/angular-cli) if you had installed a previous version of `angular-cli`.

``` bash
npm install -g @angular/cli
```

## To build for development

- **in a terminal window** -> npm start  

Voila! You can use your Angular + Electron app in a local development environment with hot reload !

The application code is managed by `main.ts`. In this sample, the app runs with a simple Angular App (http://localhost:4200) and an Electron window.  
The Angular component contains an example of Electron and NodeJS native lib import.  
You can disable "Developer Tools" by commenting `win.webContents.openDevTools();` in `main.ts`.

## Included Commands

|Command|Description|
|--|--|
|`npm run ng:serve:web`| Execute the app in the browser |
|`npm run build`| Build the app. Your built files are in the /dist folder. |
|`npm run build:prod`| Build the app with Angular aot. Your built files are in the /dist folder. |
|`npm run electron:local`| Builds your application and start electron
|`npm run electron:linux`| Builds your application and creates an app consumable on linux system |
|`npm run electron:windows`| On a Windows OS, builds your application and creates an app consumable in windows 32/64 bit systems |
|`npm run electron:mac`|  On a MAC OS, builds your application and generates a `.app` file of your application that can be run on Mac |

**Your application is optimised. Only /dist folder and node dependencies are included in the executable.**

## You want to use a specific lib (like rxjs) in electron main thread ?

You can do this! Just by importing your library in npm dependencies (not devDependencies) with `npm install --save`. It will be loaded by electron during build phase and added to the final package. Then use your library by importing it in `main.ts` file. Easy no ?

## Browser mode

Maybe you want to execute the application in the browser with hot reload ? You can do it with `npm run ng:serve:web`.  
Note that you can't use Electron or NodeJS native libraries in this case. Please check `providers/electron.service.ts` to watch how conditional import of electron/Native libraries is done.


# angular-unity

Example Angular and Unity integration using:
* Unity
* Angular 6.1.x

## Installation

    npm install

## Usage

    npm start

Then view the site at:

    http://localhost:4200/


## Creating a compatible Unity project

To communicate between JavaScript and Unity you need a few things:

1) Create a Unity Project with GameObject > Controller.cs:

```
    using System.Collections;
    using System.Collections.Generic;
    using UnityEngine;
    using System.Runtime.InteropServices;

    public class Controller : MonoBehaviour {

        [DllImport("__Internal")]
        private static extern void SendMessageToWeb(string msg);

        public void ReceiveMessageFromWeb(string msg) {
            Debug.Log("Controller.ReceiveMessageFromWeb: " + msg);
        }

        // Use this for initialization
        void Start() {
            SendMessageToWeb("Hello from Unity");
        }

        // Update is called once per frame
        void Update() {

        }
    }
```

2) Add a file to the Unity project at: /Assets/Plugins/WebInterface.jslib containing:

```
    mergeInto(LibraryManager.library, {
    SendMessageToWeb: function (str) {
        window.receiveMessageFromUnity(str);
    },
    });
```

3) Build the project as WebGL so that it creates the files:

- demo.data.unityweb
- demo.json
- demo.wasm.code.unityweb
- demo.wasm.framework.unityweb

4) Copy the generated files to this project folder:

    /src/assets
    
5) Embed your generated files using the reusable Angular component:

    <app-unity appLocation="../assets/demo/demo.json"></app-unity>
    
## Directory structure

    src/                       --> Frontend sources files
    unity-src/                 --> Unity script examples


## Contact

For more information please contact kmturley