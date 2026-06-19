import { Link } from 'react-router-dom';
import { GraduationCap, Users, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-800 rounded-2xl mb-6 shadow-lg">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink mb-4">
            谣言扩散路径分析
          </h1>
          <p className="text-lg text-primary-600 max-w-xl mx-auto leading-relaxed">
            面向高校新闻传播课程的互动式教学工具
            <br />
            在实战演练中理解信源核查、二次传播与舆情扩散机制
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl animate-slide-up">
          <Link
            to="/student"
            className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-300"
          >
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <GraduationCap className="w-7 h-7 text-primary-700" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-ink mb-2">学生端</h2>
                <p className="text-primary-600 text-sm leading-relaxed mb-4">
                  选择模拟事件，完成「找源头、连路径、判拐点」三步演练，即时获得反馈
                </p>
                <div className="flex items-center text-primary-700 font-medium text-sm">
                  开始演练
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/teacher"
            className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-gold-400"
          >
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-14 h-14 bg-gold-100 rounded-xl flex items-center justify-center group-hover:bg-gold-200 transition-colors">
                <Users className="w-7 h-7 text-gold-700" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-ink mb-2">教师投屏端</h2>
                <p className="text-primary-600 text-sm leading-relaxed mb-4">
                  查看全班完成度、常见误判，展示最佳路径答案，辅助课堂讲解
                </p>
                <div className="flex items-center text-gold-700 font-medium text-sm">
                  进入投屏
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center text-primary-500 text-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p>三步核心玩法：找源头 → 连路径 → 判拐点</p>
        </div>
      </div>

      <footer className="py-6 text-center text-primary-400 text-xs">
        新闻传播学课程教学工具 · 互动式谣言扩散分析演练
      </footer>
    </div>
  );
}
