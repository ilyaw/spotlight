import type { LucideIcon } from "lucide-react";
import {
  AppWindow,
  Calculator,
  FileText,
  FolderOpen,
  Globe,
  Moon,
  Settings,
  Terminal,
  Zap,
} from "lucide-react";

export type SpotlightItem = {
  id: string;
  title: string;
  subtitle: string;
  category: "app" | "command" | "file";
  icon: LucideIcon;
  keywords?: string[];
};

export const mockItems: SpotlightItem[] = [
  {
    id: "safari",
    title: "Safari",
    subtitle: "Application",
    category: "app",
    icon: Globe,
    keywords: ["browser", "web", "internet"],
  },
  {
    id: "terminal",
    title: "Terminal",
    subtitle: "Application",
    category: "app",
    icon: Terminal,
    keywords: ["shell", "bash", "zsh", "cli"],
  },
  {
    id: "vscode",
    title: "Visual Studio Code",
    subtitle: "Application",
    category: "app",
    icon: AppWindow,
    keywords: ["editor", "code", "ide"],
  },
  {
    id: "settings",
    title: "System Settings",
    subtitle: "Application",
    category: "app",
    icon: Settings,
    keywords: ["preferences", "config"],
  },
  {
    id: "calculator",
    title: "Calculator",
    subtitle: "Application",
    category: "app",
    icon: Calculator,
    keywords: ["math", "numbers"],
  },
  {
    id: "new-note",
    title: "New Note",
    subtitle: "Command",
    category: "command",
    icon: FileText,
    keywords: ["create", "write", "document"],
  },
  {
    id: "toggle-dark",
    title: "Toggle Dark Mode",
    subtitle: "Command",
    category: "command",
    icon: Moon,
    keywords: ["theme", "appearance", "light"],
  },
  {
    id: "open-downloads",
    title: "Open Downloads",
    subtitle: "File",
    category: "file",
    icon: FolderOpen,
    keywords: ["folder", "files"],
  },
  {
    id: "quick-capture",
    title: "Quick Capture",
    subtitle: "Command",
    category: "command",
    icon: Zap,
    keywords: ["clipboard", "snippet", "save"],
  },
];
