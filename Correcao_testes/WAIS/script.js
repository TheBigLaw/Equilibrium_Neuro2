console.log("SCRIPT WAIS CARREGADO v4 — RELATÓRIO COMPLETO");
const LAUDOS_KEY = "empresa_laudos_wais";

const SUBTESTES = [
  { nome: "Completar Figuras", codigo: "CF", id: "pb_CF" },
  { nome: "Vocabulário", codigo: "VC", id: "pb_VC" },
  { nome: "Códigos", codigo: "CD", id: "pb_CD" },
  { nome: "Semelhanças", codigo: "SM", id: "pb_SM" },
  { nome: "Cubos", codigo: "CB", id: "pb_CB" },
  { nome: "Aritmética", codigo: "AR", id: "pb_AR" },
  { nome: "Raciocínio Matricial", codigo: "RM", id: "pb_RM" },
  { nome: "Dígitos", codigo: "DG", id: "pb_DG" },
  { nome: "Informação", codigo: "IN", id: "pb_IN" },
  { nome: "Arranjo de Figuras", codigo: "AF", id: "pb_AF" },
  { nome: "Compreensão", codigo: "CO", id: "pb_CO" },
  { nome: "Procurar Símbolos", codigo: "PS", id: "pb_PS" },
  { nome: "Sequência de Números e Letras", codigo: "SNL", id: "pb_SNL" },
  { nome: "Armar Objetos", codigo: "AO", id: "pb_AO" },
];

// Valores críticos para diferenças entre índices (p < .05) — Tabela B.2, Nascimento 2005
const VALORES_CRITICOS = {
  "ICV × IOP": 11.75, "ICV × IMO": 12.87, "ICV × IVP": 14.21,
  "IOP × IMO": 13.50, "IOP × IVP": 15.02, "IMO × IVP": 15.67,
  "QIV × QIE": 9.72,
};

/* ═══════════════════════════════════
   FUNÇÕES UTILITÁRIAS (mantidas)
   ═══════════════════════════════════ */
function calcularIdade(nascISO, aplISO) {
  if (!nascISO || !aplISO) return null;
  const n = new Date(nascISO); const a = new Date(aplISO);
  if (isNaN(n.getTime()) || isNaN(a.getTime()) || a < n) return null;
  let anos = a.getFullYear() - n.getFullYear();
  let meses = a.getMonth() - n.getMonth();
  if (a.getDate() < n.getDate()) meses -= 1;
  if (meses < 0) { anos -= 1; meses += 12; }
  return { anos, meses, totalMeses: anos * 12 + meses };
}

function faixaEtariaWAISIII(idade) {
  if (!idade) return null;
  const anos = idade.anos;
  if (anos >= 16 && anos <= 17) return "16 - 17";
  if (anos >= 18 && anos <= 19) return "18 - 19";
  if (anos >= 20 && anos <= 29) return "20 - 29";
  if (anos >= 30 && anos <= 39) return "30 - 39";
  if (anos >= 40 && anos <= 49) return "40 - 49";
  if (anos >= 50 && anos <= 59) return "50 - 59";
  if (anos >= 60 && anos <= 64) return "60 - 64";
  if (anos >= 65 && anos <= 89) return "65 - 89";
  return null;
}

function obterNomeSubteste(codigo) {
  const map = { CB:"Cubos", SM:"Semelhanças", DG:"Dígitos", CN:"Conceitos Figurativos", CD:"Código",
    VC:"Vocabulário", SNL:"Seq. Núm. e Letras", RM:"Raciocínio Matricial", CO:"Compreensão",
    PS:"Procurar Símbolos", CF:"Completar Figuras", CA:"Cancelamento", IN:"Informação",
    AR:"Aritmética", RP:"Raciocínio com Palavras", AF:"Arranjo de Figuras", AO:"Armar Objetos" };
  return map[codigo] || codigo;
}

function getLaudos() { return JSON.parse(localStorage.getItem(LAUDOS_KEY) || "[]"); }
function setLaudos(arr) { localStorage.setItem(LAUDOS_KEY, JSON.stringify(arr)); }
function limparCPF(cpf) { return (cpf || "").replace(/\D/g, ""); }

function validarCPF(cpfInput) {
  const cpf = limparCPF(cpfInput);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
  let d1 = (soma * 10) % 11; if (d1 === 10) d1 = 0;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
  let d2 = (soma * 10) % 11; if (d2 === 10) d2 = 0;
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
}

