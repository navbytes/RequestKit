import {
  Plus,
  Settings,
  Moon,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  FileText,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  X,
  Save,
  Copy,
  ExternalLink,
  Search,
  Filter,
  MoreHorizontal,
  Menu,
  Info,
  Zap,
  Target,
  Users,
  GitBranch,
  TestTube,
  Code,
  BarChart3,
  Package,
  HelpCircle,
  Globe,
  Lock,
  Shield,
  Bug,
  Wrench,
  Folder,
  Sparkles,
  Play,
  Pause,
  Square,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Check,
  Sun,
  Monitor,
  FlaskConical,
  AlertCircle,
  TrendingUp,
  Bot,
  ArrowLeftRight,
  RefreshCw,
  MemoryStick,
  Lightbulb,
  Award,
  Siren,
  Star,
  Heart,
  Rocket,
  Clipboard,
  Clock,
  Layers,
  Activity,
  HardDrive,
  Timer,
  Database,
  TrendingDown,
  ListX,
  Cpu,
  ArrowUpDown,
} from 'lucide-preact';

import { loggers } from '@/shared/utils/debug';

// Icon name to component mapping

// Get logger for this module
const logger = loggers.shared;

const iconMap = {
  // Basic actions
  plus: Plus,
  settings: Settings,
  moon: Moon,
  eye: Eye,
  'eye-off': EyeOff,
  edit: Edit,
  trash: Trash2,
  delete: Trash2,

  // File operations
  'file-text': FileText,
  document: FileText,
  download: Download,
  upload: Upload,
  save: Save,
  copy: Copy,

  // Status indicators
  check: CheckCircle,
  'check-circle': CheckCircle,
  warning: AlertTriangle,
  'alert-triangle': AlertTriangle,
  loader: Loader2,
  spinner: Loader2,

  // Navigation
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'chevron-up-down': ArrowUpDown,
  close: X,
  'external-link': ExternalLink,

  // Search and filter
  search: Search,
  filter: Filter,

  // Misc
  'more-horizontal': MoreHorizontal,
  menu: Menu,
  info: Info,
  zap: Zap,

  // Tab icons
  target: Target,
  users: Users,
  'git-branch': GitBranch,
  'test-tube': TestTube,
  code: Code,
  'bar-chart': BarChart3,
  'bar-chart-2': BarChart3,
  list: ListX,
  package: Package,
  'help-circle': HelpCircle,

  // Template category icons
  globe: Globe,
  lock: Lock,
  shield: Shield,
  bug: Bug,
  wrench: Wrench,
  folder: Folder,
  sparkles: Sparkles,

  // Media controls
  play: Play,
  pause: Pause,
  stop: Square,
  'rotate-ccw': RotateCcw,

  // Arrows and directions
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  'arrow-left-right': ArrowLeftRight,

  // Status and feedback
  'check-simple': Check,
  sun: Sun,
  monitor: Monitor,
  'flask-conical': FlaskConical,
  'alert-circle': AlertCircle,
  'trending-up': TrendingUp,
  bot: Bot,
  'refresh-cw': RefreshCw,
  'memory-stick': MemoryStick,
  lightbulb: Lightbulb,
  award: Award,
  siren: Siren,
  star: Star,
  heart: Heart,
  rocket: Rocket,
  clipboard: Clipboard,
  clock: Clock,
  layers: Layers,
  activity: Activity,
  hardDrive: HardDrive,
  timer: Timer,
  database: Database,
  cpu: Cpu,
  trendingDown: TrendingDown,
  listX: ListX,
} as const;

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}

export function Icon({
  name,
  size = 16,
  className = '',
  strokeWidth = 2,
}: Readonly<IconProps>) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    logger.warn(`Icon "${name}" not found in iconMap`);
    // Return a placeholder div instead of trying to render undefined component
    return (
      <div
        className={`inline-block ${className}`}
        style={{ width: size, height: size }}
        title={`Missing icon: ${name}`}
      >
        ⚠️
      </div>
    );
  }

  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}

// Export individual icons for direct use if needed
export {
  Plus,
  Settings,
  Moon,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  FileText,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ChevronDown,
  X,
  Save,
  Copy,
  ExternalLink,
  Search,
  Filter,
  MoreHorizontal,
  Info,
  Zap,
  Target,
  Users,
  GitBranch,
  TestTube,
  Code,
  BarChart3,
  Package,
  HelpCircle,
  Globe,
  Lock,
  Shield,
  Bug,
  Wrench,
  Folder,
  Sparkles,
};
