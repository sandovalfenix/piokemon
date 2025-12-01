# shadcn-vue Setup Guide

## ✅ Installation Complete

shadcn-vue has been successfully installed and configured in the project!

### Installed Packages

- `radix-vue` - Headless UI primitives
- `class-variance-authority` - Component variant system
- `clsx` & `tailwind-merge` - Utility class management
- `tailwindcss-animate` - Animation utilities

### Configuration Files

- `components.json` - shadcn-vue configuration
- `src/lib/utils.ts` - `cn()` helper function
- `tailwind.config.js` - Updated with shadcn-vue theme
- `src/assets/main.css` - CSS variables for theming

### Available Components

Currently installed:
- ✅ Button

### Adding New Components

To add any shadcn-vue component:

```bash
npx shadcn-vue@latest add <component-name>
```

Examples:
```bash
npx shadcn-vue@latest add card
npx shadcn-vue@latest add dialog
npx shadcn-vue@latest add input
npx shadcn-vue@latest add select
npx shadcn-vue@latest add dropdown-menu
```

### Usage Example

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="default">Click me</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="destructive">Delete</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
</template>
```

### Customization

All shadcn-vue components are fully customizable:
- Located in `src/components/ui/`
- Can be modified directly to match the glassomorphism/neumorphism design system
- Use Tailwind classes for styling

### Design System Integration

Per the constitution (v1.2.0), all UI components should:
1. Use shadcn-vue components as the foundation
2. Customize with glassy backgrounds (`backdrop-blur`, `bg-opacity`)
3. Apply neumorphic shadows for depth
4. Maintain responsive design with Tailwind breakpoints

Example customization:
```vue
<Button 
  class="backdrop-blur-md bg-white/30 shadow-lg hover:shadow-xl transition-all"
>
  Glassy Button
</Button>
```

## Resources

- [shadcn-vue Documentation](https://shadcn-vue.com)
- [Radix Vue Documentation](https://www.radix-vue.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
