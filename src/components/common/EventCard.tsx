import { Link } from 'react-router-dom';
import { Clock, Layers, ArrowRight } from 'lucide-react';
import type { Event, Difficulty as DifficultyType } from '@/types';
import { getPlatformLabel } from '@/utils/validation';

interface EventCardProps {
  event: Event;
}

const difficultyConfig: Record<DifficultyType, { label: string; color: string; bg: string }> = {
  easy: { label: '简单', color: 'text-green-700', bg: 'bg-green-100' },
  medium: { label: '中等', color: 'text-amber-700', bg: 'bg-amber-100' },
  hard: { label: '困难', color: 'text-red-700', bg: 'bg-red-100' },
};

export default function EventCard({ event }: EventCardProps) {
  const diff = difficultyConfig[event.difficulty];
  const platforms = [...new Set(event.nodes.map((n) => n.platform))];

  return (
    <Link
      to={`/student/timeline/${event.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gold-300"
    >
      <div className="h-40 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-6 text-6xl">📰</div>
          <div className="absolute bottom-2 right-8 text-4xl">🔍</div>
        </div>
        <div className="absolute bottom-4 left-6 right-6">
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${diff.bg} ${diff.color}`}>
            难度：{diff.label}
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-serif font-semibold text-ink mb-3 group-hover:text-primary-800 transition-colors">
          {event.title}
        </h3>
        <p className="text-primary-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-primary-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{event.nodes.length} 条信息</span>
            </div>
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>{platforms.map((p) => getPlatformLabel(p)).join('、')}</span>
            </div>
          </div>

          <div className="flex items-center text-primary-700 font-medium text-sm group-hover:text-gold-600 transition-colors">
            开始演练
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
