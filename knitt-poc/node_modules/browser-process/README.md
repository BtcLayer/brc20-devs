browser-process
=========

[![NPM version](https://badge.fury.io/js/browser-process.svg)](http://badge.fury.io/js/browser-process)
[![david-dm-status-badge](https://david-dm.org/wjordan/browser-process.svg)](https://david-dm.org/wjordan/browser-process#info=dependencies&view=table)
[![david-dm-status-badge](https://david-dm.org/wjordan/browser-process/dev-status.svg)](https://david-dm.org/wjordan/browser-process#info=devDependencies&view=table)

browser-process is an in-browser process module that emulates parts of the [Node JS process API](https://nodejs.org/docs/v0.10.0/api/process.html).

### Using

```
npm install browser-process
```

### Building

Prerequisites:

* Node and NPM

Release:
```
npm install
```

This compiles the TypeScript sources into JavaScript files, sourcemaps and TypeScript definitions in the `dist` directory.

### Testing and development

```
npm test
```

**(NOTE: This will launch multiple web browsers!)**. You may need to change `karma.conf.js` if you do not have Firefox installed.

Use `npm start` to run tests incrementally as you develop.

### License

browser-process is licensed under the MIT License. See `LICENSE` for details.
