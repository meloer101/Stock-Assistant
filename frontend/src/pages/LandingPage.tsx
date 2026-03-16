import { motion } from "framer-motion";
import { ArrowRight, BarChart2, FileText, Globe, Zap, Search, MessageSquare, Shield, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const glassCardClass = "backdrop-blur-xl bg-white/40 border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-2xl p-8 hover:transform hover:-translate-y-1 transition-all duration-300";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#2C2C2C] overflow-x-hidden font-sans selection:bg-[#E85D35]/20">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-[#F9F8F6]/80 border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-[#E85D35]">✦</span> Research Terminal
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#666]">
            <a href="#features" className="hover:text-[#E85D35] transition-colors">功能</a>
            <a href="#product" className="hover:text-[#E85D35] transition-colors">产品</a>
            <a href="#contact" className="hover:text-[#E85D35] transition-colors">联系</a>
          </div>
          <button 
            onClick={() => navigate('/app')}
            className="bg-[#E85D35] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#D44C25] transition-colors shadow-lg shadow-[#E85D35]/20"
          >
            开始使用
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col justify-center items-center overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E85D35]/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[100px] -z-10" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E5E5] text-xs font-medium text-[#666] mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#E85D35]"></span> 现已上线
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-medium leading-[1.1] tracking-tight text-[#1A1A1A]">
            AI 驱动的<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E85D35] to-[#FF8F6B]">投资研究助手</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#666] max-w-2xl mx-auto leading-relaxed">
            统一聊天界面，完成股票分析、行业深度研究与 PDF 文档问答。让每一次投资决策都有据可依。
          </p>

          {/* Mock Input Interface */}
          <div className="relative max-w-2xl mx-auto w-full mt-12 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#E85D35] to-[#FF8F6B] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative bg-white rounded-xl shadow-2xl border border-[#E5E5E5] p-2 flex items-center gap-3">
              <div className="pl-4 text-[#999] font-mono text-sm">解读|</div>
              <input 
                type="text" 
                placeholder="试试输入你的研究问题" 
                className="flex-1 bg-transparent border-none outline-none text-[#333] placeholder:text-[#999] h-12"
                readOnly
              />
              <button 
                onClick={() => navigate('/app')}
                className="w-10 h-10 rounded-lg bg-[#E85D35] flex items-center justify-center text-white hover:bg-[#D44C25] transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="pt-8">
            <button 
              onClick={() => navigate('/app')}
              className="px-8 py-4 bg-[#E85D35] text-white rounded-full text-lg font-medium hover:bg-[#D44C25] transition-all shadow-xl shadow-[#E85D35]/30 hover:shadow-[#E85D35]/40 hover:-translate-y-1"
            >
              开始使用 →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-12 pt-12 border-t border-[#E5E5E5]/50 max-w-2xl mx-auto">
            <div>
              <div className="text-2xl font-bold text-[#1A1A1A]">10K+</div>
              <div className="text-sm text-[#666]">分析报告</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1A1A1A]">&lt;2s</div>
              <div className="text-sm text-[#666]">响应延迟</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1A1A1A]">99.9%</div>
              <div className="text-sm text-[#666]">系统可用</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-white relative overflow-hidden">
        {/* Background Blobs for Features */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-20 space-y-4"
          >
            <h2 className="text-4xl font-serif font-medium">三大核心能力</h2>
            <p className="text-[#666] text-lg">统一交互界面，三种专业工具，覆盖投资研究全流程。</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className={glassCardClass}>
              <div className="w-12 h-12 bg-[#FFF0EB] rounded-xl flex items-center justify-center text-[#E85D35] mb-6">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">股票分析</h3>
              <h4 className="text-sm font-mono text-[#999] mb-4 uppercase tracking-wider">Stock Analysis</h4>
              <p className="text-[#666] leading-relaxed">
                实时财务数据解读、技术面分析、估值模型，一句话生成专业研报级别的分析结论。
              </p>
              <div className="mt-8 pt-6 border-t border-[#F0F0F0] flex justify-between text-xs font-medium text-[#666]">
                <span>覆盖</span>
                <span>A股/港股/美股</span>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className={glassCardClass}>
              <div className="w-12 h-12 bg-[#FFF0EB] rounded-xl flex items-center justify-center text-[#E85D35] mb-6">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">深度研究</h3>
              <h4 className="text-sm font-mono text-[#999] mb-4 uppercase tracking-wider">Deep Research</h4>
              <p className="text-[#666] leading-relaxed">
                跨行业、跨主题的深度分析能力，自动检索信息并生成结构化研究报告。
              </p>
              <div className="mt-8 pt-6 border-t border-[#F0F0F0] flex justify-between text-xs font-medium text-[#666]">
                <span>覆盖行业</span>
                <span>200+</span>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className={glassCardClass}>
              <div className="w-12 h-12 bg-[#FFF0EB] rounded-xl flex items-center justify-center text-[#E85D35] mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">PDF 文档问答</h3>
              <h4 className="text-sm font-mono text-[#999] mb-4 uppercase tracking-wider">PDF Q&A</h4>
              <p className="text-[#666] leading-relaxed">
                上传年报、招股书、研报等 PDF，AI 精准定位并回答你的问题。
              </p>
              <div className="mt-8 pt-6 border-t border-[#F0F0F0] flex justify-between text-xs font-medium text-[#666]">
                <span>支持格式</span>
                <span>PDF / Word</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 px-6 bg-[#F9F8F6] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E5E5E5] to-transparent"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-start">
          <motion.div {...fadeInUp} className="md:w-1/3 sticky top-32">
            <h2 className="text-4xl font-serif font-medium mb-6">为什么选择<br /><span className="text-[#E85D35]">Research Terminal</span></h2>
            <p className="text-[#666] text-lg leading-relaxed">
              我们重新定义了投资研究的工作流。将分散的工具整合进一个智能终端，让专业能力触手可及。
            </p>
          </motion.div>

          <div className="md:w-2/3 grid grid-cols-1 gap-6">
            {[
              { icon: Zap, title: "极速响应", desc: "基于大规模语言模型优化推理链路，平均响应时间 <2 秒，让研究效率成倍提升。" },
              { icon: Shield, title: "数据安全", desc: "企业级加密传输与存储，上传文档不留存，确保研究数据的绝对隐私。" },
              { icon: Globe, title: "实时数据", desc: "对接专业金融数据源，提供实时行情、财务数据和公告信息。" },
              { icon: Layers, title: "多模态输入", desc: "支持文本、PDF、图片等多种输入格式，灵活适配不同研究场景。" }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-[#E5E5E5] shadow-sm hover:shadow-md transition-shadow flex items-start gap-6"
              >
                <div className="w-10 h-10 bg-[#FFF0EB] rounded-lg flex items-center justify-center text-[#E85D35] shrink-0">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-[#666]">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-20 px-6 bg-white border-t border-[#E5E5E5]">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl font-serif font-medium mb-4">联系我们</h2>
            <p className="text-[#666]">有任何问题或合作意向？随时联系。</p>
          </motion.div>

          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.1 }}
            className="bg-[#F9F8F6] rounded-2xl p-8 border border-[#E5E5E5] inline-block w-full max-w-md"
          >
            <div className="space-y-6 text-left">
              <a href="mailto:contact@research-terminal.ai" className="flex items-center gap-4 text-[#333] hover:text-[#E85D35] transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#E5E5E5] group-hover:border-[#E85D35]">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="font-medium">contact@research-terminal.ai</span>
              </a>
              <a href="#" className="flex items-center gap-4 text-[#333] hover:text-[#E85D35] transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#E5E5E5] group-hover:border-[#E85D35]">
                  <Globe className="w-4 h-4" />
                </div>
                <span className="font-medium">LinkedIn</span>
              </a>
              <a href="#" className="flex items-center gap-4 text-[#333] hover:text-[#E85D35] transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#E5E5E5] group-hover:border-[#E85D35]">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="font-medium">GitHub</span>
              </a>
            </div>
          </motion.div>

          <div className="text-sm text-[#999]">
            © 2024 Research Terminal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
