# r5-helper README

This repository is inspired by [AppWorks](https://github.com/appworks-lab/appworks).
implement some of its features and expand it

## Features

After created a folder or file, automatically create the index.j[t]sx/[less,scss,css,sass] file and complete the code snippet.

## Install

[Install the extension here](https://marketplace.visualstudio.com/items?itemName=cl1107.r5-helper)

Or by opening the Command Palette (Ctrl+Shift+P), and running

```sh
ext install r5-helper
```

## Extension Settings

- `r5-helper.autoFillComponentCode`: enable/disable auto fill component and page
- `r5-helper.autoCreateStyleFile`: enable/disable auto create style file
- `r5-helper.styleFileType`: set the style file type(less or scss or css or sass)

### Available Snippets

- userequest-paginated

## Known Issues

unknown

## Release Notes

### 0.0.1

Initial release of autoFillComponents

### 0.0.2

- add setting r5-helper.autoFillComponentCode
- fixed bug：when create component but fill page template
- add code snippets

### 0.0.4

- fixed bug：create nested page fail
