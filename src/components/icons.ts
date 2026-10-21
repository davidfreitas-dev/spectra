import type { Component } from 'vue'
import {
  X,
  Menu,
  Settings,
  Plus,
  Minus,
  Check,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Timer,
  Clock,
  Pencil,
  Trash2,
  Copy,
  Save,
  Lock,
  ChevronDown,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  CircleAlert,
  TriangleAlert,
  ShieldAlert,
  CircleHelp,
  Info,
  Dumbbell,
  Moon,
  Calendar,
  TrendingUp,
  Trophy,
  Medal,
  Star,
  Scale,
  Zap,
  Download,
  Upload,
  User,
  Activity,
  Flame,
  SlidersHorizontal,
} from '@lucide/vue'

export const iconMap = {
  // Navigation & Control
  close: X,
  menu: Menu,
  settings: Settings,

  // Actions
  plus: Plus,
  minus: Minus,
  check: Check,
  play: Play,
  pause: Pause,
  replay: RotateCcw,
  skip: SkipForward,
  edit: Pencil,
  trash: Trash2,
  copy: Copy,
  save: Save,

  // Indicators & Forms
  lock: Lock,
  chevron_down: ChevronDown,
  arrow_right: ArrowRight,
  arrow_up: ArrowUp,
  arrow_down: ArrowDown,
  timer: Timer,
  clock: Clock,
  sliders: SlidersHorizontal,

  // Feedback & Alerts
  error: CircleAlert,
  warning: TriangleAlert,
  shield_alert: ShieldAlert,
  help: CircleHelp,
  info: Info,

  // Domain & Calisthenics
  dumbbell: Dumbbell,
  moon: Moon,
  calendar: Calendar,
  trending_up: TrendingUp,
  trophy: Trophy,
  medal: Medal,
  star: Star,
  scale: Scale,
  zap: Zap,

  // Backup
  download: Download,
  upload: Upload,

  // Equipment
  user: User,
  activity: Activity,
  flame: Flame,
} as const satisfies Record<string, Component>

export type AppIconName = keyof typeof iconMap
