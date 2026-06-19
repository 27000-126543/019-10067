import { Link } from 'react-router-dom';
import { ArrowLeft, Monitor, Users, BarChart3 } from 'lucide-react';
import { events } from '@/data';
import { useClassStore } from '@/store/useClassStore';
import { useEffect } from 'react';

export default function TeacherHomePage() {
  const { initStats, statsByEvent } = useClassStore();

  useEffect(() => {
    initStats();
  }, [initStats]);

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-primary-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-primary-200 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">返回首页</span>
            </Link>
            <div className="flex items-center gap-3">
              <Monitor className="w-6 h-6 text-gold-400" />
              <span className="text-lg font-semibold">教师投屏端</span>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-serif font-bold text-ink mb-3">
            选择演练事件
          </h1>
          <p className="text-primary-600">
            选择一个事件查看全班演练进度和统计数据
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const stats = statsByEvent[event.id];
            const completionRate = stats
              ? Math.round((stats.completedStudents / stats.totalStudents) * 100)
              : 0;

            return (
              <Link
                key={event.id}
                to={`/teacher/dashboard/${event.id}`}
                className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gold-300"
              >
                <div className="h-36 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-3 left-5 text-5xl">📊</div>
                    <div className="absolute bottom-2 right-6 text-3xl">🎯</div>
                  </div>
                  <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                    <div className="text-white">
                      <div className="text-2xl font-bold">
                        {stats?.totalStudents || 0}
                      </div>
                      <div className="text-xs text-primary-200">学生总数</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gold-400">
                        {completionRate}%
                      </div>
                      <div className="text-xs text-primary-200">完成率</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-serif font-semibold text-ink mb-2 group-hover:text-primary-800 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-primary-600 text-sm leading-relaxed mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  {stats && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs text-primary-500 mb-1">
                          <span>完成进度</span>
                          <span>{stats.completedStudents} / {stats.totalStudents}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gold-500 rounded-full transition-all duration-500"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-primary-400" />
                          <span className="text-xs text-primary-600">
                            平均分：{stats.averageTimelineScore}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary-400" />
                          <span className="text-xs text-primary-600">
                            {stats.commonMistakes.length} 个常见误区
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-end text-gold-600 font-medium text-sm">
                      进入投屏
                      <ArrowLeft className="w-4 h-4 ml-1 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
