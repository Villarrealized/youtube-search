# Youtube Search

A simple search results frontend using YouTube's Data API built with Web Components and the Lit library.

For styling I am using tailwindcss with daisyui to speed up development of common UI components. It's not straightforward to use tailwind with Web Components due to the shadow DOM preventing global classes from piercing through. The `dev` and `pre-build` scripts make this possible by generating the css and converting it to a js file which is imported into each component.

## Getting started
Install dependencies
```bash
bun install
```
Create a `.env` file with your YouTube API Key
```.env
VITE_YT_API_KEY=your-api-key-here
```

## Build & Run
```bash
bun run build && bun run preview
```

## Development
```bash
bun run dev
```

## Changing theme
DaisyUI provides a [list of prebuilt themes](https://daisyui.com/docs/themes/#list-of-themes) that can be used. Simply change this line in app.css to a different theme name such as `light`
```css
themes: dark --default;
```
