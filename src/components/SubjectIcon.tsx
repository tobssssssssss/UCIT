import {
  Leaf, BookOpen, ShoppingBag, Calculator, Globe, FlaskConical,
  Palette, Music, Code, Brain, Clock, Map, FileText, Languages,
  History, Landmark, Microscope, Ruler, PenTool, type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Leaf, BookOpen, ShoppingBag, Calculator, Globe, FlaskConical,
  Palette, Music, Code, Brain, Clock, Map, FileText, Languages,
  History, Landmark, Microscope, Ruler, PenTool,
};

export function SubjectIcon({ name, className }: { name: string | null; className?: string }) {
  const Icon = (name && iconMap[name]) || BookOpen;
  return <Icon className={className} />;
}