function formatarCPF(cpf) {
  if (!cpf) return "";
  const nums = cpf.replace(/\D/g, "");
  if (nums.length !== 11) return cpf;
  return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatarData(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function pctText(p) { return (p == null || p === "" || Number.isNaN(+p)) ? "—" : `${+p}%`; }
function fmtIC(arr) { return !Array.isArray(arr) ? "—" : `${arr[0]}–${arr[1]}`; }

function classByComposite(score) {
  const s = +score; if (Number.isNaN(s)) return "—";
  if (s >= 130) return "Muito Superior";
  if (s >= 120) return "Superior";
  if (s >= 110) return "Médio Superior";
  if (s >= 90) return "Médio";
  if (s >= 80) return "Médio Inferior";
  if (s >= 70) return "Limítrofe";
  return "Extremamente Baixo";
}

function classByPonderado(p) {
  const s = +p; if (Number.isNaN(s)) return "—";
  if (s >= 16) return "Muito Superior";
  if (s >= 14) return "Superior";
  if (s >= 12) return "Médio Superior";
  if (s >= 9) return "Médio";
  if (s >= 7) return "Médio Inferior";
  if (s >= 4) return "Limítrofe";
  return "Extremamente Baixo";
}

/* ═══════════════════════════════════
   NOVAS FUNÇÕES: Discrepâncias e Fortes/Fracos
   ═══════════════════════════════════ */
function calcularDiscrepancias(compostos) {
  const pares = [
    { par: "ICV × IOP", a: "ICV", b: "IOP" },
    { par: "ICV × IMO", a: "ICV", b: "IMO" },
    { par: "ICV × IVP", a: "ICV", b: "IVP" },
    { par: "IOP × IMO", a: "IOP", b: "IMO" },
    { par: "IOP × IVP", a: "IOP", b: "IVP" },
    { par: "IMO × IVP", a: "IMO", b: "IVP" },
    { par: "QIV × QIE", a: "QI_VERBAL", b: "QI_EXECUCAO" },
  ];
  return pares.map(p => {
    const va = compostos?.[p.a]?.composto;
    const vb = compostos?.[p.b]?.composto;
    if (va == null || vb == null) return null;
    const diff = va - vb;
    const vc = VALORES_CRITICOS[p.par] || 99;
    const sig = Math.abs(diff) >= vc;
    return { par: p.par, va, vb, diff, vc, sig };
  }).filter(Boolean);
}

function calcularPontosFortesFracos(resultados) {
  const ponderados = [];
  Object.values(resultados).forEach(r => {
    if (r.ponderado != null && r.ponderado !== "") ponderados.push({ cod: r.codigo, nome: r.nome, p: +r.ponderado });
  });
  if (ponderados.length === 0) return { media: 0, fortes: [], fracos: [] };
  const media = ponderados.reduce((s, x) => s + x.p, 0) / ponderados.length;
  const fortes = ponderados.filter(x => x.p - media >= 3).sort((a, b) => b.p - a.p);
  const fracos = ponderados.filter(x => media - x.p >= 3).sort((a, b) => a.p - b.p);
  return { media, fortes, fracos };
}

/* ═══════════════════════════════════
   RENDER HELPERS (mantidos / melhorados)
   ═══════════════════════════════════ */
function cellIndice(codigo, usadosSet, possiveisSet, resultados) {
  if (!possiveisSet || !possiveisSet.has(codigo)) return `<td class="idx fill"></td>`;
  const v = resultados?.[codigo]?.ponderado;
  if (v == null || v === "") return `<td class="idx fill"></td>`;
  const sup = !(usadosSet && usadosSet.has(codigo));
  return `<td class="idx fill"><span class="${sup ? 'pill sup' : 'pill'}">${sup ? `(${v})` : v}</span></td>`;
}

function renderMatrizConversao({ resultados, indicesInfo, somas }) {
  const usadosICV = new Set(indicesInfo?.ICV?.usados || []);
  const usadosIOP = new Set(indicesInfo?.IOP?.usados || []);
  const usadosIMO = new Set(indicesInfo?.IMO?.usados || []);
  const usadosIVP = new Set(indicesInfo?.IVP?.usados || []);
  const usadosVERBAL = new Set(somas?.QI_VERBAL?.usados || []);
  const usadosEXEC = new Set(somas?.QI_EXECUCAO?.usados || []);
  const possiveis = {
    VERBAL: new Set(["VC","SM","AR","DG","IN","CO","SNL"]),
    EXEC: new Set(["CF","CD","CB","RM","AF","PS","AO"]),
    ICV: new Set(["SM","VC","IN","CO"]), IOP: new Set(["CB","CF","RM","AF"]),
    IMO: new Set(["AR","DG","SNL"]), IVP: new Set(["CD","PS"]),
  };
  const ordem = ["CF","VC","CD","SM","CB","AR","RM","DG","IN","AF","CO","PS","SNL","AO"];
  const linhas = ordem.map(codigo => {
    const r = resultados[codigo] || { bruto: "", ponderado: "" };
    return `<tr>
      <td class="col-sub"><b>${obterNomeSubteste(codigo)}</b> <span class="muted">(${codigo})</span></td>
      <td class="col-pb">${r.bruto ?? ""}</td><td class="col-pp">${r.ponderado ?? ""}</td>
      ${cellIndice(codigo, usadosVERBAL, possiveis.VERBAL, resultados)}
      ${cellIndice(codigo, usadosEXEC, possiveis.EXEC, resultados)}
      ${cellIndice(codigo, usadosICV, possiveis.ICV, resultados)}
      ${cellIndice(codigo, usadosIOP, possiveis.IOP, resultados)}
      ${cellIndice(codigo, usadosIMO, possiveis.IMO, resultados)}
      ${cellIndice(codigo, usadosIVP, possiveis.IVP, resultados)}
    </tr>`;
  }).join("");

  return `<table class="wisc-matrix"><thead>
    <tr><th class="col-sub">Subtestes</th><th class="col-pb">PB</th><th class="col-pp">Ponderado</th><th colspan="6">Contribuição (Pontos Ponderados)</th></tr>
    <tr><th></th><th></th><th></th><th class="idx">Verbal</th><th class="idx">Exec.</th><th class="idx">ICV</th><th class="idx">IOP</th><th class="idx">IMO</th><th class="idx">IVP</th></tr>
  </thead><tbody>${linhas}</tbody><tfoot><tr>
    <td class="sum-label" colspan="3">Soma dos Pontos Ponderados</td>
    <td>${somas?.QI_VERBAL?.soma ?? "—"}</td><td>${somas?.QI_EXECUCAO?.soma ?? "—"}</td>
    <td>${indicesInfo?.ICV?.soma ?? "—"}</td><td>${indicesInfo?.IOP?.soma ?? "—"}</td>
    <td>${indicesInfo?.IMO?.soma ?? "—"}</td><td>${indicesInfo?.IVP?.soma ?? "—"}</td>
  </tr></tfoot></table>`;
}

function renderPerfilSubtestes(resultados) {
  const grupos = [
    { titulo: "Compreensão Verbal", codes: ["SM","VC","IN","CO"] },
    { titulo: "Organização Perceptual", codes: ["CB","CF","RM","AF"] },
    { titulo: "Memória Operacional", codes: ["AR","DG","SNL"] },
    { titulo: "Velocidade de Proc.", codes: ["CD","PS"] },
  ];
  const supl = new Set(["SNL","AO"]);
  const head1 = grupos.map(g => `<th colspan="${g.codes.length}" class="perfil-group">${g.titulo}</th>`).join("");
  const codes = grupos.flatMap(g => g.codes).map(c => `<th class="perfil-code">${supl.has(c) ? `(${c})` : c}</th>`).join("");
  const vals = grupos.flatMap(g => g.codes).map(c => `<td class="perfil-val">${resultados?.[c]?.ponderado ?? "—"}</td>`).join("");
  return `<table class="perfil-table"><thead><tr>${head1}</tr><tr>${codes}</tr></thead><tbody><tr>${vals}</tr></tbody></table>`;
}

/* ═══════════════════════════════════
   TEXTO INTERPRETATIVO (sem Math.random)
   ═══════════════════════════════════ */
function scaleLabelLong(key) {
  const map = { QI_TOTAL:"QI Total (QIT)", QI_VERBAL:"QI Verbal (QIV)", QI_EXECUCAO:"QI de Execução (QIE)", ICV:"Índice de Compreensão Verbal (ICV)", IOP:"Índice de Organização Perceptual (IOP)", IMO:"Índice de Memória Operacional (IMO)", IVP:"Índice de Velocidade de Processamento (IVP)" };
  return map[key] || key;
}

function abilityDescription(key) {
  const map = { QI_TOTAL:"funcionamento intelectual global", QI_VERBAL:"conhecimento adquirido, raciocínio verbal e atenção a materiais verbais", QI_EXECUCAO:"raciocínio fluido, processamento espacial, atenção a detalhes e integração visomotora", ICV:"raciocínio verbal e formação de conceitos", IOP:"raciocínio não verbal, atenção a detalhes e integração visomotora", IMO:"atenção, concentração e controle mental para manipular informações", IVP:"rapidez e eficiência para processar informações visuais simples" };
  return map[key] || "habilidades cognitivas avaliadas";
}

function introVerbByClass(cls) {
  const map = { "Muito Superior":"situa-se muito acima da média", "Superior":"situa-se acima da média", "Médio Superior":"situa-se acima da média", "Médio":"situa-se na faixa média", "Médio Inferior":"situa-se ligeiramente abaixo da média", "Limítrofe":"situa-se na faixa limítrofe", "Extremamente Baixo":"situa-se muito abaixo da média" };
  return map[cls] || "situa-se";
}

function gerarTextoInterpretativo({ nome, compostos }) {
  const keys = ["QI_TOTAL","QI_VERBAL","QI_EXECUCAO","ICV","IOP","IMO","IVP"];
  const openings = ["Em relação ao","Quanto ao","Em relação ao","Quanto ao","Em relação ao","Quanto ao","Em relação ao"];
  const parts = [];
  keys.forEach((key, i) => {
    const c = compostos?.[key];
    if (!c?.composto) return;
    const cls = classByComposite(c.composto);
    const verb = introVerbByClass(cls);
    const label = scaleLabelLong(key);
    const abil = abilityDescription(key);
    parts.push(`${openings[i]} <b>${label}</b>, as habilidades relacionadas a ${abil} ${verb} em comparação a pessoas de mesma faixa etária (pontuação composta = ${c.composto}; percentil ≈ ${pctText(c.percentil)}; IC 95% = ${fmtIC(c.ic95)}; classificação: ${cls}).`);
  });
  return parts.join("\n\n");
}

/* ═══════════════════════════════════
   INPUTS / PREVIEW
   ═══════════════════════════════════ */
function montarInputsSubtestes() {
  const tbody = document.getElementById("tbodySubtestes");
  if (!tbody) return;
  tbody.innerHTML = "";
  SUBTESTES.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><b>${s.nome}</b> <span class="muted">(${s.codigo})</span></td><td><input type="number" min="0" id="${s.id}" placeholder="Bruto"></td>`;
    tbody.appendChild(tr);
  });
}

function atualizarPreviewIdade() {
  const nasc = document.getElementById("dataNascimento")?.value;
  const apl = document.getElementById("dataAplicacao")?.value;
  const idadeEl = document.getElementById("idadeCalculada");
  const faixaEl = document.getElementById("faixaCalculada");
  if (!idadeEl || !faixaEl) return;
  if (!nasc || !apl) { idadeEl.textContent = ""; faixaEl.textContent = ""; return; }
  const idade = calcularIdade(nasc, apl);
  if (!idade) { idadeEl.textContent = "Datas inválidas."; faixaEl.textContent = ""; return; }
  idadeEl.textContent = `Idade na aplicação: ${idade.anos} anos e ${idade.meses} meses.`;
  const faixa = faixaEtariaWAISIII(idade);
  faixaEl.textContent = faixa ? `Faixa normativa: ${faixa}` : "Faixa normativa: não encontrada.";
}

/* ═══════════════════════════════════
   LOADING OVERLAY + MODAL
   ═══════════════════════════════════ */
function showLoading(msg) {
  const overlay = document.createElement("div");
  overlay.id = "loadingOverlay";
  overlay.className = "loading-overlay";
  overlay.innerHTML = `<div class="loading-card">
    <div class="loading-spinner"></div>
    <div class="loading-title">${msg || "Gerando relatório..."}</div>
    <div class="loading-sub">Conectando com a API e processando dados</div>
  </div>`;
  document.body.appendChild(overlay);
}

function hideLoading() {
  const el = document.getElementById("loadingOverlay");
  if (el) el.remove();
}

function openReportModal() {
  const rel = document.getElementById("relatorio");
  if (!rel) return;

  // Remove modal anterior se existir
  closeReportModal();

  const backdrop = document.createElement("div");
  backdrop.id = "reportModal";
  backdrop.className = "report-modal-backdrop";
  backdrop.innerHTML = `
    <div class="report-modal">
      <div class="report-modal-toolbar no-print">
        <div class="toolbar-title">📄 Relatório Gerado</div>
        <div class="toolbar-actions">
          <button class="toolbar-btn toolbar-btn-primary" onclick="imprimirRelatorio()">🖨️ Imprimir / Salvar PDF</button>
          <button class="toolbar-btn toolbar-btn-secondary" onclick="closeReportModal()">✕ Fechar</button>
        </div>
      </div>
      <div class="report-modal-body" id="reportModalBody"></div>
    </div>`;

  document.body.appendChild(backdrop);

  // Mover conteúdo do relatório para o modal
  const body = document.getElementById("reportModalBody");
  body.appendChild(rel);
  rel.style.display = "block";

  // Fechar ao clicar no backdrop
  backdrop.addEventListener("click", function(e) {
    if (e.target === backdrop) closeReportModal();
  });

  // Fechar com ESC
  document.addEventListener("keydown", _escHandler);
}

function _escHandler(e) {
  if (e.key === "Escape") closeReportModal();
}

function closeReportModal() {
  const modal = document.getElementById("reportModal");
  if (!modal) return;

  // Devolver o relatório para o main content (oculto)
  const rel = document.getElementById("relatorio");
  if (rel) {
    const main = document.querySelector(".main-content");
    if (main) { main.appendChild(rel); }
    rel.style.display = "none";
  }

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
    if (!validarCPF(cpf)) { alert("CPF inválido. Verifique e tente novamente."); return; }

    const brutos = {};
    for (const s of SUBTESTES) {
      const v = document.getElementById(s.id)?.value;
      if (v !== "" && v != null) {
        const bruto = Number(v);
        if (Number.isNaN(bruto) || bruto < 0) { alert(`Valor inválido em ${s.nome}`); return; }
        brutos[s.codigo] = bruto;
      }
    }
    if (Object.keys(brutos).length === 0) { alert("Preencha ao menos um subteste."); return; }

    // ► LOADING
    showLoading(salvar ? "Salvando e gerando relatório..." : "Calculando resultados...");

    const API_URL = "https://equilibrium-api-yjxx.onrender.com/wais/calcular";
    const response = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nasc, apl, brutos }) });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Erro desconhecido.");

    const { idade, faixa, resultados, somas, compostos, indicesInfo, qiInfo } = data.resultado;
    montarRelatorio({ nome, cpf, sexo, escolaridade, nasc, apl, idade, faixa, resultados, indicesInfo, qiInfo, somas, compostos, profNome, profCRP, profEspecialidade, motivo, obsComportamentais, recomendacoes });

    if (salvar) {
      const rel = document.getElementById("relatorio");
      await esperarImagensCarregarem(rel);
      await new Promise(r => setTimeout(r, 150));
      const laudos = getLaudos();
      laudos.unshift({ nome, dataAplicacao: apl, faixa, createdAt: new Date().toISOString(), htmlRelatorio: rel.outerHTML });
      setLaudos(laudos);
    }

    // ► HIDE LOADING + OPEN MODAL
    hideLoading();

    if (salvar) {
      openReportModal();
      // Notifica que salvou — o botão "Imprimir" no modal fica disponível
      setTimeout(() => {
        const toolbar = document.querySelector(".toolbar-title");
        if (toolbar) toolbar.textContent = "📄 Relatório Gerado — Laudo salvo com sucesso!";
      }, 100);
    } else {
      openReportModal();
    }

  } catch (e) {
    hideLoading();
    console.error(e);
    alert(`Erro ao calcular: ${e.message}`);
  }
}

/* ═══════════════════════════════════
   CHART.JS
   ═══════════════════════════════════ */
let chartSub = null;
let chartIdx = null;

const WISC_SCATTER_PLUGIN = {
  id: "wiscScatterDecor",
  beforeDraw(chart, args, opts) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;
    if (opts?.band && scales?.y) {
      const yTop = scales.y.getPixelForValue(opts.band.max);
      const yBot = scales.y.getPixelForValue(opts.band.min);
      ctx.save(); ctx.fillStyle = "rgba(13,71,161,0.12)";
      ctx.fillRect(chartArea.left, yTop, chartArea.right - chartArea.left, yBot - yTop); ctx.restore();
    }
    if (Array.isArray(opts?.vlines) && scales?.x) {
      ctx.save(); ctx.strokeStyle = "rgba(13,71,161,0.35)"; ctx.lineWidth = 2;
      opts.vlines.forEach(v => { const x = scales.x.getPixelForValue(v); ctx.beginPath(); ctx.moveTo(x, chartArea.top); ctx.lineTo(x, chartArea.bottom); ctx.stroke(); });
      ctx.restore();
    }
  }
};

function registrarPluginsChart() {
  if (typeof Chart === "undefined") return;
  if (!Chart.registry?.plugins?.get?.("wiscScatterDecor")) Chart.register(WISC_SCATTER_PLUGIN);
}

function desenharGraficos(resultados, indicesInfo, qiInfo, compostos) {
  registrarPluginsChart();
  const ctxSub = document.getElementById("grafSub");
  if (ctxSub) {
    if (chartSub) chartSub.destroy();
    const groups = [["SM","VC","IN","CO"],["CB","CF","RM","AF"],["AR","DG","SNL"],["CD","PS"],["AO"]];
    let x = 1; const xPos = {}; const tickAt = [];
    groups.forEach((g, gi) => { g.forEach(code => { xPos[code] = x; tickAt[x] = code; x++; }); if (gi < groups.length - 1) x += 1; });
    const points = Object.keys(xPos).map(code => { const v = resultados?.[code]?.ponderado; return v == null ? null : { x: xPos[code], y: Number(v) }; }).filter(Boolean);
    chartSub = new Chart(ctxSub, {
      type: "scatter", data: { datasets: [{ data: points, pointRadius: 5, pointHoverRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, layout: { padding: { left: 6, right: 6, top: 18, bottom: 6 } },
        plugins: { legend: { display: false }, wiscScatterDecor: { band: { min: 9, max: 11 }, vlines: [5.5, 10.5, 14.5, 17.5] } },
        scales: { x: { type: "linear", min: 0.5, max: x - 0.5, grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, stepSize: 1, autoSkip: false, callback: v => { const c = tickAt[Math.round(v)]; return !c ? "" : ["SNL","AO"].includes(c) ? `(${c})` : c; } } },
          y: { min: 1, max: 19, grid: { color: "rgba(13,71,161,.10)" }, ticks: { stepSize: 1, font: { size: 10 } } } }
      }
    });
  }
  const ctxIdx = document.getElementById("grafIdx");
  if (ctxIdx) {
    if (chartIdx) chartIdx.destroy();
    const labels = ["QIV","QIE","QIT","ICV","IOP","IMO","IVP"];
    const vals = [compostos?.QI_VERBAL?.composto, compostos?.QI_EXECUCAO?.composto, compostos?.QI_TOTAL?.composto, compostos?.ICV?.composto, compostos?.IOP?.composto, compostos?.IMO?.composto, compostos?.IVP?.composto];
    const pts = vals.map((v, i) => v == null ? null : { x: i + 1, y: Number(v) }).filter(Boolean);
    chartIdx = new Chart(ctxIdx, {
      type: "scatter", data: { datasets: [{ data: pts, pointRadius: 5, pointHoverRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { min: 0.5, max: labels.length + 0.5, grid: { display: false }, ticks: { autoSkip: false, font: { size: 10 }, callback: v => labels[Math.round(v) - 1] || "" } },
          y: { suggestedMin: 40, suggestedMax: 160, ticks: { font: { size: 10 } }, grid: { color: "rgba(13,71,161,.10)" } } }
      }
    });
  }
}

/* ═══════════════════════════════════
   MONTAR RELATÓRIO — VERSÃO COMPLETA
   ═══════════════════════════════════ */
function montarRelatorio(data) {
  const rel = document.getElementById("relatorio");
  if (!rel) return;
  registrarPluginsChart();

  const { nome, cpf, sexo, escolaridade, nasc, apl, idade, faixa, resultados, indicesInfo, qiInfo, compostos, somas,
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
    return `<tr style="${bgRow}"><td><b>${r.nome}</b> <span class="muted">(${r.codigo})</span></td><td>${r.bruto}</td><td>${r.ponderado}</td><td>${r.classificacao || classByPonderado(r.ponderado)}</td><td style="font-weight:700;color:${devColor}">${dev >= 0 ? "+" : ""}${dev.toFixed(1)}</td></tr>`;
  }).join("");

  const discRows = discrepancias.map(d => {
    const absD = Math.abs(d.diff);
    const bgRow = d.sig ? "background:rgba(254,226,226,0.5);" : absD >= 8 ? "background:rgba(254,243,199,0.4);" : "";
    const diffColor = d.sig ? "#dc2626" : absD >= 8 ? "#d97706" : "#334155";
    return `<tr style="${bgRow}"><td>${d.par}</td><td style="text-align:center;font-weight:700">${d.va}</td><td style="text-align:center;font-weight:700">${d.vb}</td><td style="text-align:center;font-weight:800;color:${diffColor}">${d.diff > 0 ? "+" : ""}${d.diff}</td><td style="text-align:center">${d.vc}</td><td style="text-align:center"><span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:10px;font-weight:700;background:${d.sig ? 'rgba(254,226,226,0.8);color:#dc2626' : 'rgba(209,250,229,0.8);color:#059669'}">${d.sig ? "SIM" : "NÃO"}</span></td></tr>`;
  }).join("");

  const fortesHtml = fortes.length === 0 ? `<div class="muted">Nenhum desvio ≥3 positivo</div>` : fortes.map(s => `<div style="margin-bottom:4px;"><b>${s.nome}</b> (${s.cod}) — ponderado ${s.p} — desvio +${(s.p - media).toFixed(1)}</div>`).join("");
  const fracosHtml = fracos.length === 0 ? `<div class="muted">Nenhum desvio ≥3 negativo</div>` : fracos.map(s => `<div style="margin-bottom:4px;"><b>${s.nome}</b> (${s.cod}) — ponderado ${s.p} — desvio ${(s.p - media).toFixed(1)}</div>`).join("");

  const indicesRows = [["QIV","QI_VERBAL"],["QIE","QI_EXECUCAO"],["QIT","QI_TOTAL"],["ICV","ICV"],["IOP","IOP"],["IMO","IMO"],["IVP","IVP"]].map(([rotulo, chave]) => {
    const s = somas?.[chave]; const c = compostos?.[chave];
    const cls = c?.composto ? classByComposite(c.composto) : "—";
    return `<tr><td><b>${rotulo}</b></td><td>${s?.soma ?? "—"}</td><td style="font-weight:800;">${c?.composto ?? "—"}</td><td>${c?.percentil ?? "—"}</td><td>${fmtIC(c?.ic90)}</td><td>${fmtIC(c?.ic95)}</td><td>${cls}</td></tr>`;
  }).join("");

  rel.style.display = "block";
  rel.innerHTML = `
    <div class="report">
      <!-- HEADER -->
      <div class="rpt-header">
        <img src="/Equilibrium_Neuro2/logo2.png" alt="Logo" onerror="this.style.display='none'">
        <div class="rpt-header-text">
          <div class="h1">Relatório Neuropsicológico — WAIS-III</div>
          <div class="h2">Escala Wechsler de Inteligência para Adultos — 3ª Edição</div>
        </div>
        <div class="rpt-header-meta">
          <div class="badge">Faixa: ${faixa}</div>
          <div class="sub">Idade: ${idade.anos}a ${idade.meses}m</div>
        </div>
      </div>

      <!-- 1. IDENTIFICAÇÃO -->
      <div class="rpt-section no-break">
        <div class="rpt-stitle theme-blue"><span class="num">1</span><span class="txt">Identificação</span></div>
        <div class="info-grid">
          <div><span class="k">Nome:</span> <span class="v">${nome}</span></div>
          <div><span class="k">CPF:</span> <span class="v">${cpfTxt || "—"}</span></div>
          <div><span class="k">Sexo:</span> <span class="v">${sexo || "—"}</span></div>
          <div><span class="k">Escolaridade:</span> <span class="v">${escolaridade || "—"}</span></div>
          <div><span class="k">Nascimento:</span> <span class="v">${formatarData(nasc)} (${idade.anos}a ${idade.meses}m)</span></div>
          <div><span class="k">Aplicação:</span> <span class="v">${formatarData(apl)}</span></div>
        </div>
        ${profNome ? `<div style="border-top:1px dashed #cbd5e1;margin-top:10px;padding-top:10px;" class="info-grid">
          <div><span class="k">Profissional:</span> <span class="v">${profNome}${profCRP ? ` — ${profCRP}` : ""}</span></div>
          <div><span class="k">Especialidade:</span> <span class="v">${profEspecialidade || "—"}</span></div>
        </div>` : ""}
        ${motivo ? `<div style="border-top:1px dashed #cbd5e1;margin-top:10px;padding-top:10px;"><span class="k">Motivo do encaminhamento:</span> <span class="v">${motivo}</span></div>` : ""}
      </div>

      <!-- 2. OBSERVAÇÕES -->
      ${obsComportamentais ? `
      <div class="rpt-section no-break">
        <div class="rpt-stitle theme-amber"><span class="num">2</span><span class="txt">Observações Comportamentais</span></div>
        <div class="rpt-obs">${obsComportamentais}</div>
      </div>` : ""}

      <!-- 3+4. CONVERSÃO + PERFIL (duas colunas) -->
      <div class="rpt-cols">
        <div class="rpt-section no-break">
          <div class="rpt-stitle theme-teal"><span class="num">3</span><span class="txt">Conversão PB → Ponderado</span></div>
          <div class="matrix-card">${matriz}</div>
          <p class="muted" style="margin:6px 0 0;font-size:10px;">Células azuis = subtestes usados. Parênteses = suplementares.</p>
        </div>
        <div class="rpt-section no-break">
          <div class="rpt-stitle theme-indigo"><span class="num">4</span><span class="txt">Perfil dos Subtestes</span></div>
          <div class="perfil-card">
            ${perfil}
            <div class="canvas-wrap perfil-canvas"><canvas id="grafSub" height="480"></canvas></div>
          </div>
          <p class="muted" style="margin:6px 0 0;font-size:10px;">Faixa azul = região média (9–11).</p>
        </div>
      </div>

      <!-- 5+6. DETALHAMENTO + ÍNDICES (duas colunas) -->
      <div class="rpt-cols rpt-page-break">
        <div class="rpt-section no-break">
          <div class="rpt-stitle theme-purple"><span class="num">5</span><span class="txt">Subtestes — Detalhamento</span></div>
          <table class="rpt-table">
            <thead><tr><th>Subteste</th><th>PB</th><th>Pond.</th><th>Classificação</th><th>Desvio MP</th></tr></thead>
            <tbody>${detalheRows}</tbody>
            <tfoot><tr><td colspan="4" style="color:#0d47a1;">Média pessoal dos ponderados</td><td style="font-weight:800;color:#0d47a1;text-align:center;">${media.toFixed(1)}</td></tr></tfoot>
          </table>
        </div>
        <div class="rpt-section no-break">
          <div class="rpt-stitle theme-sky"><span class="num">6</span><span class="txt">Índices e QI Total</span></div>
          <div class="canvas-wrap"><canvas id="grafIdx" height="260"></canvas></div>
          <table class="rpt-table" style="margin-top:10px;">
            <thead><tr><th>Escala</th><th>Soma</th><th>QI/Índice</th><th>Percentil</th><th>IC 90%</th><th>IC 95%</th><th>Classif.</th></tr></thead>
            <tbody>${indicesRows}</tbody>
          </table>
        </div>
      </div>

      <!-- 7. DISCREPÂNCIAS -->
      <div class="rpt-section no-break">
        <div class="rpt-stitle theme-rose"><span class="num">7</span><span class="txt">Análise de Discrepâncias entre Índices</span></div>
        <table class="rpt-table">
          <thead><tr><th>Comparação</th><th style="text-align:center">Índ. 1</th><th style="text-align:center">Índ. 2</th><th style="text-align:center">Diferença</th><th style="text-align:center">Val. Crítico (.05)</th><th style="text-align:center">Significativo?</th></tr></thead>
          <tbody>${discRows}</tbody>
        </table>
        <p class="muted" style="margin:6px 0 0;font-size:10px;">Tabela B.2, Manual WAIS-III. 🟢 Não significativo · 🟡 Notável (≥8) · 🔴 Significativo (p < .05)</p>
      </div>

      <!-- 8. FORTES / FRACOS -->
      <div class="rpt-section no-break">
        <div class="rpt-stitle theme-emerald"><span class="num">8</span><span class="txt">Pontos Fortes e Fracos Pessoais</span></div>
        <p class="muted" style="margin-bottom:8px;">Média pessoal: <b style="color:#0d47a1">${media.toFixed(1)}</b> · Desvio ≥ 3 = significativo</p>
        <div class="sw-row">
          <div class="sw-card sw-card-strong"><h4>▲ Pontos Fortes</h4><div class="items">${fortesHtml}</div></div>
          <div class="sw-card sw-card-weak"><h4>▼ Pontos Fracos</h4><div class="items">${fracosHtml}</div></div>
        </div>
      </div>

      <!-- 9. INTERPRETAÇÃO -->
      <div class="rpt-section">
        <div class="rpt-stitle theme-orange"><span class="num">9</span><span class="txt">Interpretação Clínica</span></div>
        ${textoInterp.split("\n\n").map(p => `<p class="interp">${p}</p>`).join("")}
      </div>

      <!-- 10. RECOMENDAÇÕES -->
      ${recomendacoes ? `
      <div class="rpt-section no-break">
        <div class="rpt-stitle theme-slate"><span class="num">10</span><span class="txt">Conclusão e Recomendações</span></div>
        <div style="font-size:12px;line-height:1.7;color:#334155;white-space:pre-line;">${recomendacoes}</div>
      </div>` : ""}

      <!-- RODAPÉ -->
      <div class="rpt-footer">
        <div>
          ${profNome ? `<div style="font-weight:800;font-size:14px;color:#0f172a;">${profNome}</div>` : ""}
          ${profCRP ? `<div style="font-size:11px;color:#64748b;">${profCRP}${profEspecialidade ? ` · ${profEspecialidade}` : ""}</div>` : ""}
          ${profNome ? `<div class="sign">Assinatura do profissional</div>` : `<div class="muted">Documento gerado automaticamente</div>`}
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button class="btn-print no-print" onclick="imprimirRelatorio()">🖨️ Imprimir</button>
          <img class="rpt-footer img" src="/Equilibrium_Neuro2/logo2.png" alt="" style="width:34px;height:34px;object-fit:contain;" onerror="this.style.display='none'">
        </div>
      </div>
      ${profNome ? `<div class="rpt-disclaimer">Este documento é confidencial e destinado exclusivamente ao profissional solicitante.</div>` : ""}
    </div>`;

  desenharGraficos(resultados, indicesInfo, qiInfo, compostos);
}

