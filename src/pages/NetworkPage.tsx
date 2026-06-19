import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw, Eye, EyeOff, Info, Trash2 } from 'lucide-react';
import StepIndicator from '@/components/layout/StepIndicator';
import NetworkCanvas from '@/components/network/NetworkCanvas';
import { getEventById } from '@/data';
import { useGameStore } from '@/store/useGameStore';
import { getEdgeCorrectness, calculateNetworkScore } from '@/utils/validation';
import type { Edge, PostNode } from '@/types';

export default function NetworkPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const event = eventId ? getEventById(eventId) : undefined;
  const { progress, setCurrentEvent, addEdge, removeEdge, setNetworkScore } = useGameStore();

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showNodeTypes, setShowNodeTypes] = useState(false);
  const [nodes, setNodes] = useState<PostNode[]>([]);
  const [edgesWithFeedback, setEdgesWithFeedback] = useState<Edge[]>([]);

  useEffect(() => {
    if (eventId) {
      setCurrentEvent(eventId);
    }
  }, [eventId, setCurrentEvent]);

  useEffect(() => {
    if (event) {
      setNodes([...event.nodes]);
    }
  }, [event]);

  useEffect(() => {
    if (progress && event) {
      const edges = progress.studentEdges.map((edge) =>
        getEdgeCorrectness(edge, event.correctEdges)
      );
      setEdgesWithFeedback(edges);

      if (progress.networkScore > 0 || showFeedback) {
        const score = calculateNetworkScore(edges, event.correctEdges);
        setNetworkScore(score);
        setShowFeedback(true);
      }
    }
  }, [progress, event, showFeedback, setNetworkScore]);

  if (!event) {
    return <div className="p-8 text-center">事件不存在</div>;
  }

  if (!progress) {
    return <div className="p-8 text-center text-primary-500">加载中...</div>;
  }

  const handleSelectNode = (nodeId: string) => {
    setSelectedNode(nodeId || null);
  };

  const handleConnect = (sourceId: string, targetId: string) => {
    const existingEdge = progress.studentEdges.find(
      (e) => e.source === sourceId && e.target === targetId
    );

    if (existingEdge) {
      return;
    }

    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: 'direct-repost',
    };

    addEdge(newEdge);
    setShowFeedback(false);
  };

  const handleRemoveEdge = (edgeId: string) => {
    removeEdge(edgeId);
    setShowFeedback(false);
  };

  const handleNodePositionChange = (nodeId: string, position: { x: number; y: number }) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, position } : n))
    );
  };

  const handleCheck = () => {
    setShowFeedback(true);
    setShowNodeTypes(true);
    const score = calculateNetworkScore(edgesWithFeedback, event.correctEdges);
    setNetworkScore(score);
  };

  const handleReset = () => {
    progress.studentEdges.forEach((edge) => removeEdge(edge.id));
    setShowFeedback(false);
    setShowNodeTypes(false);
    setSelectedNode(null);
  };

  const score = showFeedback
    ? calculateNetworkScore(edgesWithFeedback, event.correctEdges)
    : 0;

  const correctCount = edgesWithFeedback.filter((e) => e.isCorrect).length;
  const totalCorrect = event.correctEdges.length;

  const canProceed =
    showFeedback && correctCount >= totalCorrect * 0.6;

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to={`/student/timeline/${eventId}`}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">返回上一步</span>
            </Link>
            <StepIndicator currentStep="network" />
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-serif font-bold text-ink mb-2">
              {event.title}
            </h1>
            <p className="text-primary-600">
              第二步：在信息节点之间连线，还原传播关系
            </p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                <h3 className="font-semibold text-ink">操作说明</h3>

                <div className="space-y-3 text-sm text-primary-600">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <p>点击一个节点作为传播起点</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <p>再点击另一个节点建立传播关系</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <p>双击或点击连线可删除</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      4
                    </span>
                    <p>拖拽节点可以调整位置</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-primary-600">已连线条数</span>
                    <span className="font-semibold text-ink">
                      {progress.studentEdges.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-primary-600">正确连线数</span>
                    <span
                      className={`font-semibold ${
                        showFeedback
                          ? correctCount >= totalCorrect * 0.6
                            ? 'text-green-600'
                            : 'text-red-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {showFeedback ? `${correctCount} / ${totalCorrect}` : '?'}
                    </span>
                  </div>
                  {showFeedback && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary-600">得分</span>
                      <span
                        className={`font-bold text-lg ${
                          score >= 80
                            ? 'text-green-600'
                            : score >= 60
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        {score}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <button
                    onClick={() => setShowNodeTypes(!showNodeTypes)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {showNodeTypes ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                      {showNodeTypes ? '隐藏节点类型' : '显示节点类型'}
                    </span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    清空所有连线
                  </button>
                </div>

                {showFeedback && (
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-medium text-ink mb-2">图例</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-green-500 rounded"></div>
                        <span className="text-primary-600">正确连线</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-red-500 rounded"></div>
                        <span className="text-primary-600">错误连线</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-9">
              <NetworkCanvas
                nodes={nodes}
                edges={showFeedback ? edgesWithFeedback : progress.studentEdges}
                selectedNode={selectedNode}
                showNodeTypes={showNodeTypes}
                onSelectNode={handleSelectNode}
                onConnect={handleConnect}
                onRemoveEdge={handleRemoveEdge}
                onNodePositionChange={handleNodePositionChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 text-primary-600 hover:text-primary-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              重新开始
            </button>

            <div className="flex items-center gap-4">
              {!showFeedback ? (
                <button
                  onClick={handleCheck}
                  disabled={progress.studentEdges.length === 0}
                  className={`
                    px-8 py-3 rounded-xl font-semibold transition-all
                    ${progress.studentEdges.length > 0
                      ? 'bg-primary-700 text-white hover:bg-primary-800 shadow-md hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  检查连线
                </button>
              ) : (
                <button
                  onClick={() => setShowFeedback(false)}
                  className="px-6 py-3 rounded-xl font-semibold border-2 border-primary-300 text-primary-700 hover:bg-primary-50 transition-colors"
                >
                  继续调整
                </button>
              )}

              {canProceed && (
                <button
                  onClick={() => navigate(`/student/turning/${eventId}`)}
                  className="flex items-center gap-2 px-8 py-3 bg-gold-500 text-white rounded-xl font-semibold hover:bg-gold-600 transition-all shadow-md hover:shadow-lg"
                >
                  下一步：判拐点
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
