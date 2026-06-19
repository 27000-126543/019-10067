import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  BarChart3,
  AlertTriangle,
  Eye,
  EyeOff,
  Trophy,
  Zap,
  Check,
  X,
  Clock,
  GitBranch,
  Target,
} from 'lucide-react';
import { getEventById } from '@/data';
import { useClassStore } from '@/store/useClassStore';
import { getPlatformLabel, formatNumber } from '@/utils/validation';
import type { PostNode } from '@/types';

type TabType = 'stats' | 'mistakes' | 'answer';

export default function TeacherDashboard() {
  const { eventId } = useParams<{ eventId: string }>();
  const event = eventId ? getEventById(eventId) : undefined;
  const { getStats, selectEvent, revealBestPath, hideBestPath } = useClassStore();
  const stats = eventId ? getStats(eventId) : undefined;

  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerStep, setAnswerStep] = useState(0);
  const [sortedNodes, setSortedNodes] = useState<PostNode[]>([]);

  useEffect(() => {
    if (eventId) {
      selectEvent(eventId);
    }
  }, [eventId, selectEvent]);

  useEffect(() => {
    if (event) {
      const sorted = [...event.nodes].sort((a, b) => a.timestamp - b.timestamp);
      setSortedNodes(sorted);
    }
  }, [event]);

  if (!event || !stats) {
    return <div className="p-8 text-center">事件不存在</div>;
  }

  const completionRate = Math.round((stats.completedStudents / stats.totalStudents) * 100);

  const tabs = [
    { key: 'stats', label: '完成度', icon: BarChart3 },
    { key: 'mistakes', label: '常见误判', icon: AlertTriangle },
    { key: 'answer', label: '最佳路径', icon: Trophy },
  ];

  const handleRevealAnswer = () => {
    setShowAnswer(true);
    setAnswerStep(0);
    if (eventId) {
      revealBestPath(eventId);
    }
  };

  const handleHideAnswer = () => {
    setShowAnswer(false);
    setAnswerStep(0);
    if (eventId) {
      hideBestPath(eventId);
    }
  };

  const handleNextStep = () => {
    if (answerStep < event.correctEdges.length) {
      setAnswerStep(answerStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (answerStep > 0) {
      setAnswerStep(answerStep - 1);
    }
  };

  const turningPointNode = event.nodes.find((n) => n.id === event.turningPointId);
  const sourceNode = event.nodes.find((n) => n.type === 'source');
  const amplifierNodes = event.nodes.filter((n) => n.type === 'amplifier');

  const visibleEdges = event.correctEdges.slice(0, answerStep);

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link
              to="/teacher"
              className="flex items-center gap-2 text-primary-200 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">返回事件列表</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-semibold">{event.title}</h1>
              <p className="text-sm text-primary-300">教师投屏仪表盘</p>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gold-400" />
              <span className="font-medium">{stats.totalStudents} 名学生</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">总人数</div>
                <div className="text-2xl font-bold text-ink">{stats.totalStudents}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">已完成</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.completedStudents}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">时间线平均分</div>
                <div className="text-2xl font-bold text-amber-600">
                  {stats.averageTimelineScore}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">传播网平均分</div>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.averageNetworkScore}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  className={`
                    flex-1 px-6 py-4 text-sm font-medium transition-colors
                    flex items-center justify-center gap-2
                    ${isActive
                      ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'stats' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-ink mb-4">完成进度</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">整体完成率</span>
                        <span className="text-sm font-medium text-gray-800">
                          {completionRate}%
                        </span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold-400 to-gold-600 rounded-full transition-all duration-500"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="bg-primary-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-primary-600" />
                          <span className="text-sm font-medium text-primary-700">
                            时间线排序
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-primary-800">
                          {stats.averageTimelineScore}分
                        </div>
                        <div className="text-xs text-primary-500 mt-1">平均得分</div>
                      </div>

                      <div className="bg-accent-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <GitBranch className="w-4 h-4 text-accent-600" />
                          <span className="text-sm font-medium text-accent-700">
                            传播网连线
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-accent-800">
                          {stats.averageNetworkScore}分
                        </div>
                        <div className="text-xs text-accent-500 mt-1">平均得分</div>
                      </div>

                      <div className="bg-gold-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-gold-600" />
                          <span className="text-sm font-medium text-gold-700">
                            拐点判断
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-gold-800">
                          {Math.round(stats.commonMistakes.filter(m => m.type === 'turning').reduce((acc, m) => acc + m.count, 0) / stats.totalStudents * 100)}%
                        </div>
                        <div className="text-xs text-gold-500 mt-1">正确率</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-ink mb-4">演练概览</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-3xl font-bold text-ink">{event.nodes.length}</div>
                      <div className="text-sm text-gray-500 mt-1">信息节点</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-3xl font-bold text-ink">{event.correctEdges.length}</div>
                      <div className="text-sm text-gray-500 mt-1">传播关系</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-3xl font-bold text-ink">{amplifierNodes.length}</div>
                      <div className="text-sm text-gray-500 mt-1">放大节点</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-3xl font-bold text-ink">
                        {turningPointNode ? formatNumber(turningPointNode.likeCount + turningPointNode.repostCount) : '-'}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">拐点传播量</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mistakes' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-ink mb-4">常见误判 Top {stats.commonMistakes.length}</h3>
                {stats.commonMistakes.map((mistake, index) => {
                  const percentage = Math.round((mistake.count / stats.totalStudents) * 100);
                  const typeLabels = {
                    order: { label: '时间排序', color: 'bg-blue-100 text-blue-700' },
                    edge: { label: '传播连线', color: 'bg-purple-100 text-purple-700' },
                    turning: { label: '拐点判断', color: 'bg-amber-100 text-amber-700' },
                  };
                  const typeConfig = typeLabels[mistake.type];

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${typeConfig.color}`}>
                            {typeConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-ink">{mistake.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-red-600">
                          {mistake.count}人
                        </div>
                        <div className="text-xs text-gray-500">
                          {percentage}% 的学生
                        </div>
                      </div>
                      <div className="w-32">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'answer' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-ink">最佳路径答案</h3>
                  {showAnswer ? (
                    <button
                      onClick={handleHideAnswer}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
                    >
                      <EyeOff className="w-4 h-4" />
                      隐藏答案
                    </button>
                  ) : (
                    <button
                      onClick={handleRevealAnswer}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      展示答案
                    </button>
                  )}
                </div>

                {showAnswer && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={handlePrevStep}
                        disabled={answerStep === 0}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        上一步
                      </button>
                      <div className="text-sm text-gray-600">
                        步骤 {answerStep} / {event.correctEdges.length}
                      </div>
                      <button
                        onClick={handleNextStep}
                        disabled={answerStep >= event.correctEdges.length}
                        className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700"
                      >
                        下一步
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 min-h-[400px] relative overflow-hidden">
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                        {visibleEdges.map((edge, index) => {
                          const sourceIdx = sortedNodes.findIndex((n) => n.id === edge.source);
                          const targetIdx = sortedNodes.findIndex((n) => n.id === edge.target);
                          if (sourceIdx === -1 || targetIdx === -1) return null;

                          const y1 = 40 + sourceIdx * 70 + 25;
                          const y2 = 40 + targetIdx * 70 + 25;
                          const x1 = 280;
                          const x2 = 520;

                          const midX = (x1 + x2) / 2;

                          return (
                            <g key={edge.id}>
                              <path
                                d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                                fill="none"
                                stroke="#22c55e"
                                strokeWidth="3"
                                strokeLinecap="round"
                                className="connection-line"
                                style={{ animationDelay: `${index * 200}ms` }}
                              />
                              <defs>
                                <marker
                                  id={`answer-arrow-${edge.id}`}
                                  viewBox="0 0 10 10"
                                  refX="9"
                                  refY="5"
                                  markerWidth="6"
                                  markerHeight="6"
                                  orient="auto-start-reverse"
                                >
                                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
                                </marker>
                              </defs>
                              <path
                                d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                                fill="none"
                                stroke="#22c55e"
                                strokeWidth="3"
                                strokeLinecap="round"
                                markerEnd={`url(#answer-arrow-${edge.id})`}
                                className="connection-line"
                                style={{ animationDelay: `${index * 200}ms` }}
                              />
                            </g>
                          );
                        })}
                      </svg>

                      <div className="relative z-10 grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                          {sortedNodes.map((node, index) => {
                            const isSource = visibleEdges.some((e) => e.source === node.id);
                            return (
                              <div
                                key={node.id}
                                className={`
                                  flex items-center gap-3 p-3 bg-white rounded-lg border-2 transition-all
                                  ${isSource ? 'border-green-400 ring-2 ring-green-200' : 'border-gray-200'}
                                `}
                                style={{ height: '50px' }}
                              >
                                <span className="text-lg">{node.avatar}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-ink truncate">
                                    {node.author}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {getPlatformLabel(node.platform)}
                                  </div>
                                </div>
                                {node.type === 'source' && (
                                  <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded">
                                    源头
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="space-y-3">
                          {sortedNodes.map((node) => {
                            const isTarget = visibleEdges.some((e) => e.target === node.id);
                            const isAmplifier = node.type === 'amplifier';
                            const isTurningPoint = node.id === event.turningPointId;
                            return (
                              <div
                                key={node.id}
                                className={`
                                  flex items-center gap-3 p-3 bg-white rounded-lg border-2 transition-all
                                  ${isTurningPoint ? 'border-gold-500 ring-4 ring-gold-300' : ''}
                                  ${isTarget && !isTurningPoint ? 'border-green-400 ring-2 ring-green-200' : ''}
                                  ${!isTarget && !isTurningPoint ? 'border-gray-200' : ''}
                                `}
                                style={{ height: '50px' }}
                              >
                                <span className="text-lg">{node.avatar}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-ink truncate">
                                    {node.author}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {getPlatformLabel(node.platform)}
                                  </div>
                                </div>
                                {isAmplifier && (
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                    放大
                                  </span>
                                )}
                                {isTurningPoint && (
                                  <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    拐点
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gold-50 border border-gold-200 rounded-xl p-5">
                      <h4 className="font-semibold text-gold-800 mb-2 flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        关键拐点解析
                      </h4>
                      <p className="text-sm text-gold-700 leading-relaxed">
                        {event.turningPointExplanation}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          信息源头
                        </h4>
                        <p className="text-sm text-blue-600">
                          {sourceNode?.author}
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                          {sourceNode && getPlatformLabel(sourceNode.platform)}
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-xl">
                        <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          放大节点
                        </h4>
                        <p className="text-sm text-red-600">
                          {amplifierNodes.map((n) => n.author).join('、')}
                        </p>
                        <p className="text-xs text-red-500 mt-1">
                          共 {amplifierNodes.length} 个关键放大点
                        </p>
                      </div>
                      <div className="p-4 bg-gold-50 rounded-xl">
                        <h4 className="font-medium text-gold-800 mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          传播拐点
                        </h4>
                        <p className="text-sm text-gold-700">
                          {turningPointNode?.author}
                        </p>
                        <p className="text-xs text-gold-500 mt-1">
                          {turningPointNode && formatNumber(turningPointNode.likeCount + turningPointNode.repostCount)} 传播量
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!showAnswer && (
                  <div className="text-center py-16 text-gray-400">
                    <EyeOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>点击"展示答案"按钮查看最佳路径</p>
                    <p className="text-sm mt-1">可用于课堂讲解和讨论</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
