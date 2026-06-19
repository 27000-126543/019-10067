import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Heart, MessageCircle, Repeat2, Image as ImageIcon } from 'lucide-react';
import type { PostNode } from '@/types';
import { getPlatformLabel, formatNumber } from '@/utils/validation';

interface SortableCardProps {
  node: PostNode;
  isCorrect?: boolean;
  isWrong?: boolean;
  showFeedback?: boolean;
  onClick?: () => void;
}

const platformColors: Record<PostNode['platform'], string> = {
  weibo: 'bg-red-50 text-red-600',
  wechat: 'bg-green-50 text-green-600',
  douyin: 'bg-black text-white',
  xiaohongshu: 'bg-red-100 text-red-700',
  forum: 'bg-blue-50 text-blue-600',
};

export default function SortableCard({
  node,
  isCorrect,
  isWrong,
  showFeedback,
  onClick,
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const borderColor = showFeedback
    ? isCorrect
      ? 'border-green-400 ring-2 ring-green-200'
      : isWrong
      ? 'border-red-400 ring-2 ring-red-200'
      : 'border-gray-200'
    : 'border-gray-200';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        w-64 bg-white rounded-xl border ${borderColor}
        shadow-sm hover:shadow-md transition-all duration-200
        cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-80 scale-105 shadow-xl' : ''}
        ${isWrong && showFeedback ? 'animate-shake' : ''}
        overflow-hidden
      `}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
            {node.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-ink text-sm truncate">
              {node.author}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  platformColors[node.platform]
                }`}
              >
                {getPlatformLabel(node.platform)}
              </span>
              {node.isScreenshot && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  截图
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-ink leading-relaxed mb-3 line-clamp-3">
          {node.content}
        </p>

        {node.commentSnippet && (
          <div className="bg-gray-50 rounded-lg p-2 mb-3">
            <p className="text-xs text-primary-600 italic">
              「{node.commentSnippet}」
            </p>
          </div>
        )}

        <div className="flex items-center gap-4 text-gray-400 text-xs">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            {formatNumber(node.likeCount)}
          </span>
          <span className="flex items-center gap-1">
            <Repeat2 className="w-3.5 h-3.5" />
            {formatNumber(node.repostCount)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            {formatNumber(node.commentCount)}
          </span>
        </div>
      </div>

      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <span className="text-xs text-gray-500">{node.timeLabel}</span>
      </div>
    </div>
  );
}
