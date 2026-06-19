import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Target, GitBranch, Clock, Check, X, Zap } from 'lucide-react';
import StepIndicator from '@/components/layout/StepIndicator';
import { getEventById } from '@/data';
import { useGameStore } from '@/store/useGameStore';
import { formatNumber } from '@/utils/validation';
import type { PostNode } from '@/types';

export default function ResultPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const event = eventId ? getEventById(eventId) : undefined;
  const { progress } = useGameStore();
  const [sortedNodes, setSortedNodes] = useState<PostNode[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'timeline' | 'network' | 'turning'>('summary');

  useEffect(() => {
    if (event) {
      const sorted = [...event.nodes].sort((a, b) => a.timestamp - b.timestamp);
      setSortedNodes(sorted);
    }
  }, [event]);

  if (!event || !progress) {
    return <div className="p-8 text-center">事件不存在</div>;
  }

  const totalScore = Math.round(
    (progress.timelineScore + progress.networkScore + (progress.turningPointCorrect ? 100 : 0)) / 3
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const turningPointNode = event.nodes.find((n) => n.id === event.turningPointId);
  const sourceNode = event.nodes.find((n) => n.type === 'source');
  const amplifierNodes = event.nodes.filter((n) => n.type === 'amplifier');

  const tabs = [
    { key: 'summary', label: '总览', icon: Trophy },
    { key: 'timeline', label: '时间线', icon: Clock },
    { key: 'network', label: '传播网', icon: GitBranch },
    { key: 'turning', label: '拐点解析', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to={`/student/turning/${eventId}`}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">返回上一步</span>
            </Link>
            <StepIndicator currentStep="result" />
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-serif font-bold text-ink mb-2">
              {event.title} · 演练完成
            </h1>
            <p className="text-primary-600">恭喜你完成了本次谣言扩散路径分析演练</p>
          </div>

          <div className={`p-6 rounded-2xl border-2 ${getScoreBg(totalScore)} mb-8`}>
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center flex-shrink-0">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(totalScore)}`}>
                    {totalScore}
                  </div>
                  <div className="text-xs text-gray-500">综合得分</div>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-primary-600">时间线排序</span>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(progress.timelineScore)}`}>
                    {progress.timelineScore}分
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-primary-600">传播网连线</span>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(progress.networkScore)}`}>
                    {progress.networkScore}分
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-primary-600">拐点判断</span>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(progress.turningPointCorrect ? 100 : 0)}`}>
                    {progress.turningPointCorrect ? '正确' : '错误'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
            <div className="flex border-b border-gray-100">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`
                      flex-1 px-6 py-4 text-sm font-medium transition-colors
                      flex items-center justify-center gap-2
                      ${isActive
                        ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50/50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-gold-500" />
                      关键知识点
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-primary-50 rounded-xl">
                        <h4 className="font-medium text-primary-800 mb-2">信息源头</h4>
                        <p className="text-sm text-primary-600 leading-relaxed">
                          谣言通常起源于匿名论坛、私密群聊等低公信力渠道，
                          然后通过社交平台逐步扩散。信源核查是辟谣的第一步。
                        </p>
                      </div>
                      <div className="p-4 bg-accent-50 rounded-xl">
                        <h4 className="font-medium text-accent-800 mb-2">二次创作</h4>
                        <p className="text-sm text-accent-600 leading-relaxed">
                          谣言在传播过程中会被不断改写和加工，
                          添加更具冲击力的细节，使其更易传播。
                        </p>
                      </div>
                      <div className="p-4 bg-gold-50 rounded-xl">
                        <h4 className="font-medium text-gold-800 mb-2">传播拐点</h4>
                        <p className="text-sm text-gold-700 leading-relaxed">
                          关键账号或爆款内容会成为传播拐点，
                          使谣言从小范围讨论跃升至公共舆情事件。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-ink mb-4">本次事件关键数据</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-ink">{event.nodes.length}</div>
                        <div className="text-sm text-gray-500">信息节点</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-ink">{event.correctEdges.length}</div>
                        <div className="text-sm text-gray-500">传播关系</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-ink">
                          {amplifierNodes.length}
                        </div>
                        <div className="text-sm text-gray-500">放大节点</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-ink">
                          {turningPointNode ? formatNumber(turningPointNode.likeCount + turningPointNode.repostCount) : '-'}
                        </div>
                        <div className="text-sm text-gray-500">拐点传播量</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  <p className="text-sm text-primary-600 mb-4">
                    正确的时间顺序（从早到晚）：
                  </p>
                  {sortedNodes.map((node, index) => (
                    <div
                      key={node.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-200 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl">
                        {node.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-ink text-sm">{node.author}</div>
                        <div className="text-xs text-gray-500">{node.content.slice(0, 50)}...</div>
                      </div>
                      <div className="text-sm text-gray-500">{node.timeLabel}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'network' && (
                <div className="space-y-4">
                  <p className="text-sm text-primary-600 mb-4">
                    正确的传播关系：
                  </p>
                  <div className="space-y-3">
                    {event.correctEdges.map((edge) => {
                      const source = event.nodes.find((n) => n.id === edge.source);
                      const target = event.nodes.find((n) => n.id === edge.target);
                      const studentHasEdge = progress.studentEdges.some(
                        (e) =>
                          (e.source === edge.source && e.target === edge.target) ||
                          (e.source === edge.target && e.target === edge.source)
                      );

                      return (
                        <div
                          key={edge.id}
                          className={`flex items-center gap-4 p-3 rounded-lg border ${
                            studentHasEdge
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex-1 flex items-center gap-3">
                            <div className="text-sm font-medium text-ink">
                              {source?.author}
                            </div>
                            <div className="text-gray-400">→</div>
                            <div className="text-sm font-medium text-ink">
                              {target?.author}
                            </div>
                          </div>
                          {studentHasEdge ? (
                            <span className="text-green-600 text-sm flex items-center gap-1">
                              <Check className="w-4 h-4" />
                              你答对了
                            </span>
                          ) : (
                            <span className="text-red-600 text-sm flex items-center gap-1">
                              <X className="w-4 h-4" />
                              你遗漏了
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'turning' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gold-50 border border-gold-200 rounded-xl">
                    <h4 className="font-semibold text-gold-800 mb-2 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      关键拐点：{turningPointNode?.author}
                    </h4>
                    <p className="text-sm text-gold-700 leading-relaxed">
                      {event.turningPointExplanation}
                    </p>
                  </div>

                  <div className="p-4 bg-white border border-gray-200 rounded-xl">
                    <h4 className="font-medium text-ink mb-3">你的答案</h4>
                    {progress.selectedTurningPoint ? (
                      <div className="flex items-center gap-3">
                        <span className="text-sm">
                          你选择了：{event.nodes.find((n) => n.id === progress.selectedTurningPoint)?.author}
                        </span>
                        {progress.turningPointCorrect ? (
                          <span className="text-green-600 text-sm flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            正确
                          </span>
                        ) : (
                          <span className="text-red-600 text-sm flex items-center gap-1">
                            <X className="w-4 h-4" />
                            错误
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">未作答</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/student"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              返回事件列表
            </Link>

            <button
              onClick={() => navigate('/student')}
              className="px-8 py-3 bg-primary-700 text-white rounded-xl font-semibold hover:bg-primary-800 transition-all shadow-md hover:shadow-lg"
            >
              选择其他事件
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
