import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Zap, HelpCircle, Target } from 'lucide-react';
import StepIndicator from '@/components/layout/StepIndicator';
import { getEventById } from '@/data';
import { useGameStore } from '@/store/useGameStore';
import { getPlatformLabel, formatNumber } from '@/utils/validation';
import type { PostNode } from '@/types';

export default function TurningPointPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const event = eventId ? getEventById(eventId) : undefined;
  const { progress, setTurningPoint, setTurningPointCorrect, completeGame } = useGameStore();

  const [showFeedback, setShowFeedback] = useState(false);
  const [sortedNodes, setSortedNodes] = useState<PostNode[]>([]);

  useEffect(() => {
    if (event) {
      const sorted = [...event.nodes].sort((a, b) => a.timestamp - b.timestamp);
      setSortedNodes(sorted);
    }
  }, [event]);

  if (!event || !progress) {
    return <div className="p-8 text-center">事件不存在</div>;
  }

  const selectedId = progress.selectedTurningPoint;
  const isCorrect = progress.turningPointCorrect;
  const correctNode = event.nodes.find((n) => n.id === event.turningPointId);

  const handleSelectNode = (nodeId: string) => {
    if (showFeedback) return;
    setTurningPoint(nodeId);
  };

  const handleCheck = () => {
    if (!selectedId) return;
    const correct = selectedId === event.turningPointId;
    setTurningPointCorrect(correct);
    setShowFeedback(true);
  };

  const handleComplete = () => {
    completeGame();
    navigate(`/student/result/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to={`/student/network/${eventId}`}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">返回上一步</span>
            </Link>
            <StepIndicator currentStep="turning" />
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-serif font-bold text-ink mb-2">
              {event.title}
            </h1>
            <p className="text-primary-600 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-gold-500" />
              第三步：找出谣言从小范围讨论变成公共舆情的关键拐点
            </p>
          </div>

          <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gold-800 mb-1">什么是传播拐点？</h3>
              <p className="text-sm text-gold-700 leading-relaxed">
                传播拐点是指谣言传播过程中的关键转折点。在拐点之前，谣言仅在小范围传播（如论坛、微信群），
                影响有限；经过拐点后，谣言迅速扩散到更大范围（如微博热搜、抖音热门），
                形成公共舆情事件。拐点通常由某个关键账号、某条爆款内容或某种改写方式触发。
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary-200 -translate-x-1/2"></div>

            <div className="space-y-6">
              {sortedNodes.map((node, index) => {
                const isSelected = selectedId === node.id;
                const isCorrectNode = node.id === event.turningPointId;
                const isLeft = index % 2 === 0;

                let borderStyle = 'border-gray-200';
                let ringStyle = '';

                if (showFeedback) {
                  if (isCorrectNode) {
                    borderStyle = 'border-green-400';
                    ringStyle = 'ring-2 ring-green-200';
                  } else if (isSelected && !isCorrect) {
                    borderStyle = 'border-red-400';
                    ringStyle = 'ring-2 ring-red-200';
                  }
                } else if (isSelected) {
                  borderStyle = 'border-gold-400';
                  ringStyle = 'ring-2 ring-gold-200';
                }

                return (
                  <div
                    key={node.id}
                    className={`relative flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`w-5/12 ${isLeft ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <div
                        onClick={() => handleSelectNode(node.id)}
                        className={`
                          inline-block cursor-pointer transition-all duration-200
                          ${isSelected && !showFeedback ? 'scale-105' : 'hover:scale-[1.02]'}
                          ${isSelected && isCorrectNode && showFeedback ? 'animate-pulse-gold' : ''}
                        `}
                      >
                        <div
                          className={`
                            bg-white rounded-xl border-2 ${borderStyle} ${ringStyle}
                            shadow-sm hover:shadow-md overflow-hidden w-72
                          `}
                        >
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
                              {isSelected && (
                                <Target className="w-5 h-5 text-gold-500" />
                              )}
                            </div>

                            <p className="text-xs text-ink leading-relaxed line-clamp-2 mb-2">
                              {node.content}
                            </p>

                            <div className="flex items-center gap-3 text-gray-400 text-xs">
                              <span>❤️ {formatNumber(node.likeCount)}</span>
                              <span>🔄 {formatNumber(node.repostCount)}</span>
                              <span>💬 {formatNumber(node.commentCount)}</span>
                            </div>
                          </div>

                          <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-500">{node.timeLabel}</span>
                            {showFeedback && isCorrectNode && (
                              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                正确拐点
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 z-10">
                      <div
                        className={`
                          w-6 h-6 rounded-full border-4 bg-white
                          ${showFeedback && isCorrectNode ? 'border-green-500 bg-green-500' : ''}
                          ${showFeedback && isSelected && !isCorrectNode ? 'border-red-500 bg-red-500' : ''}
                          ${!showFeedback && isSelected ? 'border-gold-500 bg-gold-500' : ''}
                          ${!showFeedback && !isSelected ? 'border-primary-300' : ''}
                          transition-colors
                        `}
                      />
                    </div>

                    <div className="w-5/12"></div>
                  </div>
                );
              })}
            </div>
          </div>

          {showFeedback && (
            <div
              className={`
                mt-10 p-6 rounded-xl border-2
                ${isCorrect
                  ? 'bg-green-50 border-green-200'
                  : 'bg-amber-50 border-amber-200'
                }
                animate-fade-in
              `}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                    ${isCorrect ? 'bg-green-100' : 'bg-amber-100'}
                  `}
                >
                  {isCorrect ? (
                    <Check className="w-6 h-6 text-green-600" />
                  ) : (
                    <Zap className="w-6 h-6 text-amber-600" />
                  )}
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      isCorrect ? 'text-green-800' : 'text-amber-800'
                    }`}
                  >
                    {isCorrect ? '回答正确！' : '回答错误'}
                  </h3>
                  {correctNode && (
                    <p
                      className={`text-sm mb-3 ${
                        isCorrect ? 'text-green-700' : 'text-amber-700'
                      }`}
                    >
                      正确答案是：<span className="font-medium">{correctNode.author}</span>
                      发布的内容
                    </p>
                  )}
                  <p
                    className={`text-sm leading-relaxed ${
                      isCorrect ? 'text-green-700' : 'text-amber-700'
                    }`}
                  >
                    {event.turningPointExplanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-primary-500">
              {selectedId ? '已选择拐点：' + event.nodes.find((n) => n.id === selectedId)?.author : '请点击选择拐点'}
            </div>

            <div className="flex items-center gap-4">
              {!showFeedback ? (
                <button
                  onClick={handleCheck}
                  disabled={!selectedId}
                  className={`
                    px-8 py-3 rounded-xl font-semibold transition-all
                    ${selectedId
                      ? 'bg-primary-700 text-white hover:bg-primary-800 shadow-md hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  提交答案
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowFeedback(false);
                    setTurningPoint(null);
                    setTurningPointCorrect(false);
                  }}
                  className="px-6 py-3 rounded-xl font-semibold border-2 border-primary-300 text-primary-700 hover:bg-primary-50 transition-colors"
                >
                  重新选择
                </button>
              )}

              {showFeedback && (
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-2 px-8 py-3 bg-gold-500 text-white rounded-xl font-semibold hover:bg-gold-600 transition-all shadow-md hover:shadow-lg"
                >
                  查看结果解析
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
