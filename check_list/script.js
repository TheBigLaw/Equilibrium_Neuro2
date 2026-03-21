/* ═══════════════════════════════════
   CHECKLIST — Lógica e dados
   ═══════════════════════════════════ */

/* ─── Dados dos instrumentos ─── */
const INSTRUMENTOS = {

  pre: [
    ["SON-R 2½-7", "Inteligência Não-Verbal", "2a 6m a 7 anos"],
    ["CPM-RAVEN", "Inteligência Não-Verbal (Fator G)", "5 a 11 anos"],
    ["ESCALA COLUMBIA", "Maturidade Mental / Raciocínio", "3a a 9a 11m"],
    ["TIME-R (Kit Completo)", "Memória de Curto Prazo", "3a a 6a 11m"],
    ["VINELAND-3", "Comportamento Adaptativo", "0 a 90 anos"],
    ["IDADI", "Desenvolvimento Infantil", "4 a 72 meses"],
    ["BAYLEY-III", "Desenvolvimento Global", "1 a 42 meses"],
    ["PROTEA-R-NV", "Sistema de Avaliação do TEA", "2 a 5 anos"],
    ["SRS-2 (Pré-Escolar)", "Responsividade e Habilidade Social", "2a 5m a 4a 5m"],
    ["ESCALA M-CHAT", "Rastreio Precoce de Autismo", "18 a 24 meses"],
    ["ESCALA ATA", "Traços Autísticos (Rastreio)", "2 a 18 anos"],
    ["ESCALA ABC-ICA", "Comportamento Infantil", "3 a 14 anos"],
    ["SNAP-IV", "Sintomas de TDAH e Opositor (TOD)", "1 a 17 anos"],
    ["ETDAH-PAIS", "Sintomas de TDAH (Visão dos Pais)", "2 a 17 anos"],
    ["ANELE Vol. 1 (PCFO)", "Consciência Fonológica", "3 a 9 anos"],
    ["PERFIL SENSORIAL 2", "Processamento Sensorial", "0 a 3a 11m"],
    ["WMT-2 (Matrizes de Viena)", "Avaliação de inteligência geral", "7 a 80+ anos"],
    ["ESCALA BINAUT", "Maturidade Mental", "3 a 7 anos"],
    ["ADOS-2 MÓDULO 2", "Avaliação Diagnóstica de TEA", "3 a 10 anos"],
  ],

  esc: [
    ["WISC-IV", "Inteligência Global (QI)", "6a a 16a 11m"],
    ["WAIS-III", "Inteligência Global (QI)", "16 a 89 anos"],
    ["SON-R 6-40", "Inteligência Não-Verbal", "6 a 40 anos"],
    ["CPM-RAVEN", "Inteligência Não-Verbal", "5 a 11 anos"],
    ["ESCALA COLUMBIA", "Maturidade Mental", "Até 9a 11m"],
    ["BETA-III", "Inteligência Não-Verbal", "14 a 33 anos"],
    ["TIAH/S", "Inteligência e Habilidades Sociais", "9 a 15 anos"],
    ["TISD", "Sinais de Dislexia", "6 a 11 anos (1º-5º)"],
    ["ANELE Vol. 1 (PCFO)", "Consciência Fonológica", "3 a 9 anos"],
    ["ANELE Vol. 2 (T-NAR)", "Nomeação Automática Rápida", "6 a 14 anos"],
    ["ANELE Vol. 3 (TEPPE)", "Escrita de Palavras/Pseudopalavras", "1º ao 9º ano"],
    ["ANELE Vol. 4 (TLPP)", "Leitura de Palavras/Pseudopalavras", "6 a 85 anos"],
    ["PROLEC (Kit Fund.)", "Processos de Leitura", "2º ao 5º ano"],
    ["PROLEC-SE-R", "Processos de Leitura", "6º ano ao Médio"],
    ["TDE-II", "Desempenho Escolar (L/E/M)", "1º ao 9º ano"],
    ["PRONUMERO", "Processamento Numérico", "2º ao 5º ano"],
    ["RAVLT", "Memória Auditivo-Verbal", "6 a 92 anos"],
    ["TEPIC-M-2", "Memória Visual", "15 a 92 anos"],
    ["BPA-2", "Atenção Geral", "6 a 94 anos"],
    ["TAVIS-4", "Atenção Visual", "6a a 17a 11m"],
    ["TESTE D2-R", "Atenção Concentrada", "9 a 60 anos"],
    ["FDT (Cinco Dígitos)", "Funções Executivas (Flexibilidade)", "6 a 90 anos"],
    ["TORRE DE LONDRES", "Planejamento e Resolução Problemas", "10 a 59 anos"],
    ["ASSQ", "Rastreio de Autismo", "7 a 16 anos"],
    ["ATA", "Traços Autísticos", "2 a 18 anos"],
    ["AQ (Versão Adolesc.)", "Rastreio de Autismo", "12 a 15 anos"],
    ["RAADS-R-BR SCREEN", "Rastreio de Autismo", "16 anos ou mais"],
    ["PERFIL SENSORIAL 2", "Processamento Sensorial (Criança)", "3 a 14 anos"],
    ["SRS-2 (Idade Escolar)", "Responsividade Social", "5 a 18 anos"],
    ["CAT-Q", "Camuflagem de Traços Autísticos", "16 anos ou mais"],
    ["VINELAND-3", "Comportamento Adaptativo", "0 a 90 anos"],
    ["ETDAH-PAIS", "Sintomas TDAH (Pais)", "2 a 17 anos"],
    ["ETDAH-AD", "Sintomas TDAH (Autoavaliação)", "12 a 87 anos"],
    ["SNAP-IV", "Sintomas TDAH e TOD", "1 a 17 anos"],
    ["ESCALA ASQ", "Sintomas TDAH", "7 a 12 anos"],
    ["SCARED AUTO", "Transtornos de Ansiedade", "9 a 18 anos"],
    ["SCARED HETERO", "Transtornos de Ansiedade", "7 a 18 anos"],
    ["EBADEP-IJ", "Sintomas de Depressão", "7 a 18 anos"],
    ["HUMOR-IJ", "Avaliação do Humor", "8 a 19 anos"],
    ["EPQ-IJ", "Personalidade", "10 a 16 anos"],
    ["BFP", "Personalidade", "16 anos ou mais"],
    ["QCP/PBQ", "Conceitualização Cognitiva (Crenças)", "15 a 94 anos"],
    ["WMT-2 (Matrizes de Viena)", "Avaliação de inteligência geral", "7 a 80+"],
    ["EFA", "Escala de Funcionamento Adaptativo", "6 a 15 anos"],
    ["ADOS-2 MÓDULO 3", "Avaliação Diagnóstica de TEA", "11 a 16 anos"],
  ],

  adu: [
    ["WAIS-III", "Inteligência Global (QI)", "16 a 89 anos"],
    ["BETA-III", "Inteligência Não-Verbal", "14 a 88 anos"],
    ["BPA-2", "Atenção Geral", "6 a 94 anos"],
    ["TESTE D2-R", "Atenção Concentrada", "9 a 60 anos"],
    ["(TEACO/TEADI/TEALT)", "Atenção Conc., Dividida e Alternada", "18 a 72 anos"],
    ["TEPIC-M-2", "Memória Visual", "15 a 92 anos"],
    ["RAVLT", "Memória Auditivo-Verbal", "6 a 92 anos"],
    ["BDEFS", "Déficits na Função Executiva", "18 a 70 anos"],
    ["FDT (Cinco Dígitos)", "Funções Executivas (Flexibilidade)", "6 a 90 anos"],
    ["TORRE DE LONDRES", "Planejamento e Resolução Problemas", "10 a 59 anos"],
    ["ANELE Vol. 4 (TLPP)", "Leitura de Palavras/Pseudopalavras", "6 a 85 anos"],
    ["ASRS-18", "TDAH (Rastreio OMS)", "18 anos ou mais"],
    ["BAARS-IV", "TDAH (Protocolo Barkley)", "18 anos ou mais"],
    ["ETDAH-AD", "TDAH (Autoavaliação)", "12 a 87 anos"],
    ["BFP", "Personalidade", "16 anos ou mais"],
    ["PFISTER", "Personalidade (Projetivo)", "18 a 66 anos"],
    ["SRS-2 (Adulto)", "Responsividade Social", "19 anos ou mais"],
    ["CAT-Q", "Camuflagem de Traços Autísticos", "16 anos ou mais"],
    ["RAADS-R-BR SCREEN", "Rastreio de Autismo", "16 anos ou mais"],
    ["QA16+", "Rastreio de Autismo", "16 anos ou mais"],
    ["PERFIL SENSORIAL 2", "Processamento Sensorial", "Adolescente/Adulto"],
    ["IHS-2", "Habilidades Sociais", "16 anos ou mais"],
    ["QCP/PBQ", "Conceitualização Cognitiva (Crenças)", "15 a 94 anos"],
    ["ESC. DE CAMBRIDGE", "Empatia vs. Sistematização", "Adultos"],
    ["BAI", "Sintomas de Ansiedade", "17 a 80 anos"],
    ["BDI-II", "Sintomas de Depressão", "13 a 80 anos"],
    ["EBADEP-A", "Sintomas de Depressão", "Adultos"],
    ["HUMOR-U", "Humor (Universitários)", "18 a 29 anos"],
    ["VINELAND-3", "Comportamento Adaptativo", "0 a 90 anos"],
    ["WMT-2 (Matrizes de Viena)", "Avaliação de inteligência geral", "7 a 80+"],
    ["ADOS-2 MÓDULO 4", "Avaliação Diagnóstica de TEA", "17 a +80 anos"],
  ],
};


