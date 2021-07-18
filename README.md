# svelte-material-icons

Wrapper over the [MaterialDesign](https://github.com/Templarian/MaterialDesign) repository which transforms all `.svg` files to `.svelte` components.

File names are converted from `kebab-case.svg` to `PascalCase.svelte`, e.g. `google-translate.svg` to `GoogleTranslate.svelte`. Each file is self-contained, so the package is easily tree-shakeable.

### Installation

To install `@jprochazk/svelte-material-icons` under the `material-icons` alias:

With `npm`:
```
$ npm install material-icons@npm:jprochazk/svelte-material-icons
```
With `yarn`:
```
$ yarn add material-icons@npm:@jprochazk/svelte-material-icons
```
Or manually add this to your `package.json` `dependencies`:
```
"material-icons": "npm:@jprochazk/svelte-material-icons"
```
And run `npm install` or `yarn install`.

### Usage

Search for icons at https://materialdesignicons.com/, then use them like so:

```html
<script>
  // google-translate.svg
  import GoogleTranslateIcon from "material-icons/GoogleTranslate.svelte";
</script>

<a target="_blank" rel="noopener noreferrer" href="https://translate.google.com/">
  <GoogleTranslateIcon />
</a>
```

Every component follows this template:
```html
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  version="1.1"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  {...$$props}
>
  <path d="..." />
</svg>
```
`{...$$props}` allows you to overwrite/add any props, such as `width`, `height`, `class`, `on:click`, etc.:
```html
<script>
  import TranslateIcon from "material-icons/GoogleTranslate.svelte";
</script>

<TranslateIcon width="64" height="64" />
```