/* ═══════════════════════════════════
   LAUDOS / PRINT / INIT
   ═══════════════════════════════════ */
function renderListaLaudos() {
  const box = document.getElementById("listaLaudos");
  if (!box) return;
  const laudos = getLaudos();
  if (!laudos.length) { box.innerHTML = `<p class="muted">Nenhum laudo salvo ainda.</p>`; return; }
  box.innerHTML = `<table class="table"><thead><tr><th>Paciente</th><th>Aplicação</th><th>Faixa</th><th>Ações</th></tr></thead><tbody>${laudos.map((x, idx) => `<tr><td>${x.nome}</td><td>${x.dataAplicacao}</td><td><span class="badge">${x.faixa}</span></td><td><button class="btn-outline" onclick="baixarPDFSalvo(${idx})">Baixar PDF</button></td></tr>`).join("")}</tbody></table>`;
}

async function esperarImagensCarregarem(container) {
  const imgs = Array.from(container.querySelectorAll("img"));
  await Promise.all(imgs.map(img => { if (img.complete && img.naturalWidth > 0) return Promise.resolve(); return new Promise(r => { img.onload = () => r(); img.onerror = () => r(); }); }));
}

async function baixarPDFSalvo(index) {
  const item = getLaudos()[index];
  if (!item) return alert("Laudo não encontrado.");
  const temp = document.createElement("div"); temp.innerHTML = item.htmlRelatorio;
  document.body.appendChild(temp);
  await esperarImagensCarregarem(temp); await new Promise(r => setTimeout(r, 150));
  temp.remove();
}

async function imprimirRelatorio() {
  const rel = document.getElementById("relatorio");
  if (!rel) return;
  await esperarImagensCarregarem(rel);
  await new Promise(r => setTimeout(r, 250));
  window.print();
}

(function init() {
  if (document.getElementById("tbodySubtestes")) {
    montarInputsSubtestes();
    document.getElementById("dataNascimento")?.addEventListener("change", atualizarPreviewIdade);
    document.getElementById("dataAplicacao")?.addEventListener("change", atualizarPreviewIdade);
  }
  if (document.getElementById("listaLaudos")) renderListaLaudos();
})();

window.calcular = calcular;
window.imprimirRelatorio = imprimirRelatorio;
window.baixarPDFSalvo = baixarPDFSalvo;
window.closeReportModal = closeReportModal;
window.openReportModal = openReportModal;