/* ─── Helpers ─── */
function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}


/* ─── Renderizar tabelas ─── */
function renderTable(tableId, data, tabKey) {
  const tbody = document.querySelector("#" + tableId + " tbody");
  tbody.innerHTML = data.map(function(row, i) {
    return '<tr id="row_' + tabKey + '_' + i + '">' +
      '<td class="col-check"><input type="checkbox" onchange="onCheck(\'' + tabKey + '\',' + i + ')" id="chk_' + tabKey + '_' + i + '" /></td>' +
      '<td><span class="inst-name">' + row[0] + '</span></td>' +
      '<td><span class="inst-desc">' + row[1] + '</span></td>' +
      '<td class="col-age">' + row[2] + '</td>' +
      '<td class="col-date"><input type="date" /></td>' +
    '</tr>';
  }).join("");
}


/* ─── Checkbox handler ─── */
function onCheck(tabKey, idx) {
  var chk = document.getElementById("chk_" + tabKey + "_" + idx);
  var row = document.getElementById("row_" + tabKey + "_" + idx);

  if (chk.checked) {
    row.classList.add("checked");
  } else {
    row.classList.remove("checked");
  }

  updateCounts();
}


/* ─── Atualizar contadores ─── */
function updateCounts() {
  var tabs = ["pre", "esc", "adu"];

  for (var t = 0; t < tabs.length; t++) {
    var key = tabs[t];
    var tableId = "table" + cap(key);
    var checkboxes = document.querySelectorAll("#" + tableId + " input[type='checkbox']:checked");
    var countEl = document.getElementById("count" + cap(key));
    countEl.textContent = checkboxes.length;
  }
}


