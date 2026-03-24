/* ═══════════════════════════════════
   PAGES — Conteúdo de cada página
   ═══════════════════════════════════ */

// ─── Dados de exemplo (depois virão do backend/localStorage) ───
const MOCK_RECENTES = [
  { nome:"Ivete Arantes Rezende", teste:"WAIS-III", data:"11/02/2026", qi:"105", classif:"Médio" },
  { nome:"Arthur Rodrigues Santos", teste:"WISC-IV", data:"13/02/2026", qi:"72", classif:"Limítrofe" },
  { nome:"Carlos M. Silva", teste:"SRS-2", data:"08/02/2026", qi:"—", classif:"Leve" },
  { nome:"Ana Paula Costa", teste:"WAIS-III", data:"02/02/2026", qi:"118", classif:"Médio Superior" },
];

const MOCK_PACIENTES = [
  { nome:"Ivete Arantes Rezende", idade:"67a", testes:3, ultimo:"WAIS-III" },
  { nome:"Arthur Rodrigues Santos", idade:"13a", testes:2, ultimo:"WISC-IV" },
  { nome:"Carlos M. Silva", idade:"8a", testes:1, ultimo:"SRS-2" },
  { nome:"Ana Paula Costa", idade:"45a", testes:4, ultimo:"WAIS-III" },
  { nome:"Roberto Fonseca Jr.", idade:"32a", testes:1, ultimo:"WAIS-III" },
];

const TESTES = [
  { nome:"WAIS-III", desc:"Adultos (16-89 anos)", status:"Ativo", color:"blue", href:"/Correcao_testes/WAIS/novo-laudo.html" },
  { nome:"WISC-IV", desc:"Crianças (6-16 anos)", status:"Ativo", color:"green", href:"/Correcao_testes/WISC_IV/novo-laudo.html" },
  { nome:"SRS-2", desc:"Resp. Social (2.5-65 anos)", status:"Ativo", color:"teal", href:"/Correcao_testes/SRS2/index.html" },
  { nome:"WPPSI-IV", desc:"Pré-escola (2.6-7.7 anos)", status:"Em breve", color:"gray" },
  { nome:"RAVLT", desc:"Memória verbal", status:"Em breve", color:"gray" },
  { nome:"TDE-II", desc:"Desempenho escolar", status:"Em breve", color:"gray" },
  { nome:"BPA-2", desc:"Atenção", status:"Em breve", color:"gray" },
  { nome:"Neupsilin", desc:"Breve neuropsicológica", status:"Em breve", color:"gray" },
  { nome:"FDT", desc:"Funções executivas", status:"Em breve", color:"gray" },
];

const CHECKLIST = [
  { nome:"WAIS-III", done:true },
  { nome:"WISC-IV", done:true },
  { nome:"SRS-2", done:true },
  { nome:"WPPSI-IV", done:false },
  { nome:"RAVLT", done:false },
  { nome:"TDE-II", done:false },
  { nome:"BPA-2", done:false },
  { nome:"Neupsilin", done:false },
  { nome:"FDT", done:false },
  { nome:"COLUMBIA-3", done:false },
  { nome:"SON-R", done:false },
  { nome:"ETDAH", done:false },
];

function classifBadge(cl) {
  const map = {
    "Muito Superior":"badge-green","Superior":"badge-green",
    "Médio Superior":"badge-blue","Médio":"badge-blue",
    "Médio Inferior":"badge-amber","Limítrofe":"badge-red",
    "Extremamente Baixo":"badge-red","Leve":"badge-amber",
    "Moderado":"badge-red","Severo":"badge-red","Normal":"badge-green",
  };
  return `<span class="badge ${map[cl] || 'badge-gray'}">${cl}</span>`;
}

function testBadge(status) {
  return status === "Ativo"
    ? `<span class="badge badge-green">${status}</span>`
    : `<span class="badge badge-gray">${status}</span>`;
}

