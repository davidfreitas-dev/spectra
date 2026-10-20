export type ButtonVariant = 'fill' | 'outline' | 'ghost' | 'danger'
export type ButtonShape = 'rounded' | 'pill' | 'circle'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type SpinnerVariant = 'primary' | 'ink' | 'surface' | 'muted' | 'error'

export type CheckboxSize = 'sm' | 'md' | 'lg'
export type CheckboxColor = 'primary' | 'ink'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SegmentedOption {
  value: string | number
  label: string
  disabled?: boolean
}

export type ChipVariant = 'rounded' | 'pill' | 'tag'

export type StatusBadgeType =
  | 'completed'
  | 'in_progress'
  | 'partial'
  | 'planned'
  | 'rest'
  | 'abandoned'
  | 'pr'
  | 'bodyweight'
  | 'weighted'
