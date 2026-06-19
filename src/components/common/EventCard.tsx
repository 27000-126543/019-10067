import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Layers, ArrowRight, Play, RotateCcw } from 'lucide-react';
import type { Event, Difficulty as DifficultyType, StudentProgress } from '@/types';
import { getPlatformLabel } from '@/utils/validation';

interface EventCardProps {
  event: Event;
  progress?: StudentProgress | null;
}

const difficultyConfig: Record<DifficultyType, { label: string; color: string; bg: string }> = {
  easy: { label: '简单', color: 'text-green-700', bg: 'bg-green-100' },
  medium: { label: '中等', color: 'text-amber-700', bg: 'bg-amber-100' },
  hard: { label: '困难', color: 'text-red-700', bg: 'bg-red-100' },
};

const stepLabels = [
  { step: 'timeline', label: '时间线排序', path: '/student/timeline/' },
  { step: 'network', label: '传播网连线', path: '/student/network/' },
  { step: 'turning', label: '拐点标注', path: '/student/turning/' },
  { step: 'result', label: '结果解析', path: '/student/result/' },
];

export default function EventCard({ event, progress }: EventCardProps) {
  const diff = difficultyConfig[event.difficulty];
  const platforms = [...new Set(event.nodes.map((n) => n.platform))];

  const { currentStep, stepLabel, nextPath, progressPercent } = useMemo(() => {
    if (!progress) {
      return {
        currentStep: 0,
        stepLabel: '未开始',
        nextPath: `/student/timeline/${event.id}`,
        progressPercent: 0,
      };
    }

    if (progress.completedAt) {
      return {
        currentStep: 4,
        stepLabel: '已完成',
        nextPath: `/student/result/${event.id}`,
        progressPercent: 100,
      };
    }

    if (progress.selectedTurningPoint && (progress.turningPointCorrect || progress.networkScore > 0)) {
      return {
        currentStep: 3,
        stepLabel: stepLabels[2].label,
        nextPath: `/student/turning/${event.id}`,
        progressPercent: 75,
      };
    }

    if (progress.studentEdges.length > 0 || progress.networkScore > 0) {
      return {
        currentStep: 2,
        stepLabel: stepLabels[1].label,
        nextPath: `/student/network/${event.id}`,
        progressPercent: 50,
      };
    }

    if (progress.timelineOrder.length > 0 || progress.timelineScore > 0) {
      return {
        currentStep: 1,
        stepLabel: stepLabels[0].label,
        nextPath: `/student/timeline/${event.id}`,
        progressPercent: 25,
      };
    }

    return {
      currentStep: 0,
      stepLabel: '未开始',
      nextPath: `/student/timeline/${event.id}`,
      progressPercent: 0,
    };
  }, [progress, event.id]);

  return (
    <Link
      to={nextPath}
      className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gold-300"
    >
      <div className="h-40 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-6 text-6xl">📰</div>
          <div className="absolute bottom-2 right-8 text-4xl">🔍</div>
        </div>
        <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${diff.bg} ${diff.color}`}>
            难度：{diff.label}
          </div>
          {currentStep > 0 && (
            <div className="bg-gold-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              {progressPercent === 100 ? (
                <>
                  <RotateCcw className="w-3 h-3" />
                  已完成
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  继续
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-serif font-semibold text-ink mb-3 group-hover:text-primary-800 transition-colors">
          {event.title}
        </h3>
        <p className="text-primary-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-primary-500">演练进度</span>
            <span className="font-medium text-primary-700">{stepLabel}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-400 to-gold-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

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
            {progressPercent === 100 ? '重新演练' : progressPercent > 0 ? '继续演练' : '开始演练'}
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
