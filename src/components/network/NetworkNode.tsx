import { useRef, useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Crown,
  Flame,
  MessageSquare,
  Users,
} from 'lucide-react';
import type { PostNode, NodeType } from '@/types';
import { getPlatformLabel, formatNumber, getNodeTypeLabel } from '@/utils/validation';

interface NetworkNodeProps {
  node: PostNode;
  isSelected: boolean;
  isSource: boolean;
  isTarget: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  showType?: boolean;
  isTurningPoint?: boolean;
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onClick: (nodeId: string) => void;
  onDoubleClick?: (nodeId: string) => void;
  position: { x: number; y: number };
}

const nodeTypeConfig: Record<NodeType, { icon: React.ReactNode; color: string; bg: string }> = {
  source: { icon: <Crown className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-100' },
  amplifier: { icon: <Flame className="w-4 h-4" />, color: 'text-red-600', bg: 'bg-red-100' },
  follower: { icon: <Users className="w-4 h-4" />, color: 'text-gray-600', bg: 'bg-gray-100' },
  comment: { icon: <MessageSquare className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-100' },
};

const platformColors: Record<PostNode['platform'], string> = {
  weibo: 'from-red-400 to-red-600',
  wechat: 'from-green-400 to-green-600',
  douyin: 'from-gray-700 to-black',
  xiaohongshu: 'from-red-300 to-red-500',
  forum: 'from-blue-400 to-blue-600',
};

export default function NetworkNode({
  node,
  isSelected,
  isSource,
  isTarget,
  isCorrect,
  isWrong,
  showType,
  isTurningPoint,
  onMouseDown,
  onClick,
  onDoubleClick,
  position,
}: NetworkNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const typeConfig = nodeTypeConfig[node.type];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setIsDragging(true);
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
    onMouseDown(e, node.id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      onClick(node.id);
    }
    setIsDragging(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick?.(node.id);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // 拖拽逻辑由父组件处理
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  let borderColor = 'border-gray-200';
  let ringColor = '';

  if (isSelected || isSource || isTarget) {
    borderColor = 'border-gold-400';
    ringColor = 'ring-2 ring-gold-200';
  }
  if (isCorrect) {
    borderColor = 'border-green-400';
    ringColor = 'ring-2 ring-green-200';
  }
  if (isWrong) {
    borderColor = 'border-red-400';
    ringColor = 'ring-2 ring-red-200';
  }
  if (isTurningPoint) {
    borderColor = 'border-gold-500';
    ringColor = 'ring-4 ring-gold-300 animate-pulse-gold';
  }

  return (
    <div
      ref={nodeRef}
      className={`
        absolute cursor-move select-none transition-shadow
        ${isDragging ? 'z-50 scale-105' : 'z-10'}
      `}
      style={{
        left: position.x,
        top: position.y,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.15s ease-out',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className={`
          w-48 bg-white rounded-xl border-2 ${borderColor} ${ringColor}
          shadow-md hover:shadow-lg transition-shadow overflow-hidden
          ${isDragging ? 'shadow-xl' : ''}
        `}
      >
        <div className={`h-1.5 bg-gradient-to-r ${platformColors[node.platform]}`} />

        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base">
              {node.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-ink text-sm truncate">
                {node.author}
              </div>
              <div className="text-xs text-gray-400">
                {getPlatformLabel(node.platform)}
              </div>
            </div>
            {showType && (
              <div className={`p-1.5 rounded-md ${typeConfig.bg}`}>
                <span className={typeConfig.color}>{typeConfig.icon}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-ink leading-relaxed line-clamp-3 mb-2">
            {node.content}
          </p>

          <div className="flex items-center gap-3 text-gray-400 text-xs">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {formatNumber(node.likeCount)}
            </span>
            <span className="flex items-center gap-1">
              <Repeat2 className="w-3 h-3" />
              {formatNumber(node.repostCount)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {formatNumber(node.commentCount)}
            </span>
          </div>
        </div>

        <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">{node.timeLabel}</span>
          {showType && (
            <span className={`text-xs font-medium ${typeConfig.color}`}>
              {getNodeTypeLabel(node.type)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
