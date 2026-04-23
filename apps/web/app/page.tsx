const stats = [
  {
    value: "2",
    label: "角色入口",
    description: "学生端与管理后台清晰分层"
  },
  {
    value: "3",
    label: "题型支持",
    description: "单选、判断、简答"
  },
  {
    value: "闭环",
    label: "业务状态",
    description: "从出题到出分已完整打通"
  }
];

const valueProps = [
  {
    title: "围绕考试业务闭环设计",
    description: "题库管理、考试发布、学生答题、保存回填、自动判分、人工复核与成绩回看，全部串在一条清晰链路里。"
  },
  {
    title: "双端体验边界明确",
    description: "学生端强调专注、稳定和低打扰，管理后台强调规整、可控和可复核，角色体验各自清楚。"
  },
  {
    title: "适合展示，也适合继续扩展",
    description: "它既能作为完整演示项目使用，也保留了继续往真实产品推进的工程化结构。"
  }
];

const featureCards = [
  {
    title: "混合评分机制",
    description: "客观题自动判分，简答题进入待复核，兼顾效率与实际教学场景。"
  },
  {
    title: "答案保存与回填",
    description: "学生保存答案后刷新页面，已保存内容可回显，更接近真实考试产品体验。"
  },
  {
    title: "后台统计能力",
    description: "支持发布考试数、提交数、平均分、通过率与错题率等关键指标的统一查看。"
  }
];

const studentFeatures = [
  "查看已发布考试",
  "开始考试或继续作答",
  "保存答案并刷新回填",
  "提交试卷并查看历史成绩"
];

const adminFeatures = [
  "题库创建与编辑",
  "考试创建、发布与绑定题目",
  "提交记录查看与简答题复核",
  "后台统计与成绩观察"
];

const workflow = [
  "管理员登录后台，创建单选题、判断题和简答题。",
  "创建考试并发布，绑定题目形成考试内容。",
  "学生登录进入考试列表，开始作答并保存答案。",
  "刷新页面验证回填，然后提交试卷。",
  "系统自动判分客观题，简答题进入待复核。",
  "管理员查看 submissions 完成人工复核。",
  "学生查看 history，管理员查看 scores。"
];

const useCases = [
  {
    title: "课程设计 / 毕设展示",
    description: "适合展示权限控制、状态流、前后端联动和完整业务闭环能力。"
  },
  {
    title: "考试系统原型",
    description: "可以作为学校、培训机构或内部考试平台的早期原型继续推进。"
  },
  {
    title: "作品集项目",
    description: "比单页展示项目更能体现工程化思维和真实产品意识。"
  }
];

const faqs = [
  {
    question: "这套系统现在是展示页，还是已经能跑通业务？",
    answer: "它已经不是单纯展示页，而是一套能够从建题、建考试，到答题、判分、复核、查看成绩完整跑通的 MVP。"
  },
  {
    question: "为什么需要这个统一首页？",
    answer: "因为 student、admin、server 原本是分开的入口。官网首页把系统定位、角色入口和演示路径统一起来，更像一套完整产品。"
  },
  {
    question: "适合拿来做什么？",
    answer: "适合作品集、课程设计、毕业项目、答辩演示，也适合继续扩展成更完整的考试管理系统。"
  }
];

