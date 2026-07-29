---
sidebar_position: 1
---

# Introduction

**Colox React** is a modular, accessible React component library built with Vite + TypeScript and styled with SCSS.

## Features

- 📦 Tree-shakable ESM/CJS builds with generated TypeScript types
- 🎨 SCSS-based theming with design tokens (also exposed as CSS custom properties)
- 🧪 Unit-tested with Vitest + Testing Library
- 📖 Preview components in Storybook, document them here in Docusaurus

## Installation

```bash
pnpm add @colox/react
```

## Usage

```tsx
import { Button } from '@colox/react';
import '@colox/react/style.css';

function App() {
  return <Button variant="primary">Click me</Button>;
}
```

## Theming

Override the SCSS tokens before importing the bundled styles, or override the exposed CSS custom properties at runtime:

```css
:root {
  --colox-color-primary: #0ea5e9;
}
```
