console.log("SCRIPT WISC-IV CARREGADO v4 — RELATÓRIO COMPLETO");
const LAUDOS_KEY = "empresa_laudos_wisc";

const SUBTESTES = [
  { nome: "Cubos", codigo: "CB", id: "pb_CB" },
  { nome: "Semelhanças", codigo: "SM", id: "pb_SM" },
  { nome: "Dígitos", codigo: "DG", id: "pb_DG" },
  { nome: "Conceitos Figurativos", codigo: "CN", id: "pb_CN" },
  { nome: "Código", codigo: "CD", id: "pb_CD" },
  { nome: "Vocabulário", codigo: "VC", id: "pb_VC" },
  { nome: "Seq. Núm. e Letras", codigo: "SNL", id: "pb_SNL" },
  { nome: "Raciocínio Matricial", codigo: "RM", id: "pb_RM" },
  { nome: "Compreensão", codigo: "CO", id: "pb_CO" },
  { nome: "Procurar Símbolos", codigo: "PS", id: "pb_PS" },
  { nome: "Completar Figuras", codigo: "CF", id: "pb_CF" },
  { nome: "Cancelamento", codigo: "CA", id: "pb_CA" },
  { nome: "Informação", codigo: "IN", id: "pb_IN" },
  { nome: "Aritmética", codigo: "AR", id: "pb_AR" },
  { nome: "Raciocínio com Palavras", codigo: "RP", id: "pb_RP" },
];

const VALORES_CRITICOS = {
  "ICV × IOP": 11.07, "ICV × IMO": 12.18, "ICV × IVP": 13.62,
  "IOP × IMO": 12.67, "IOP × IVP": 14.07, "IMO × IVP": 15.01,
};

/* ═══ UTILITÁRIAS ═══ */
function calcularIdade(nascISO, aplISO) {
  if (!nascISO || !aplISO) return null;
  const n = new Date(nascISO); const a = new Date(aplISO);
  if (isNaN(n.getTime()) || isNaN(a.getTime()) || a < n) return null;
  let anos = a.getFullYear() - n.getFullYear(); let meses = a.getMonth() - n.getMonth();
  if (a.getDate() < n.getDate()) meses -= 1;
  if (meses < 0) { anos -= 1; meses += 12; }
  return { anos, meses, totalMeses: anos * 12 + meses };
}

function obterNomeSubteste(codigo) {
  const sub = SUBTESTES.find(s => s.codigo === codigo);
  return sub ? sub.nome : codigo;
}

function getLaudos() { return JSON.parse(localStorage.getItem(LAUDOS_KEY) || "[]"); }
function setLaudos(arr) { localStorage.setItem(LAUDOS_KEY, JSON.stringify(arr)); }
function limparCPF(cpf) { return (cpf || "").replace(/\D/g, ""); }

function validarCPF(cpfInput) {
  const cpf = limparCPF(cpfInput);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0; for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
  let d1 = (soma * 10) % 11; if (d1 === 10) d1 = 0; soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
  let d2 = (soma * 10) % 11; if (d2 === 10) d2 = 0;
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
}

