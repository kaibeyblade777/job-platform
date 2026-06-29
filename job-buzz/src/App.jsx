import { useState, useEffect, useRef } from "react";
import { Briefcase, PlayCircle, Send, MapPin, Calendar, GraduationCap, ExternalLink, ChevronRight, X, PlayCircleIcon } from "lucide-react";




const typeMeta = {
  "Govt Job": { cls: "bg-blue-500/10 text-blue-300 border border-blue-500/20", label: "Govt Job" },
  "Private": { cls: "bg-violet-500/10 text-violet-300 border border-violet-500/20", label: "Private" },
  "Internship": { cls: "bg-amber-500/10 text-amber-300 border border-amber-500/20", label: "Internship" },
  "Scholarship": { cls: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20", label: "Scholarship" },
};

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function parseCSVRow(row) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/* ── STAR CANVAS ── */
function StarCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.2 + 0.2, a: Math.random(),
      speed: Math.random() * 0.3 + 0.1, dir: Math.random() > 0.5 ? 1 : -1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      stars.forEach(s => {
        s.a += s.speed * s.dir * 0.005;
        if (s.a > 1 || s.a < 0.1) s.dir *= -1;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,174,255,${s.a})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-70" />;
}

/* ── TYPE BADGE ── */
function Badge({ type }) {
  const m = typeMeta[type] || { cls: "bg-slate-700 text-slate-300", label: type };
  return <span className={`text-[10px] font-bold px-2 py-1 rounded-md tracking-wide whitespace-nowrap ${m.cls}`}>{m.label}</span>;
}

/* ── 3D CARD ── */
function OpportunityCard({ opp, onView }) {
  const cardRef = useRef(null);
  const handleMove = (e) => {
    const r = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cardRef.current.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
  };
  const handleLeave = () => { cardRef.current.style.transform = ""; };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative group bg-[#0F1628] border border-[#1E2A4A] rounded-2xl p-5 flex flex-col gap-4 cursor-pointer overflow-hidden"
      style={{ transition: "transform 0.15s ease, box-shadow 0.3s, border-color 0.3s" }}
    >
      {/* Glow orb */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
        style={{ background: opp.glowColor }} />
      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="text-sm font-bold text-slate-100 leading-snug">{opp.title}</p>
          <p className="text-xs text-slate-500 mt-1">{opp.organization}</p>
        </div>
        <Badge type={opp.type} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <MapPin size={12} className="text-slate-600 shrink-0" /> {opp.location}
        </div>
        {opp.eligibility && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <GraduationCap size={12} className="text-slate-600 shrink-0" />
            Qualification : <span className="truncate">{opp.eligibility}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Calendar size={12} className="text-slate-600 shrink-0" />
          Last Date: <span className="text-rose-300 font-semibold">{formatDate(opp.lastDate)}</span>
        </div>
      </div>

      <button
        onClick={() => onView(opp)}
        className="mt-auto w-full py-2.5 rounded-xl text-xs font-bold text-blue-400 border border-blue-500/25 bg-blue-500/5
          hover:bg-blue-500/15 hover:border-blue-400/50 hover:text-blue-300 hover:shadow-[0_0_20px_rgba(79,142,247,0.2)]
          transition-all duration-200 flex items-center justify-center gap-1"
      >
        View Details <ChevronRight size={12} />
      </button>
    </div>
  );
}

/* ── MODAL ── */
function Modal({ opp, onClose }) {
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-3xl"
        style={{ background: "linear-gradient(160deg,#0F1628 0%,#0A0E1A 100%)", border: "1px solid rgba(79,142,247,0.2)", borderBottom: "none", boxShadow: "0 -20px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.04)" }}>

        <div className="sticky top-0 flex justify-between items-start gap-3 px-5 py-4 border-b border-blue-500/10"
          style={{ background: "rgba(15,22,40,0.95)", backdropFilter: "blur(8px)" }}>
          <div>
            <p className="text-sm font-bold text-slate-100">{opp.title}</p>
            <p className="text-xs text-slate-500 mt-1">{opp.organization}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition-all shrink-0">
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          <Badge type={opp.type} />
          <div className="grid grid-cols-2 gap-3">
            {[{ label: "Location", val: opp.location }, { label: "Last Date", val: formatDate(opp.lastDate), red: true }].map(x => (
              <div key={x.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1.5">{x.label}</p>
                <p className={`text-xs font-semibold ${x.red ? "text-rose-300" : "text-slate-200"}`}>{x.val}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3.5 border border-blue-500/20" style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.12),rgba(124,91,247,0.08))" }}>
            <p className="text-[10px] uppercase tracking-widest text-blue-400/70 mb-1.5">Salary / Stipend</p>
            <p className="text-base font-bold text-slate-100">{opp.salary}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2 font-semibold">Eligibility</p>
            <p className="text-xs text-slate-400 leading-relaxed">{opp.eligibility}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2 font-semibold">About this opportunity</p>
            <p className="text-xs text-slate-400 leading-relaxed">{opp.description}</p>
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-3 px-5 py-4 border-t border-blue-500/10" style={{ background: "rgba(10,14,26,0.95)", backdropFilter: "blur(8px)" }}>
          <a href={opp.officialLink} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:border-slate-500 text-xs font-semibold transition-all">
            <ExternalLink size={12} /> Official Link
          </a>
          <a href={opp.officialLink} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-xs font-bold transition-all hover:shadow-[0_0_24px_rgba(79,142,247,0.35)]"
            style={{ background: "linear-gradient(135deg,#2563EB,#7C5BF7)" }}>
            <Send size={12} /> Apply Now
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── APP ── */
export default function App() {

  const feedRef = useRef(null);
  const scroll = () => feedRef.current?.scrollIntoView({ behavior: "smooth" });
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSY-0jzNKupHtTV9mXkIKHTiTEWw4NqnzvvGjZ0SWV6l7lGqnGy-7lalRrqQ2gVwB62usy6Re1PCG8c/pub?gid=0&single=true&output=csv";

    fetch(CSV_URL)
      .then(res => res.text())
      .then(csv => {
        const rows = csv.trim().split("\n").slice(1);
        const parsed = rows.map((row, i) => {
          const cols = parseCSVRow(row);
          return {
            id: i + 1,
            title: cols[1],
            organization: cols[2]?.trim(),
            type: cols[3]?.trim(),
            location: cols[4]?.trim(),
            lastDate: cols[5]?.trim(),
            eligibility: cols[6]?.trim(),
            salary: cols[7]?.trim(),
            description: cols[8]?.trim(),
            officialLink: cols[9]?.trim(),
            applyLink: cols[10]?.trim(),
            glowColor: cols[11]?.trim() || "rgba(79,142,247,0.35)",
          };
        });
        setOpportunities(parsed);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch:", err);
        setLoading(false);
      });
  }, []);


  const filtered = filter === "All" ? opportunities : opportunities.filter(o => o.type === filter);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0E1A] text-slate-100 overflow-x-hidden" style={{ fontFamily: "Inter, sans-serif" }}>
      <StarCanvas />

      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center px-5" style={{ background: "rgba(10,14,26,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(79,142,247,0.1)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#2563EB,#7C5BF7)" }}>
            <Briefcase size={15} className="text-white" />
          </div>
          <span className="text-base font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", background: "linear-gradient(120deg,#F0F4FF,#4F8EF7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Job Buzz</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={scroll} className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all border-none bg-transparent cursor-pointer">Opportunities</button>
          <a href="#" className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-all" style={{ background: "linear-gradient(135deg,#DC2626,#991B1B)" }}>
            <PlayCircle size={13} /> YouTube
          </a>
        </div>
      </header>





      {/* FEED */}
      <section ref={feedRef} className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-end mb-5">
          <div>
            <h2 className="text-xl font-black text-slate-100" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Latest Opportunities</h2>
            <p className="text-xs text-slate-600 mt-1">Curated for Indians · Updated daily</p>
          </div>
          <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">{filtered.length} listings</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {["All", "Govt Job", "Private", "Internship", "Scholarship"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg border cursor-pointer transition-all"
              style={{ background: filter === f ? "rgba(79,142,247,0.12)" : "rgba(15,22,40,0.8)", borderColor: filter === f ? "rgba(79,142,247,0.45)" : "#1E2A4A", color: filter === f ? "#7BB3FA" : "#4A5580", boxShadow: filter === f ? "0 0 16px rgba(79,142,247,0.15)" : "none" }}>
              {f}
            </button>
          ))}
        </div>
        {loading ? (
          <p className="text-slate-400 text-sm text-center">Loading opportunities...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 [&:has(>:only-child)]:sm:grid-cols-1 [&:has(>:only-child)>*]:sm:max-w-md [&:has(>:only-child)>*]:sm:mx-auto">
            {filtered.map(opp => <OpportunityCard key={opp.id} opp={opp} onView={setSelected} />)}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="mt-auto relative z-10 border-t border-[#1E2A4A] px-5 py-9" style={{ background: "#0F1628" }}>
        <div className="max-w-4xl mx-auto flex flex-wrap justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#2563EB,#7C5BF7)" }}>
                <Briefcase size={13} className="text-white" />
              </div>
              <span className="text-sm font-bold text-slate-100" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Job Buzz</span>
            </div>
            <p className="text-xs text-slate-600 max-w-xs leading-relaxed">Every Opportunity. One Place. — India's trusted hub for jobs, internships & scholarships.</p>
          </div>
          <div className="flex gap-2">
            <a href="#" className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg text-rose-300 border border-rose-500/20 hover:bg-rose-500/10 transition-all" style={{ background: "rgba(220,38,38,0.08)" }}>
              <PlayCircle size={13} /> YouTube
            </a>
            <a href="#" className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg text-blue-300 border border-blue-500/20 hover:bg-blue-500/10 transition-all" style={{ background: "rgba(59,130,246,0.08)" }}>
              <Send size={13} /> Telegram
            </a>
          </div>
        </div>
        <p className="text-[10px] text-slate-700 text-center mt-7 pt-5 border-t border-[#1E2A4A] max-w-4xl mx-auto">© {new Date().getFullYear()} Job Buzz. Built with ❤️ for every Indian. All rights reserved.</p>
      </footer>

      {selected && <Modal opp={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}