function SectionTitle({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-sm font-semibold text-blue-700">{eyebrow}</p>
      <h3 className="text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">{title}</h3>
      <p className="text-sm leading-7 text-slate-600 md:text-base">{description}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f3f5f7] text-slate-900">
      <section className="relative overflow-hidden bg-slate-950">
        <img
          src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1800&q=80"
          alt="在线考试与学习管理场景"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.42),rgba(2,6,23,0.82))]" />

        <header className="relative z-10 border-b border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">Exam System</p>
              <h1 className="mt-1 text-lg font-semibold text-white">在线考试与管理系统</h1>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <nav className="flex items-center gap-2 text-sm text-slate-200">
                <a className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white" href="#product">
                  产品能力
                </a>
                <a className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white" href="#roles">
                  双端入口
                </a>
                <a className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white" href="#preview">
                  界面预览
                </a>
                <a className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white" href="#workflow">
                  演示流程
                </a>
              </nav>

              <a
                href="http://localhost:3003/login"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
              >
                管理员登录
              </a>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[76vh] max-w-7xl items-center px-6 py-16 md:min-h-[82vh] md:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] lg:items-end">
            <div className="max-w-4xl space-y-6">
              <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-blue-100">
                一个更像正式产品官网的统一入口
              </p>
              <h2 className="text-4xl font-semibold leading-tight text-white md:text-6xl md:leading-[1.06]">
                让考试的组织、作答、判分与复核，在同一套系统里自然完成
              </h2>
              <p className="max-w-3xl text-base leading-8 text-slate-200 md:text-lg">
                这是一套面向在线考试场景的管理系统，覆盖题库管理、考试发布、学生答题、答案保存回填、
                自动判分、人工复核、历史成绩与后台统计。现在，它也有了一个更完整、更专业的统一首页。
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="http://localhost:3002/login"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-slate-100"
                >
                  进入学生端
                </a>
                <a
                  href="http://localhost:3003/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  进入管理后台
                </a>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-5 text-white">
                <p className="text-sm text-slate-300">当前版本能力</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {stats.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-slate-300">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                      <p className="mt-2 text-xs leading-6 text-slate-300">{item.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">
                  适合用来做课程设计、作品集项目、答辩演示，或者继续向真实产品原型扩展。
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle
          eyebrow="产品能力"
          title="不是只会跳转的首页，而是能把系统价值讲清楚的产品入口"
          description="首页应该先建立理解，再提供入口。我们把这套系统最重要的能力、边界和使用路径，收进统一的产品表达里。"
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {valueProps.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-950">{item.title}</h4>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            </div>
          ))}
          {featureCards.slice(0, 3).map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-950">{item.title}</h4>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="roles" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SectionTitle
            eyebrow="双端入口"
            title="同一套系统，两种清晰的使用视角"
            description="学生端负责考试体验，管理后台负责组织和控制。入口分明，叙事也更自然。"
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-8">
              <p className="text-sm font-semibold text-blue-700">Student App</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-950">更专注的考试体验</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                从考试列表、答题页到历史成绩，学生端围绕“快速进入、持续作答、清楚反馈”来组织界面与流程。
              </p>

              <div className="mt-6 grid gap-3">
                {studentFeatures.map((item) => (
                  <div key={item} className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                    {item}
                  </div>
                ))}
              </div>

              <a
                href="http://localhost:3002/login"
                className="mt-8 inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
                进入学生端
              </a>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-8">
              <p className="text-sm font-semibold text-blue-700">Admin Console</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-950">更规整的管理视角</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                管理端将题库、考试、提交记录、人工复核和统计整合到一个稳定的后台里，适合完整演示管理链路。
              </p>

              <div className="mt-6 grid gap-3">
                {adminFeatures.map((item) => (
                  <div key={item} className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                    {item}
                  </div>
                ))}
              </div>

              <a
                href="http://localhost:3003/login"
                className="mt-8 inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
                进入管理后台
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="preview" className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle
          eyebrow="界面预览"
          title="把系统气质提前呈现在官网里"
          description="统一的产品首页，不只是讲功能，也要提前传达学生端与管理后台各自的体验风格。"
        />

        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
              <div className="h-3 w-3 rounded-full bg-rose-300" />
              <div className="h-3 w-3 rounded-full bg-amber-300" />
              <div className="h-3 w-3 rounded-full bg-emerald-300" />
              <div className="ml-3 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">Student App Preview</div>
            </div>

            <div className="space-y-6 bg-slate-50 p-6">
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">当前考试</p>
                    <h4 className="text-xl font-semibold text-slate-950">前端工程化能力测试</h4>
                    <p className="text-sm text-slate-600">时长 60 分钟 · 已恢复作答进度</p>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                    in_progress
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-900">1. React 中最常用的状态管理 Hook 是什么？</p>
                  <div className="mt-4 grid gap-2">
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">A. useState</div>
                    <div className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">B. useMemo</div>
                    <div className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">C. useRef</div>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-900">2. 请简述你理解的前端分页设计思路。</p>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    支持本地分页、服务端分页，以及筛选条件变化时的页码重置逻辑...
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-3xl bg-slate-950 px-5 py-4 text-white">
                <p className="text-sm text-slate-300">已保存 6 / 10 题</p>
                <div className="flex gap-3">
                  <div className="rounded-2xl border border-white/15 px-4 py-2 text-sm">保存答案</div>
                  <div className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-950">提交试卷</div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
              <div className="h-3 w-3 rounded-full bg-rose-300" />
              <div className="h-3 w-3 rounded-full bg-amber-300" />
              <div className="h-3 w-3 rounded-full bg-emerald-300" />
              <div className="ml-3 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">Admin Console Preview</div>
            </div>

            <div className="grid min-h-[540px] gap-0 md:grid-cols-[220px,1fr]">
              <div className="border-r border-slate-200 bg-slate-950 p-5 text-slate-200">
                <p className="text-sm font-semibold text-white">管理后台</p>
                <div className="mt-6 grid gap-2 text-sm">
                  <div className="rounded-2xl bg-white/10 px-3 py-2 text-white">仪表盘</div>
                  <div className="rounded-2xl px-3 py-2 text-slate-300">题库管理</div>
                  <div className="rounded-2xl px-3 py-2 text-slate-300">考试管理</div>
                  <div className="rounded-2xl px-3 py-2 text-slate-300">提交记录</div>
                  <div className="rounded-2xl px-3 py-2 text-slate-300">统计分析</div>
                </div>
              </div>

              <div className="space-y-5 bg-slate-50 p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">已发布考试</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">12</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">待复核</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">8</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">平均分</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">78.5</p>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">待复核提交记录</p>
                      <p className="mt-1 text-sm text-slate-500">人工复核区会集中处理 short_answer 题目。</p>
                    </div>
                    <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                      pending_review
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      "计算机网络基础测验 / Student User / 待复核",
                      "前端工程化期中测试 / Student User / 待复核",
                      "数据库设计练习 / Student User / 已出分"
                    ].map((row) => (
                      <div key={row} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
                        {row}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[0.95fr,1.05fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-blue-300">Product Positioning</p>
            <h3 className="text-3xl font-semibold md:text-4xl">从“项目能跑”到“产品成立”，首页负责把这一步补上</h3>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              对外看，它是一个统一、专业、可信的产品入口；对内看，它把 student、admin、server 这些独立部分组织成一套完整体验。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-blue-200">学生侧体验</p>
              <h4 className="mt-2 text-2xl font-semibold">清晰、稳定、少打扰</h4>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                用更少的视觉干扰承载完整考试链路，让学生快速进入、持续作答并获得明确反馈。
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-blue-200">管理侧体验</p>
              <h4 className="mt-2 text-2xl font-semibold">规整、可控、可复核</h4>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                把题库、考试、复核和统计整合到同一个后台视角里，更接近真实产品中的管理系统形态。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle
          eyebrow="演示流程"
          title="从管理员建题，到学生出分，一条线走完整套系统"
          description="如果你要从头捋一遍系统，按下面这条路径走，会非常顺。"
        />

        <div className="mt-10 space-y-4">
          {workflow.map((step, index) => (
            <div key={step} className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-semibold text-white">
                {index + 1}
              </div>
              <p className="pt-1 text-sm leading-7 text-slate-700">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SectionTitle
            eyebrow="适用场景"
            title="它不只是一个能演示的页面，也是一套值得讲清价值的系统"
            description="做长首页的目的，不是把页面拉长，而是把系统从“功能能跑”推进到“产品表达也成立”。"
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {useCases.map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h4 className="text-lg font-semibold text-slate-950">{item.title}</h4>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SectionTitle
            eyebrow="FAQ"
            title="把别人最容易问的问题，提前回答掉"
            description="专业感很多时候来自提前把关键信息说清楚。"
          />

          <div className="mt-10 grid gap-4">
            {faqs.map((item) => (
              <div key={item.question} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h4 className="text-lg font-semibold text-slate-950">{item.question}</h4>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-white md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr,auto] lg:items-end">
              <div className="space-y-4">
                <p className="text-sm font-semibold text-blue-200">Ready To Explore</p>
                <h3 className="text-3xl font-semibold md:text-4xl">从这个首页出发，把整套系统顺着流程走一遍</h3>
                <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                  现在这个首页已经更接近正式产品官网。接下来你可以直接进入学生端或管理后台，从头把系统完整过一遍。
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="http://localhost:3002/login"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
                >
                  打开学生端
                </a>
                <a
                  href="http://localhost:3003/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  打开管理后台
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#f3f5f7]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">在线考试与管理系统</p>
            <p className="text-sm text-slate-600">一个更像正式产品官网的统一入口页，连接学生端与管理后台。</p>
          </div>

          <div className="text-sm text-slate-600">
            <p>学生端：http://localhost:3002/login</p>
            <p>管理端：http://localhost:3003/login</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
