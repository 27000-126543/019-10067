import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  pointerWithin,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Info } from 'lucide-react';
import StepIndicator from '@/components/layout/StepIndicator';
import SortableCard from '@/components/timeline/SortableCard';
import { getEventById } from '@/data';
import { useGameStore } from '@/store/useGameStore';
import { validateTimelineOrder } from '@/utils/validation';

export default function TimelinePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const event = eventId ? getEventById(eventId) : undefined;
  const { progress, setCurrentEvent, setTimelineOrder, setTimelineScore, resetProgress } =
    useGameStore();

  const [availableCards, setAvailableCards] = useState<string[]>([]);
  const [timelineOrder, setTimelineOrderState] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctPositions, setCorrectPositions] = useState<boolean[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const timelineDropRef = useRef<HTMLDivElement>(null);
  const availableDropRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (eventId) {
      setCurrentEvent(eventId);
    }
  }, [eventId, setCurrentEvent]);

  useEffect(() => {
    if (event && progress && !initialized) {
      if (progress.timelineOrder.length > 0) {
        setTimelineOrderState(progress.timelineOrder);
        const remaining = event.nodes
          .map((n) => n.id)
          .filter((id) => !progress.timelineOrder.includes(id));
        setAvailableCards(remaining);
        if (progress.timelineScore > 0 && progress.timelineOrder.length === event.nodes.length) {
          const result = validateTimelineOrder(progress.timelineOrder, event.correctOrder);
          setCorrectPositions(result.correctPositions);
          setShowFeedback(true);
        }
      } else {
        const shuffled = [...event.nodes].sort(() => Math.random() - 0.5);
        setAvailableCards(shuffled.map((n) => n.id));
        setTimelineOrderState([]);
      }
      setInitialized(true);
    }
  }, [event, progress, initialized]);

  if (!event) {
    return <div className="p-8 text-center">事件不存在</div>;
  }

  if (!progress) {
    return <div className="p-8 text-center text-primary-500">加载中...</div>;
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    const activeIdStr = active.id as string;
    const activeInTimeline = timelineOrder.includes(activeIdStr);
    const activeInAvailable = availableCards.includes(activeIdStr);

    if (!activeInTimeline && !activeInAvailable) return;

    const overId = over?.id as string | undefined;

    const getElementDropZone = () => {
      const activator = event.activatorEvent as PointerEvent | undefined;
      if (!activator) return null;
      const el = document.elementFromPoint(activator.clientX, activator.clientY);
      if (!el) return null;
      if (el.closest('[data-dropzone="timeline"]')) return 'timeline';
      if (el.closest('[data-dropzone="available"]')) return 'available';
      return null;
    };

    const dropZone = getElementDropZone();
    const overInTimeline = overId ? timelineOrder.includes(overId) : false;
    const overInAvailable = overId ? availableCards.includes(overId) : false;

    if (activeInAvailable) {
      if (overInTimeline) {
        const overIndex = timelineOrder.indexOf(overId!);
        const newOrder = [...timelineOrder];
        newOrder.splice(overIndex, 0, activeIdStr);
        setTimelineOrderState(newOrder);
        setTimelineOrder(newOrder);
        setAvailableCards((prev) => prev.filter((id) => id !== activeIdStr));
        setShowFeedback(false);
      } else if (overInAvailable) {
        const oldIndex = availableCards.indexOf(activeIdStr);
        const newIndex = availableCards.indexOf(overId!);
        setAvailableCards((prev) => arrayMove(prev, oldIndex, newIndex));
      } else if (dropZone === 'timeline') {
        const newOrder = [...timelineOrder, activeIdStr];
        setTimelineOrderState(newOrder);
        setTimelineOrder(newOrder);
        setAvailableCards((prev) => prev.filter((id) => id !== activeIdStr));
        setShowFeedback(false);
      }
    } else if (activeInTimeline) {
      if (overInTimeline && overId !== activeIdStr) {
        const oldIndex = timelineOrder.indexOf(activeIdStr);
        const newIndex = timelineOrder.indexOf(overId!);
        const newOrder = arrayMove(timelineOrder, oldIndex, newIndex);
        setTimelineOrderState(newOrder);
        setTimelineOrder(newOrder);
        setShowFeedback(false);
      } else if (overInAvailable || dropZone === 'available') {
        const newOrder = timelineOrder.filter((id) => id !== activeIdStr);
        setTimelineOrderState(newOrder);
        setTimelineOrder(newOrder);
        setAvailableCards((prev) => [...prev, activeIdStr]);
        setShowFeedback(false);
      } else if (dropZone === 'timeline') {
        const without = timelineOrder.filter((id) => id !== activeIdStr);
        const newOrder = [...without, activeIdStr];
        setTimelineOrderState(newOrder);
        setTimelineOrder(newOrder);
        setShowFeedback(false);
      }
    }
  };

  const handleCheck = () => {
    if (timelineOrder.length !== event.nodes.length) return;

    const result = validateTimelineOrder(timelineOrder, event.correctOrder);
    setCorrectPositions(result.correctPositions);
    setTimelineScore(result.score);
    setShowFeedback(true);
  };

  const handleReset = () => {
    if (eventId) {
      resetProgress(eventId);
      setInitialized(false);
      setTimeout(() => {
        setCurrentEvent(eventId);
      }, 0);
      setShowFeedback(false);
      setCorrectPositions([]);
    }
  };

  const canProceed =
    timelineOrder.length === event.nodes.length &&
    showFeedback &&
    correctPositions.every(Boolean);

  const score = showFeedback
    ? Math.round((correctPositions.filter(Boolean).length / timelineOrder.length) * 100)
    : 0;

  const getNodeById = (id: string) => event.nodes.find((n) => n.id === id);

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/student"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">返回事件选择</span>
            </Link>
            <StepIndicator currentStep="timeline" />
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-serif font-bold text-ink mb-2">
              {event.title}
            </h1>
            <p className="text-primary-600">
              第一步：将信息卡片按发布时间从早到晚排列
            </p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 h-full">
                  <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-sm text-primary-700">
                      {availableCards.length}
                    </span>
                    待排序卡片
                  </h3>
                  <div
                    ref={availableDropRef}
                    data-dropzone="available"
                    className={`
                      min-h-[600px] p-4 rounded-lg border-2 border-dashed transition-colors
                      ${availableCards.length === 0 ? 'border-gray-200 bg-gray-50' : 'border-gray-200'}
                    `}
                  >
                    <SortableContext
                      items={availableCards}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-4 items-center">
                        {availableCards.map((id) => {
                          const node = getNodeById(id);
                          if (!node) return null;
                          return <SortableCard key={id} node={node} />;
                        })}
                      </div>
                    </SortableContext>
                    {availableCards.length === 0 && (
                      <p className="text-center text-gray-400 text-sm py-12">
                        所有卡片已放到时间线上
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-ink flex items-center gap-2">
                      时间线
                      <span className="text-sm font-normal text-primary-500">
                        （从早到晚）
                      </span>
                    </h3>
                    {showFeedback && (
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-lg font-bold ${
                            score >= 80
                              ? 'text-green-600'
                              : score >= 60
                              ? 'text-amber-600'
                              : 'text-red-600'
                          }`}
                        >
                          {score}分
                        </span>
                        {score === 100 && (
                          <span className="text-green-600">
                            <Check className="w-5 h-5" />
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    ref={timelineDropRef}
                    data-dropzone="timeline"
                    className={`
                      relative min-h-[600px] p-6 rounded-lg border-2 border-dashed transition-colors
                      ${timelineOrder.length === 0 ? 'border-primary-400 bg-primary-50/50' : 'border-gray-200'}
                    `}
                  >
                    {timelineOrder.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center text-primary-500">
                          <Info className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p>将左侧卡片拖拽到此处</p>
                          <p className="text-sm">按发布时间从早到晚排列</p>
                        </div>
                      </div>
                    )}

                    <div className="absolute left-8 top-6 bottom-6 w-0.5 bg-primary-200"></div>

                    <SortableContext
                      items={timelineOrder}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-4 pl-14">
                        {timelineOrder.map((id, index) => {
                          const node = getNodeById(id);
                          if (!node) return null;
                          const isCorrect = showFeedback && correctPositions[index];
                          const isWrong = showFeedback && !correctPositions[index];

                          return (
                            <div key={id} className="relative">
                              <div
                                className={`
                                  absolute -left-10 top-1/2 -translate-y-1/2
                                  w-5 h-5 rounded-full border-2 bg-white
                                  ${showFeedback
                                    ? isCorrect
                                      ? 'border-green-500 bg-green-500'
                                      : 'border-red-500 bg-red-500'
                                    : 'border-primary-400'
                                  }
                                `}
                              />
                              <div className="absolute -left-24 top-1/2 -translate-y-1/2 w-14 text-right">
                                <span className="text-xs text-primary-500 font-medium">
                                  #{index + 1}
                                </span>
                              </div>
                              <SortableCard
                                node={node}
                                isCorrect={isCorrect}
                                isWrong={isWrong}
                                showFeedback={showFeedback}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </SortableContext>
                  </div>
                </div>
              </div>
            </div>
          </DndContext>

          <div className="flex items-center justify-between mt-8">
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
                  disabled={timelineOrder.length !== event.nodes.length}
                  className={`
                    px-8 py-3 rounded-xl font-semibold transition-all
                    ${timelineOrder.length === event.nodes.length
                      ? 'bg-primary-700 text-white hover:bg-primary-800 shadow-md hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  检查排序
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
                  onClick={() => navigate(`/student/network/${eventId}`)}
                  className="flex items-center gap-2 px-8 py-3 bg-gold-500 text-white rounded-xl font-semibold hover:bg-gold-600 transition-all shadow-md hover:shadow-lg"
                >
                  下一步：连路径
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