function formatarCPF(cpf) { if (!cpf) return ""; const n = cpf.replace(/\D/g, ""); return n.length !== 11 ? cpf : n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"); }
function formatarData(iso) { if (!iso) return "—"; const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; }
function pctText(p) { return (p == null || p === "" || Number.isNaN(+p)) ? "—" : `${+p}%`; }
function fmtIC(arr) { return !Array.isArray(arr) ? "—" : `${arr[0]}–${arr[1]}`; }

function classByComposite(score) {
  const s = +score; if (Number.isNaN(s)) return "—";
  if (s >= 130) return "Muito Superior"; if (s >= 120) return "Superior"; if (s >= 110) return "Médio Superior";
  if (s >= 90) return "Médio"; if (s >= 80) return "Médio Inferior"; if (s >= 70) return "Limítrofe";
  return "Extremamente Baixo";
}

/* ═══ DISCREPÂNCIAS E FORTES/FRACOS ═══ */
function calcularDiscrepancias(compostos) {
  const pares = [
    { par: "ICV × IOP", a: "ICV", b: "IOP" }, { par: "ICV × IMO", a: "ICV", b: "IMO" },
    { par: "ICV × IVP", a: "ICV", b: "IVP" }, { par: "IOP × IMO", a: "IOP", b: "IMO" },
    { par: "IOP × IVP", a: "IOP", b: "IVP" }, { par: "IMO × IVP", a: "IMO", b: "IVP" },
  ];
  return pares.map(p => {
    const va = compostos?.[p.a]?.composto; const vb = compostos?.[p.b]?.composto;
    if (va == null || vb == null) return null;
    const diff = va - vb; const vc = VALORES_CRITICOS[p.par] || 99;
    return { par: p.par, va, vb, diff, vc, sig: Math.abs(diff) >= vc };
  }).filter(Boolean);
}

function calcularPontosFortesFracos(resultados) {
  const ponderados = [];
  Object.values(resultados).forEach(r => { if (r.ponderado != null && r.ponderado !== "") ponderados.push({ cod: r.codigo, nome: r.nome, p: +r.ponderado }); });
  if (!ponderados.length) return { media: 0, fortes: [], fracos: [] };
  const media = ponderados.reduce((s, x) => s + x.p, 0) / ponderados.length;
  return { media, fortes: ponderados.filter(x => x.p - media >= 3).sort((a, b) => b.p - a.p), fracos: ponderados.filter(x => media - x.p >= 3).sort((a, b) => a.p - b.p) };
}

/* ═══ RENDER: MATRIZ WISC-IV ═══ */
function cellIndice(codigo, usadosSet, possiveisSet, resultados) {
  if (!possiveisSet || !possiveisSet.has(codigo)) return `<td class="idx fill"></td>`;
  const v = resultados?.[codigo]?.ponderado;
  if (v == null || v === "") return `<td class="idx fill"></td>`;
  const sup = !(usadosSet && usadosSet.has(codigo));
  return `<td class="idx fill"><span class="${sup ? 'pill sup' : 'pill'}">${sup ? `(${v})` : v}</span></td>`;
}

function renderMatrizConversao({ resultados, indicesInfo, somas }) {
  const uICV = new Set(indicesInfo?.ICV?.usados || []);
  const uIOP = new Set(indicesInfo?.IOP?.usados || []);
  const uIMO = new Set(indicesInfo?.IMO?.usados || []);
  const uIVP = new Set(indicesInfo?.IVP?.usados || []);
  const uQIT = new Set(somas?.QI_TOTAL?.usados || []);
  const pICV = new Set(["SM","VC","CO","IN","RP"]); const pIOP = new Set(["CB","CN","RM","CF"]);
  const pIMO = new Set(["DG","SNL","AR"]); const pIVP = new Set(["CD","PS","CA"]);
  const pQIT = new Set(["CB","SM","DG","CN","CD","VC","SNL","RM","CO","PS","CF","CA","IN","AR","RP"]);
  const ordem = ["CB","SM","DG","CN","CD","VC","SNL","RM","CO","PS","CF","CA","IN","AR","RP"];
  const linhas = ordem.map(codigo => {
    const r = resultados[codigo] || { bruto: "", ponderado: "" };
    return `<tr><td class="col-sub"><b>${obterNomeSubteste(codigo)}</b> <span class="muted">(${codigo})</span></td>
      <td class="col-pb">${r.bruto ?? ""}</td><td class="col-pp">${r.ponderado ?? ""}</td>
      ${cellIndice(codigo, uICV, pICV, resultados)}${cellIndice(codigo, uIOP, pIOP, resultados)}
      ${cellIndice(codigo, uIMO, pIMO, resultados)}${cellIndice(codigo, uIVP, pIVP, resultados)}
      ${cellIndice(codigo, uQIT, pQIT, resultados)}</tr>`;
  }).join("");
  return `<table class="wisc-matrix"><thead>
    <tr><th class="col-sub">Subtestes</th><th class="col-pb">PB</th><th class="col-pp">Ponderado</th><th colspan="5">Contribuição</th></tr>
    <tr><th></th><th></th><th></th><th class="idx">ICV</th><th class="idx">IOP</th><th class="idx">IMO</th><th class="idx">IVP</th><th class="idx">QIT</th></tr>
  </thead><tbody>${linhas}</tbody><tfoot><tr>
    <td class="sum-label" colspan="3">Soma dos Pontos Ponderados</td>
    <td>${indicesInfo?.ICV?.soma ?? "—"}</td><td>${indicesInfo?.IOP?.soma ?? "—"}</td>
    <td>${indicesInfo?.IMO?.soma ?? "—"}</td><td>${indicesInfo?.IVP?.soma ?? "—"}</td>
    <td>${somas?.QI_TOTAL?.soma ?? "—"}</td>
  </tr></tfoot></table>`;
}

function renderPerfilSubtestes(resultados) {
  const grupos = [
    { t: "Comp. Verbal", c: ["SM","VC","CO","IN","RP"] }, { t: "Org. Perceptual", c: ["CB","CN","RM","CF"] },
    { t: "Memória Op.", c: ["DG","SNL","AR"] }, { t: "Vel. Process.", c: ["CD","PS","CA"] },
  ];
  const supl = new Set(["IN","RP","CF","AR","CA"]);
  const h = grupos.map(g => `<th colspan="${g.c.length}" class="perfil-group">${g.t}</th>`).join("");
  const c = grupos.flatMap(g => g.c).map(code => `<th class="perfil-code">${supl.has(code) ? `(${code})` : code}</th>`).join("");
  const v = grupos.flatMap(g => g.c).map(code => `<td class="perfil-val">${resultados?.[code]?.ponderado ?? "—"}</td>`).join("");
  return `<table class="perfil-table"><thead><tr>${h}</tr><tr>${c}</tr></thead><tbody><tr>${v}</tr></tbody></table>`;
}

/* ═══ TEXTO INTERPRETATIVO — WISC-IV ═══ */
function gerarTextoInterpretativo({ nome, compostos }) {
  const keys = ["QI_TOTAL","ICV","IOP","IMO","IVP"];
  const labels = { QI_TOTAL: "QI Total (QIT)", ICV: "Índice de Compreensão Verbal (ICV)", IOP: "Índice de Organização Perceptual (IOP)", IMO: "Índice de Memória Operacional (IMO)", IVP: "Índice de Velocidade de Processamento (IVP)" };
  const abils = { QI_TOTAL: "funcionamento intelectual global", ICV: "raciocínio verbal, formação de conceitos e conhecimento adquirido", IOP: "raciocínio fluido não verbal, processamento espacial e integração visomotora", IMO: "atenção, concentração e controle mental para reter e manipular informações", IVP: "rapidez e precisão na discriminação visual e processamento de informações simples" };
  const verbs = { "Muito Superior": "situa-se muito acima da média", "Superior": "situa-se acima da média", "Médio Superior": "situa-se na faixa média superior", "Médio": "situa-se na faixa média", "Médio Inferior": "situa-se na faixa média inferior", "Limítrofe": "situa-se na faixa limítrofe", "Extremamente Baixo": "situa-se muito abaixo da média" };
  const openings = ["Em relação ao","Em relação ao","Em relação ao","Em relação ao","Em relação ao"];
  const parts = [];
  keys.forEach((key, i) => {
    const c = compostos?.[key]; if (!c?.composto) return;
    const cls = classByComposite(c.composto);
    parts.push(`${openings[i]} <b>${labels[key]}</b>, que avalia ${abils[key]}, o desempenho de ${nome} ${verbs[cls] || "apresenta desempenho"} em comparação a crianças e adolescentes da mesma faixa etária (Pontuação Composta = ${c.composto}; Percentil = ${c.percentil || "—"}; IC 95% = ${fmtIC(c.ic95)}; Classificação: ${cls}).`);
  });
  return parts.join("\n\n");
}

/* ═══ INPUTS ═══ */
function montarInputsSubtestes() {
  const tbody = document.getElementById("tbodySubtestes"); if (!tbody) return;
  tbody.innerHTML = "";
  SUBTESTES.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><b>${s.nome}</b> <span class="muted">(${s.codigo})</span></td><td><input type="number" min="0" id="${s.id}" placeholder="Bruto"></td>`;
    tbody.appendChild(tr);
  });
}

function atualizarPreviewIdade() {
  const nasc = document.getElementById("dataNascimento")?.value; const apl = document.getElementById("dataAplicacao")?.value;
  const idadeEl = document.getElementById("idadeCalculada"); const faixaEl = document.getElementById("faixaCalculada");
  if (!idadeEl || !faixaEl) return;
  if (!nasc || !apl) { idadeEl.textContent = ""; faixaEl.textContent = ""; return; }
  const idade = calcularIdade(nasc, apl);
  if (!idade) { idadeEl.textContent = "Datas inválidas."; faixaEl.textContent = ""; return; }
  idadeEl.textContent = `Idade na aplicação: ${idade.anos} anos e ${idade.meses} meses.`;
  faixaEl.textContent = "Faixa normativa será definida no laudo.";
}

/* ═══ CALCULAR ═══ */
/* ═══════════════════════════════════
   LOADING OVERLAY + MODAL
   ═══════════════════════════════════ */
function showLoading(msg) {
  const overlay = document.createElement("div");
  overlay.id = "loadingOverlay";
  overlay.className = "loading-overlay";
  overlay.innerHTML = `<div class="loading-card"><div class="loading-spinner"></div><div class="loading-title">${msg || "Gerando relatório..."}</div><div class="loading-sub">Conectando com a API e processando dados</div></div>`;
  document.body.appendChild(overlay);
}

function hideLoading() { const el = document.getElementById("loadingOverlay"); if (el) el.remove(); }

function openReportModal() {
  const rel = document.getElementById("relatorio"); if (!rel) return;
  closeReportModal();
  const backdrop = document.createElement("div");
  backdrop.id = "reportModal";
  backdrop.className = "report-modal-backdrop";
  backdrop.innerHTML = `<div class="report-modal"><div class="report-modal-toolbar no-print"><div class="toolbar-title">📄 Relatório Gerado</div><div class="toolbar-actions"><button class="toolbar-btn toolbar-btn-primary" onclick="imprimirRelatorio()">🖨️ Imprimir / Salvar PDF</button><button class="toolbar-btn toolbar-btn-secondary" onclick="closeReportModal()">✕ Fechar</button></div></div><div class="report-modal-body" id="reportModalBody"></div></div>`;
  document.body.appendChild(backdrop);
  document.getElementById("reportModalBody").appendChild(rel);
  rel.style.display = "block";
  backdrop.addEventListener("click", function(e) { if (e.target === backdrop) closeReportModal(); });
  document.addEventListener("keydown", _escHandler);
}

function _escHandler(e) { if (e.key === "Escape") closeReportModal(); }

function closeReportModal() {
  const modal = document.getElementById("reportModal"); if (!modal) return;
  const rel = document.getElementById("relatorio");
  if (rel) { const main = document.querySelector(".main-content"); if (main) main.appendChild(rel); rel.style.display = "none"; }
  modal.remove();
  document.removeEventListener("keydown", _escHandler);
}

/* ═══════════════════════════════════
   CALCULAR — com loading + modal
   ═══════════════════════════════════ */
async function calcular(salvar) {
  try {
    const nome = (document.getElementById("nome")?.value || "").trim();
    const nasc = document.getElementById("dataNascimento")?.value;
    const apl = document.getElementById("dataAplicacao")?.value;
    const cpf = (document.getElementById("cpf")?.value || "").trim();
    const sexo = document.getElementById("sexo")?.value || "";
    const escolaridade = document.getElementById("escolaridade")?.value || "";
    const profNome = (document.getElementById("profNome")?.value || "").trim();
    const profCRP = (document.getElementById("profCRP")?.value || "").trim();
    const profEspecialidade = (document.getElementById("profEspecialidade")?.value || "").trim();
    const motivo = (document.getElementById("motivo")?.value || "").trim();
    const obsComportamentais = (document.getElementById("obsComportamentais")?.value || "").trim();
    const recomendacoes = (document.getElementById("recomendacoes")?.value || "").trim();

    if (!nome || !nasc || !apl) { alert("Preencha Nome, Nascimento e Aplicação."); return; }
    if (!cpf || !sexo || !escolaridade) { alert("Preencha CPF, sexo e escolaridade."); return; }
    if (!validarCPF(cpf)) { alert("CPF inválido."); return; }

    const brutos = {};
    for (const s of SUBTESTES) { const v = document.getElementById(s.id)?.value; if (v !== "" && v != null) { const b = Number(v); if (Number.isNaN(b) || b < 0) { alert(`Valor inválido em ${s.nome}`); return; } brutos[s.codigo] = b; } }
    if (!Object.keys(brutos).length) { alert("Preencha ao menos um subteste."); return; }

    showLoading(salvar ? "Salvando e gerando relatório..." : "Calculando resultados...");

    const API_URL = "https://equilibrium-api-yjxx.onrender.com/wisc/calcular";
    const response = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nasc, apl, brutos }) });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Erro desconhecido.");

    const { idade, faixa, resultados, somas, compostos, indicesInfo, qiInfo } = data.resultado;
    montarRelatorio({ nome, cpf, sexo, escolaridade, nasc, apl, idade, faixa, resultados, indicesInfo, qiInfo, somas, compostos, profNome, profCRP, profEspecialidade, motivo, obsComportamentais, recomendacoes });

    if (salvar) {
      const rel = document.getElementById("relatorio");
      await esperarImagensCarregarem(rel); await new Promise(r => setTimeout(r, 150));
      const laudos = getLaudos();
      laudos.unshift({ nome, dataAplicacao: apl, faixa, createdAt: new Date().toISOString(), htmlRelatorio: rel.outerHTML });
      setLaudos(laudos);
    }

    hideLoading();

    if (salvar) {
      openReportModal();
      await new Promise(r => setTimeout(r, 400));
      window.print();
    } else {
      openReportModal();
    }

  } catch (e) { hideLoading(); console.error(e); alert(`Erro ao calcular: ${e.message}`); }
}

/* ═══ CHART.JS ═══ */
let chartSub = null;
const WISC_SCATTER_PLUGIN = { id: "wiscScatterDecor",
  beforeDraw(chart, args, opts) { const { ctx, chartArea, scales } = chart; if (!chartArea) return;
    if (opts?.band && scales?.y) { const yT = scales.y.getPixelForValue(opts.band.max); const yB = scales.y.getPixelForValue(opts.band.min); ctx.save(); ctx.fillStyle = "rgba(13,71,161,0.12)"; ctx.fillRect(chartArea.left, yT, chartArea.right - chartArea.left, yB - yT); ctx.restore(); }
    if (Array.isArray(opts?.vlines) && scales?.x) { ctx.save(); ctx.strokeStyle = "rgba(13,71,161,0.35)"; ctx.lineWidth = 2; opts.vlines.forEach(v => { const x = scales.x.getPixelForValue(v); ctx.beginPath(); ctx.moveTo(x, chartArea.top); ctx.lineTo(x, chartArea.bottom); ctx.stroke(); }); ctx.restore(); }
  }
};

function registrarPluginsChart() { if (typeof Chart === "undefined") return; if (!Chart.registry?.plugins?.get?.("wiscScatterDecor")) Chart.register(WISC_SCATTER_PLUGIN); }

function desenharGraficos(resultados) {
  registrarPluginsChart();
  const ctxSub = document.getElementById("grafSub"); if (!ctxSub) return;
  if (chartSub) chartSub.destroy();
  const groups = [["SM","VC","CO","IN","RP"],["CB","CN","RM","CF"],["DG","SNL","AR"],["CD","PS","CA"]];
  let x = 1; const xPos = {}; const tickAt = [];
  groups.forEach((g, gi) => { g.forEach(code => { xPos[code] = x; tickAt[x] = code; x++; }); if (gi < groups.length - 1) x += 1; });
  const points = Object.keys(xPos).map(code => { const v = resultados?.[code]?.ponderado; return v == null ? null : { x: xPos[code], y: Number(v) }; }).filter(Boolean);
  chartSub = new Chart(ctxSub, { type: "scatter", data: { datasets: [{ data: points, pointRadius: 5, pointHoverRadius: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, layout: { padding: { left: 6, right: 6, top: 18, bottom: 6 } },
      plugins: { legend: { display: false }, wiscScatterDecor: { band: { min: 9, max: 11 }, vlines: [6.0, 11.0, 15.0] } },
      scales: { x: { type: "linear", min: 0.5, max: x - 0.5, grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, stepSize: 1, autoSkip: false, callback: v => { const c = tickAt[Math.round(v)]; return !c ? "" : ["IN","RP","CF","AR","CA"].includes(c) ? `(${c})` : c; } } },
        y: { min: 1, max: 19, grid: { color: "rgba(13,71,161,.10)" }, ticks: { stepSize: 1, font: { size: 10 } } } }
    }
  });
}

/* ═══ MONTAR RELATÓRIO — WISC-IV COMPLETO ═══ */
function montarRelatorio(data) {
  const rel = document.getElementById("relatorio"); if (!rel) return;
  const { nome, cpf, sexo, escolaridade, nasc, apl, idade, faixa, resultados, indicesInfo, compostos, somas,
    profNome, profCRP, profEspecialidade, motivo, obsComportamentais, recomendacoes } = data;

  const textoInterp = gerarTextoInterpretativo({ nome, compostos });
  const cpfTxt = formatarCPF(cpf);
  const matriz = renderMatrizConversao({ resultados, indicesInfo, somas });
  const perfil = renderPerfilSubtestes(resultados);
  const discrepancias = calcularDiscrepancias(compostos);
  const { media, fortes, fracos } = calcularPontosFortesFracos(resultados);

  const detalheRows = Object.values(resultados).map(r => {
    const p = +r.ponderado; const dev = p - media; const devAbs = Math.abs(dev);
    const devColor = dev >= 3 ? "#059669" : dev <= -3 ? "#dc2626" : "#64748b";
    const bgRow = devAbs >= 3 ? (dev > 0 ? "background:rgba(209,250,229,0.4);" : "background:rgba(254,226,226,0.4);") : "";
    return `<tr style="${bgRow}"><td><b>${r.nome}</b> <span class="muted">(${r.codigo})</span></td><td>${r.bruto}</td><td>${r.ponderado}</td><td>${r.classificacao || "—"}</td><td style="font-weight:700;color:${devColor}">${dev >= 0 ? "+" : ""}${dev.toFixed(1)}</td></tr>`;
  }).join("");

  const discRows = discrepancias.map(d => {
    const absD = Math.abs(d.diff); const bgRow = d.sig ? "background:rgba(254,226,226,0.5);" : absD >= 8 ? "background:rgba(254,243,199,0.4);" : "";
    const diffColor = d.sig ? "#dc2626" : absD >= 8 ? "#d97706" : "#334155";
    return `<tr style="${bgRow}"><td>${d.par}</td><td style="text-align:center;font-weight:700">${d.va}</td><td style="text-align:center;font-weight:700">${d.vb}</td><td style="text-align:center;font-weight:800;color:${diffColor}">${d.diff > 0 ? "+" : ""}${d.diff}</td><td style="text-align:center">${d.vc}</td><td style="text-align:center"><span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:10px;font-weight:700;background:${d.sig ? 'rgba(254,226,226,0.8);color:#dc2626' : 'rgba(209,250,229,0.8);color:#059669'}">${d.sig ? "SIM" : "NÃO"}</span></td></tr>`;
  }).join("");

  const fortesHtml = fortes.length === 0 ? `<div class="muted">Nenhum desvio ≥3 positivo</div>` : fortes.map(s => `<div style="margin-bottom:4px;"><b>${s.nome}</b> (${s.cod}) — ponderado ${s.p} — desvio +${(s.p - media).toFixed(1)}</div>`).join("");
  const fracosHtml = fracos.length === 0 ? `<div class="muted">Nenhum desvio ≥3 negativo</div>` : fracos.map(s => `<div style="margin-bottom:4px;"><b>${s.nome}</b> (${s.cod}) — ponderado ${s.p} — desvio ${(s.p - media).toFixed(1)}</div>`).join("");

  rel.style.display = "block";
  rel.innerHTML = `
    <div class="report">
      <div class="report-header">
        <img class="report-logo report-logo-top" src="/Equilibrium_Neuro2/logo2.png" alt="Logo" onerror="this.style.display='none'">
        <div class="report-title">
          <div class="t1">Relatório Neuropsicológico — WISC-IV</div>
          <div class="t2">Escala Wechsler de Inteligência para Crianças — 4ª Edição</div>
        </div>
        <div class="report-meta"><div class="badge">Faixa: ${faixa}</div><div class="muted">Idade: ${idade.anos}a ${idade.meses}m</div></div>
      </div>

      <div class="section">
        <h3>1. Identificação</h3>
        <div class="info-grid">
          <div><span class="k">Nome:</span> <span class="v">${nome}</span></div>
          <div><span class="k">CPF:</span> <span class="v">${cpfTxt || "—"}</span></div>
          <div><span class="k">Sexo:</span> <span class="v">${sexo || "—"}</span></div>
          <div><span class="k">Escolaridade:</span> <span class="v">${escolaridade || "—"}</span></div>
          <div><span class="k">Nascimento:</span> <span class="v">${formatarData(nasc)} (${idade.anos}a ${idade.meses}m)</span></div>
          <div><span class="k">Aplicação:</span> <span class="v">${formatarData(apl)}</span></div>
        </div>
        ${profNome ? `<div style="border-top:1px dashed rgba(13,71,161,.15);margin-top:10px;padding-top:10px;" class="info-grid">
          <div><span class="k">Profissional:</span> <span class="v">${profNome}${profCRP ? ` — ${profCRP}` : ""}</span></div>
          <div><span class="k">Especialidade:</span> <span class="v">${profEspecialidade || "—"}</span></div>
        </div>` : ""}
        ${motivo ? `<div style="border-top:1px dashed rgba(13,71,161,.15);margin-top:10px;padding-top:10px;"><span class="k">Motivo do encaminhamento:</span> <span class="v">${motivo}</span></div>` : ""}
      </div>

      ${obsComportamentais ? `<div class="section no-break"><h3>2. Observações Comportamentais</h3>
        <div style="background:#fffbeb;border:1px solid rgba(245,158,11,.2);border-radius:10px;padding:12px 16px;font-size:12px;line-height:1.7;color:#334155;">${obsComportamentais}</div></div>` : ""}

      <div class="duas-colunas">
        <div class="section no-break"><h3>3. Conversão PB → Ponderado</h3><div class="matrix-card">${matriz}</div><p class="muted" style="margin:10px 0 0;">Células azuis = subtestes usados na soma.</p></div>
        <div class="section no-break"><h3>4. Perfil dos Subtestes</h3><div class="perfil-card">${perfil}<div class="canvas-wrap perfil-canvas"><canvas id="grafSub" height="560"></canvas></div></div></div>
      </div>

      <div class="duas-colunas">
        <div class="section no-break"><h3>5. Subtestes — Detalhamento</h3>
          <table class="table"><thead><tr><th>Subteste</th><th>PB</th><th>Pond.</th><th>Classificação</th><th>Desvio MP</th></tr></thead>
          <tbody>${detalheRows}</tbody>
          <tfoot><tr><td colspan="4" style="font-weight:700;color:#0d47a1;">Média pessoal</td><td style="font-weight:800;color:#0d47a1;text-align:center;">${media.toFixed(1)}</td></tr></tfoot></table>
        </div>
        <div class="section no-break"><h3>6. Índices e QI Total</h3>
          <table class="table" style="margin-top:12px;"><thead><tr><th>Escala</th><th>Soma</th><th>Composto</th><th>Percentil</th><th>IC 90%</th><th>IC 95%</th><th>Classif.</th></tr></thead>
          <tbody>${[["ICV","ICV"],["IOP","IOP"],["IMO","IMO"],["IVP","IVP"],["QIT","QI_TOTAL"]].map(([rotulo, chave]) => {
            const s = somas?.[chave]; const c = compostos?.[chave]; const cls = c?.composto ? classByComposite(c.composto) : "—";
            return `<tr><td><b>${rotulo}</b></td><td>${s?.soma ?? "—"}</td><td style="font-weight:800;">${c?.composto ?? "—"}</td><td>${c?.percentil ?? "—"}</td><td>${fmtIC(c?.ic90)}</td><td>${fmtIC(c?.ic95)}</td><td style="font-size:10px;">${cls}</td></tr>`;
          }).join("")}</tbody></table>
        </div>
      </div>

      <div class="section no-break"><h3>7. Análise de Discrepâncias entre Índices</h3>
        <table class="table"><thead><tr><th>Comparação</th><th style="text-align:center">Índ. 1</th><th style="text-align:center">Índ. 2</th><th style="text-align:center">Diferença</th><th style="text-align:center">Val. Crítico (.05)</th><th style="text-align:center">Significativo?</th></tr></thead>
        <tbody>${discRows}</tbody></table>
        <p class="muted" style="margin:8px 0 0;">Valores críticos: Manual WISC-IV. 🟢 Não significativo · 🟡 Notável (≥8) · 🔴 Significativo (p < .05)</p>
      </div>

      <div class="section no-break"><h3>8. Pontos Fortes e Fracos Pessoais</h3>
        <p class="muted" style="margin-bottom:8px;">Média pessoal: <b style="color:#0d47a1">${media.toFixed(1)}</b> · Desvio ≥ 3 = significativo</p>
        <div style="display:flex;gap:12px;">
          <div style="flex:1;background:rgba(209,250,229,0.4);border:1px solid rgba(5,150,105,0.2);border-radius:10px;padding:12px;">
            <div style="font-weight:800;color:#065f46;margin-bottom:6px;">▲ Pontos Fortes</div><div style="font-size:12px;color:#065f46;">${fortesHtml}</div></div>
          <div style="flex:1;background:rgba(254,226,226,0.4);border:1px solid rgba(220,38,38,0.2);border-radius:10px;padding:12px;">
            <div style="font-weight:800;color:#991b1b;margin-bottom:6px;">▼ Pontos Fracos</div><div style="font-size:12px;color:#991b1b;">${fracosHtml}</div></div>
        </div>
      </div>

      <div class="section no-break"><h3>9. Interpretação Clínica</h3>${textoInterp.split("\n\n").map(p => `<p class="interp">${p}</p>`).join("")}</div>

      ${recomendacoes ? `<div class="section no-break"><h3>10. Conclusão e Recomendações</h3><div style="font-size:12px;line-height:1.7;color:#334155;white-space:pre-line;">${recomendacoes}</div></div>` : ""}

      <div class="report-footer">
        <div>${profNome ? `<div style="font-weight:700;color:#0f172a;">${profNome}</div><div class="muted">${profCRP || ""}${profEspecialidade ? ` · ${profEspecialidade}` : ""}</div><div style="margin-top:12px;border-top:1px solid #0f172a;width:180px;padding-top:4px;font-size:9px;color:#94a3b8;">Assinatura do profissional</div>` : `<div class="muted">Documento gerado automaticamente</div>`}</div>
        <div style="display:flex;align-items:center;gap:10px;"><button class="btn-print no-print" onclick="imprimirRelatorio()">Imprimir (PDF)</button><img class="report-logo report-logo-bottom" src="/Equilibrium_Neuro2/logo2.png" alt="Logo" onerror="this.style.display='none'"></div>
      </div>
      ${profNome ? `<div style="text-align:center;padding:6px;font-size:8px;color:#cbd5e1;">Este documento é confidencial e destinado exclusivamente ao profissional solicitante.</div>` : ""}
    </div>`;
  desenharGraficos(resultados);
}

