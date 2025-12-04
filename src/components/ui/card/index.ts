import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Card } from "./Card.vue"
export { default as CardAction } from "./CardAction.vue"
export { default as CardHeader } from "./CardHeader.vue"
export { default as CardTitle } from "./CardTitle.vue"
export { default as CardDescription } from "./CardDescription.vue"
export { default as CardContent } from "./CardContent.vue"
export { default as CardFooter } from "./CardFooter.vue"

export const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export type CardVariants = VariantProps<typeof cardVariants>
