import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, RefreshCw } from 'lucide-react';
import EventCard from '@/components/common/EventCard';
import { events } from '@/data';
import type { StudentProgress } from '@/types';

export default function EventSelectPage() {
  const [allProgress, setAllProgress] = useState<Record<string, StudentProgress>>({});

  const loadAllProgress = () => {
    const result: Record<string, StudentProgress> = {};
    for (const event of events) {
      const saved = localStorage.getItem(`progress_${event.id}`);
      if (saved) {
        try {
          result[event.id] = JSON.parse(saved);
        } catch (e) {
          // ignore parse errors
        }
      }
    }
    setAllProgress(result);
  };

  useEffect(() => {
    loadAllProgress();
  }, []);

  const handleResetAll = () => {
    if (confirm('确定要清除所有事件的演练进度吗？此操作不可恢复。')) {
      for (const event of events) {
        localStorage.removeItem(`progress_${event.id}`);
      }
      loadAllProgress();
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">返回首页</span>
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-700" />
              <span className="font-semibold text-ink">学生端 · 选择事件</span>
            </div>
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 text-sm text-primary-500 hover:text-accent-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>清除进度</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-serif font-bold text-ink mb-3">
            选择模拟事件
          </h1>
          <p className="text-primary-600">
            选择一个事件开始谣言扩散路径分析演练
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} progress={allProgress[event.id]} />
          ))}
        </div>

        <div className="mt-12 bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="font-semibold text-ink mb-4">演练说明</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-medium text-ink mb-1">找源头</h4>
                <p className="text-sm text-primary-600">
                  将打乱的信息卡片按发布时间排序，找出最早的信息源头
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-medium text-ink mb-1">连路径</h4>
                <p className="text-sm text-primary-600">
                  在信息节点间连线，还原转述、转发、评论的传播关系
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-medium text-ink mb-1">判拐点</h4>
                <p className="text-sm text-primary-600">
                  找出谣言从小范围讨论变成公共舆情的关键转折点
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