/* ═══ LAUDOS / PRINT / INIT ═══ */
function renderListaLaudos() {
  const box = document.getElementById("listaLaudos"); if (!box) return;
  const laudos = getLaudos(); if (!laudos.length) { box.innerHTML = `<p class="muted">Nenhum laudo salvo ainda.</p>`; return; }
  box.innerHTML = `<table class="table"><thead><tr><th>Paciente</th><th>Aplicação</th><th>Faixa</th><th>Ações</th></tr></thead><tbody>${laudos.map((x, idx) => `<tr><td>${x.nome}</td><td>${x.dataAplicacao}</td><td>${x.faixa}</td><td><button class="btn-outline" onclick="baixarPDFSalvo(${idx})">Baixar PDF</button></td></tr>`).join("")}</tbody></table>`;
}

async function esperarImagensCarregarem(c) { const imgs = Array.from(c.querySelectorAll("img")); await Promise.all(imgs.map(img => { if (img.complete && img.naturalWidth > 0) return Promise.resolve(); return new Promise(r => { img.onload = () => r(); img.onerror = () => r(); }); })); }
async function baixarPDFSalvo(i) { const item = getLaudos()[i]; if (!item) return alert("Não encontrado."); const t = document.createElement("div"); t.innerHTML = item.htmlRelatorio; document.body.appendChild(t); await esperarImagensCarregarem(t); await new Promise(r => setTimeout(r, 150)); t.remove(); }
async function imprimirRelatorio() { const rel = document.getElementById("relatorio"); if (!rel) return; await esperarImagensCarregarem(rel); await new Promise(r => setTimeout(r, 250)); window.print(); }

(function init() {
  if (document.getElementById("tbodySubtestes")) { montarInputsSubtestes(); document.getElementById("dataNascimento")?.addEventListener("change", atualizarPreviewIdade); document.getElementById("dataAplicacao")?.addEventListener("change", atualizarPreviewIdade); }
  if (document.getElementById("listaLaudos")) renderListaLaudos();
})();

window.calcular = calcular; window.imprimirRelatorio = imprimirRelatorio; window.baixarPDFSalvo = baixarPDFSalvo; window.closeReportModal = closeReportModal; window.openReportModal = openReportModal;
