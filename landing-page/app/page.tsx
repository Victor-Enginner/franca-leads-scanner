import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <nav className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg viewBox="0 0 40 40" fill="none" className="h-8 w-8">
              <circle cx="20" cy="20" r="18" stroke="#0071E3" strokeWidth="2" />
              <circle cx="20" cy="20" r="12" stroke="#0071E3" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="3" fill="#0071E3" />
              <line x1="20" y1="2" x2="20" y2="8" stroke="#0071E3" strokeWidth="1.5" />
              <line x1="20" y1="32" x2="20" y2="38" stroke="#0071E3" strokeWidth="1.5" />
              <line x1="2" y1="20" x2="8" y2="20" stroke="#0071E3" strokeWidth="1.5" />
              <line x1="32" y1="20" x2="38" y2="20" stroke="#0071E3" strokeWidth="1.5" />
            </svg>
            <span className="text-xl font-bold text-gray-900">Franca Leads Scanner</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <Link href="#como-funciona" className="text-[13px] font-medium text-gray-600 hover:text-gray-900">
              Como funciona
            </Link>
            <Link href="#recursos" className="text-[13px] font-medium text-gray-600 hover:text-gray-900">
              Recursos
            </Link>
            <Link href="#planos" className="text-[13px] font-medium text-gray-600 hover:text-gray-900">
              Planos
            </Link>
            <Link href="#faq" className="text-[13px] font-medium text-gray-600 hover:text-gray-900">
              FAQ
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="https://franca-leads-scanner-ku7v.vercel.app/" className="text-[13px] font-semibold text-gray-700 hover:text-gray-900">
              Entrar
            </Link>
            <Link href="https://franca-leads-scanner-ku7v.vercel.app/" className="text-[13px] font-bold px-4 py-2 rounded-full text-white" style={{ background: "#0071E3" }}>
              Acessar Scanner
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-12">
        <div className="glow" style={{ width: "420px", height: "420px", background: "rgba(0, 113, 227, 0.18)", top: "-80px", left: "50%", transform: "translateX(-50%)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
          <div className="reveal text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 text-[12px] font-semibold px-3 py-1.5 rounded-full border border-gray-200 glass-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#0071E3" }}>
                <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
                <path d="M20 2v4" />
                <path d="M22 4h-4" />
                <circle cx="4" cy="20" r="2" />
              </svg>
              Guia de uso · Do primeiro lead ao cliente fechado
            </span>

            <h1 className="mt-6 text-[clamp(2.2rem,6vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-gray-900">
              Encontre e gerencie leads em{" "}
              <span className="gradient-text whitespace-nowrap">Franca, SP</span>
            </h1>

            <p className="mt-5 text-[clamp(1rem,2.2vw,1.25rem)] text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Escaneie negócios locais, organize em um funil de vendas e feche mais clientes.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="https://franca-leads-scanner-ku7v.vercel.app/" className="group inline-flex items-center gap-2 text-[15px] font-bold px-7 py-3.5 rounded-full text-white transition-all hover:opacity-90 shadow-lg" style={{ background: "#0071E3", boxShadow: "0 8px 28px rgba(0,113,227,0.35)" }}>
                Acessar Scanner
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-0.5 transition-transform">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <Link href="#como-funciona" className="inline-flex items-center gap-2 text-[15px] font-semibold px-7 py-3.5 rounded-full glass-btn">
                Como funciona
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="reveal text-center">
          <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: "#0071E3" }}>Como funciona</span>
          <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-gray-900">
            4 passos para fechar mais clientes
          </h2>
        </div>

        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: "search", title: "Escaneie leads", desc: "Use o Nexus Scan para extrair dados de negócios locais." },
            { icon: "funnel", title: "Organize no funil", desc: "Classifique: Abordado, Agendado, Follow Up, Perdido ou Convertido." },
            { icon: "chart", title: "Acompanhe métricas", desc: "Visualize taxa de conversão e progresso do funil." },
            { icon: "check", title: "Feche negócios", desc: "Use scripts de abordagem e agendamentos." },
          ].map((step, i) => (
            <div key={i} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="h-full glass-card rounded-2xl p-6 card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,113,227,0.1)" }}>
                      <div className="w-6 h-6 rounded-full bg-brand" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white text-[12px] font-bold flex items-center justify-center bg-brand">{i + 1}</span>
                  </div>
                  <h3 className="text-[16px] font-bold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-[14px] text-gray-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center text-[13px] text-gray-500">
          © 2026 Franca Leads Scanner. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}