// ═══════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════
function renderDashboard() {
  const done = CHECKLIST.filter(c => c.done).length;
  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👤</div>
        <div class="stat-value" style="color:var(--blue)">${MOCK_PACIENTES.length}</div>
        <div class="stat-label">Pacientes</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✏️</div>
        <div class="stat-value" style="color:var(--green)">${MOCK_RECENTES.length}</div>
        <div class="stat-label">Testes Realizados</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-value" style="color:var(--teal)">${done}/${CHECKLIST.length}</div>
        <div class="stat-label">Testes Implementados</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-value" style="color:var(--purple)">3</div>
        <div class="stat-label">Ativos</div>
      </div>
    </div>

    <div class="action-row">
      <button class="btn-primary" onclick="navigateTo('correcao')">+ Nova Correção</button>
      <button class="btn-secondary" onclick="navigateTo('pacientes')">Ver Pacientes</button>
    </div>

    <div class="card">
      <h3 style="font-size:15px;font-weight:700;margin-bottom:14px;">Últimas correções</h3>
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Teste</th>
              <th>Data</th>
              <th class="center">QIT</th>
              <th>Classificação</th>
            </tr>
          </thead>
          <tbody>
            ${MOCK_RECENTES.map(r => `
              <tr>
                <td class="bold">${r.nome}</td>
                <td><span class="badge badge-blue">${r.teste}</span></td>
                <td>${r.data}</td>
                <td class="center bold">${r.qi}</td>
                <td>${classifBadge(r.classif)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════
// PACIENTES
// ═══════════════════════════════════
function renderPacientes() {
  return `
    <div class="action-row">
      <button class="btn-primary">+ Novo Paciente</button>
    </div>
    ${MOCK_PACIENTES.map(p => `
      <div class="paciente-item">
        <div class="paciente-avatar">${p.nome[0]}</div>
        <div class="paciente-info">
          <div class="paciente-nome">${p.nome}</div>
          <div class="paciente-meta">${p.idade} · ${p.testes} teste(s) · Último: ${p.ultimo}</div>
        </div>
        <span class="paciente-arrow">→</span>
      </div>
    `).join("")}
  `;
}

// ═══════════════════════════════════
// CORREÇÃO DE TESTES
// ═══════════════════════════════════
function renderCorrecao() {
  return `
    <div class="test-grid">
      ${TESTES.map(t => {
        const isActive = t.status === "Ativo";
        const onClick = isActive && t.href ? `onclick="location.href='${t.href}'"` : "";
        return `
          <div class="test-card ${isActive ? '' : 'disabled'}" ${onClick}>
            <div class="test-name" style="color:var(--${t.color})">${t.nome}</div>
            <div class="test-desc">${t.desc}</div>
            <div class="test-status">${testBadge(t.status)}</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

// ═══════════════════════════════════
// APLICAÇÃO DE TESTES
// ═══════════════════════════════════
function renderAplicacao() {
  // Como a aplicação de testes é um sistema complexo com CSS próprio, 
  // a melhor forma de injetá-la mantendo o shell do app é via iframe.
  return `
    <div style="width: 100%; height: calc(100vh - 150px); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <iframe 
        src="/Aplicacao_Testes/" 
        style="width: 100%; height: 100%; border: none;"
        title="Aplicação de Testes">
      </iframe>
    </div>
  `;
}

// ═══════════════════════════════════
// RELATÓRIOS
// ═══════════════════════════════════
function renderRelatorios() {
  return `
    <div class="card">
      <div class="empty-state">
        <div class="empty-icon">📄</div>
        <div class="empty-title">Selecione um paciente para ver seus relatórios</div>
        <div class="empty-desc">Ou gere um novo a partir da aba Correção de Testes</div>
        <br>
        <button class="btn-primary" onclick="navigateTo('correcao')">Ir para Correção</button>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════
// CHECKLIST — redireciona para a página completa
// ═══════════════════════════════════
function renderChecklist() {
  location.href = '/check_list/index.html';
  return '';
}

// ═══════════════════════════════════
// CONFIGURAÇÕES
// ═══════════════════════════════════
function renderConfig() {
  return `
    <div class="config-section">
      <div class="config-title">Perfil do Profissional</div>
      <div class="config-grid">
        <div class="config-field">
          <label>Nome</label>
          <div class="value">Dr. Wessilon Marques de Sousa</div>
        </div>
        <div class="config-field">
          <label>CRP</label>
          <div class="value">CRP 04/53832V</div>
        </div>
        <div class="config-field">
          <label>Especialidade</label>
          <div class="value">Neuropsicólogo</div>
        </div>
        <div class="config-field">
          <label>Contato</label>
          <div class="value">wessilon@gmail.com</div>
        </div>
      </div>
    </div>

    <div class="config-section">
      <div class="config-title">Relatórios</div>
      <p style="font-size:13px;color:var(--text-secondary);">
        Personalize cabeçalho, logotipo, modelo de relatório e assinatura digital.
      </p>
    </div>

    <div class="config-section">
      <div class="config-title">Segurança</div>
      <p style="font-size:13px;color:var(--text-secondary);">
        Gerenciar usuários, senhas e permissões de acesso.
      </p>
    </div>
  `;
}

// ═══════════════════════════════════
// REGISTRY — Mapa de páginas
// ═══════════════════════════════════
const PAGE_REGISTRY = {
  dashboard:  { title: "Dashboard",          subtitle: "Visão geral do sistema",      render: renderDashboard },
  pacientes:  { title: "Pacientes",          subtitle: "Gerencie seus pacientes",     render: renderPacientes },
  correcao:   { title: "Correção de Testes", subtitle: "Selecione o instrumento",     render: renderCorrecao },
  aplicacao:  { title: "Aplicação de Testes", subtitle: "Instrumentos de avaliação",   render: renderAplicacao },
  relatorios: { title: "Relatórios",         subtitle: "Gerencie relatórios gerados", render: renderRelatorios },
  checklist:  { title: "Checklist",          subtitle: "Testes disponíveis no sistema", render: renderChecklist },
  config:     { title: "Configurações",      subtitle: "Preferências do sistema",     render: renderConfig },
};