/* ─── Trocar abas ─── */
function switchTab(tabKey) {
  // Atualizar botões
  var allTabs = document.querySelectorAll(".cl-tab");
  for (var i = 0; i < allTabs.length; i++) {
    if (allTabs[i].dataset.tab === tabKey) {
      allTabs[i].classList.add("active");
    } else {
      allTabs[i].classList.remove("active");
    }
  }

  // Mostrar/esconder painéis
  var allPanels = document.querySelectorAll(".cl-tab-panel");
  for (var j = 0; j < allPanels.length; j++) {
    allPanels[j].style.display = "none";
  }

  document.getElementById("panel" + cap(tabKey)).style.display = "block";
}


/* ─── Limpar tudo ─── */
function limparTudo() {
  if (!confirm("Limpar todos os dados?")) return;

  // Campos do paciente
  var inputs = document.querySelectorAll(".cl-field input, .cl-field textarea");
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = "";
  }

  // Checkboxes
  var checks = document.querySelectorAll(".cl-table input[type='checkbox']");
  for (var j = 0; j < checks.length; j++) {
    checks[j].checked = false;
  }

  // Datas
  var dates = document.querySelectorAll(".cl-table input[type='date']");
  for (var k = 0; k < dates.length; k++) {
    dates[k].value = "";
  }

  // Remover classe checked
  var checkedRows = document.querySelectorAll(".cl-table tr.checked");
  for (var l = 0; l < checkedRows.length; l++) {
    checkedRows[l].classList.remove("checked");
  }

  updateCounts();
}


/* ─── Eventos das abas ─── */
function setupTabs() {
  var tabButtons = document.querySelectorAll(".cl-tab");
  for (var i = 0; i < tabButtons.length; i++) {
    tabButtons[i].addEventListener("click", function() {
      switchTab(this.dataset.tab);
    });
  }
}


/* ─── Inicialização ─── */
document.addEventListener("DOMContentLoaded", function() {
  renderTable("tablePre", INSTRUMENTOS.pre, "pre");
  renderTable("tableEsc", INSTRUMENTOS.esc, "esc");
  renderTable("tableAdu", INSTRUMENTOS.adu, "adu");
  updateCounts();
  setupTabs();
});
