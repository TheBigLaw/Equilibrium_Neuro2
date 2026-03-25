// vineland3.js — Lógica de correção Vineland-3 (Formulário Pais/Cuidadores Nível de Domínio)
// Carrega regras do JSON e processa pontuações

let RULES = null;

async function loadRules() {
    try {
        const response = await fetch('vineland3_rules.json');
        RULES = await response.json();
        return RULES;
    } catch (e) {
        console.error('Erro ao carregar regras:', e);
        return null;
    }
}

// ============================================================
// CÁLCULO DE IDADE CRONOLÓGICA
// ============================================================
function calcularIdade(dataNascimento, dataTeste) {
    if (!dataNascimento || !dataTeste) return null;
    const nasc = new Date(dataNascimento);
    const teste = new Date(dataTeste);
    let anos = teste.getFullYear() - nasc.getFullYear();
    let meses = teste.getMonth() - nasc.getMonth();
    let dias = teste.getDate() - nasc.getDate();
    if (dias < 0) { meses--; }
    if (meses < 0) { anos--; meses += 12; }
    return { anos, meses };
}

// ============================================================
// PONTUAÇÃO BRUTA POR DOMÍNIO
// ============================================================
function calcularPontuacaoBruta(domainKey) {
    const domain = RULES.domains[domainKey];
    if (!domain) return { bruta: 0, estimativas: 0, total: domain ? domain.maxItems : 0 };
    
    let soma = 0;
    let estimativas = 0;
    const totalItens = domain.maxItems;

    for (let i = 1; i <= totalItens; i++) {
        const input = document.querySelector(`input[name="${domainKey}_${i}"]:checked`);
        if (input) {
            soma += parseInt(input.value);
        }
        const estCheckbox = document.getElementById(`est_${domainKey}_${i}`);
        if (estCheckbox && estCheckbox.checked) {
            estimativas++;
        }
    }

    const percentEstimativas = totalItens > 0 ? Math.round((estimativas / totalItens) * 100) : 0;
    
    return {
        bruta: soma,
        estimativas: estimativas,
        totalItens: totalItens,
        percentEstimativas: percentEstimativas
    };
}

// ============================================================
// PONTUAÇÃO COMPORTAMENTO MAL-ADAPTATIVO
// ============================================================
function calcularComportamento(sectionKey) {
    const section = RULES.behavior[sectionKey];
    if (!section) return { soma: 0, estimativas: 0 };
    
    let soma = 0;
    let estimativas = 0;

    for (let i = 1; i <= section.maxItems; i++) {
        const input = document.querySelector(`input[name="${sectionKey}_${i}"]:checked`);
        if (input) {
            soma += parseInt(input.value);
        }
        const estCheckbox = document.getElementById(`est_${sectionKey}_${i}`);
        if (estCheckbox && estCheckbox.checked) {
            estimativas++;
        }
    }

    return { soma, estimativas };
}

// ============================================================
// CLASSIFICAÇÃO DO NÍVEL ADAPTATIVO
// ============================================================
function classificarNivelAdaptativo(pontuacaoPadrao) {
    if (!pontuacaoPadrao || pontuacaoPadrao === '' || isNaN(pontuacaoPadrao)) {
        return { label: '—', color: '#6b7280' };
    }
    const pp = parseInt(pontuacaoPadrao);
    const niveis = RULES.classification.adaptiveLevel;
    for (const nivel of niveis) {
        if (pp >= nivel.min && pp <= nivel.max) {
            return { label: nivel.label, color: nivel.color };
        }
    }
    return { label: '—', color: '#6b7280' };
}

// ============================================================
// CÁLCULO DO CCA (Composto de Comportamento Adaptativo)
// ============================================================
function calcularSomaPP() {
    const ppCOM = parseInt(document.getElementById('pp_COM')?.value) || 0;
    const ppAVD = parseInt(document.getElementById('pp_AVD')?.value) || 0;
    const ppSOC = parseInt(document.getElementById('pp_SOC')?.value) || 0;
    return ppCOM + ppAVD + ppSOC;
}

// ============================================================
// PROCESSAMENTO COMPLETO
// ============================================================
function processarResultados() {
    // Dados do paciente
    const dataNasc = document.getElementById('dataNascimento')?.value;
    const dataTeste = document.getElementById('dataTeste')?.value;
    const idade = calcularIdade(dataNasc, dataTeste);

    if (idade) {
        document.getElementById('idadeAnos').textContent = idade.anos;
        document.getElementById('idadeMeses').textContent = idade.meses;
    }

    // Domínios adaptativos
    const dominios = ['COM', 'AVD', 'SOC', 'HMOT'];
    const resultados = {};

    dominios.forEach(key => {
        const res = calcularPontuacaoBruta(key);
        resultados[key] = res;

        // Atualizar campos de pontuação bruta
        const brutaEl = document.getElementById(`bruta_${key}`);
        if (brutaEl) brutaEl.textContent = res.bruta;

        const estEl = document.getElementById(`est_count_${key}`);
        if (estEl) estEl.textContent = `${res.estimativas} (${res.percentEstimativas}%)`;

        // Classificação a partir da Pontuação Padrão inserida manualmente
        const ppInput = document.getElementById(`pp_${key}`);
        if (ppInput) {
            const classificacao = classificarNivelAdaptativo(ppInput.value);
            const nivelEl = document.getElementById(`nivel_${key}`);
            if (nivelEl) {
                nivelEl.textContent = classificacao.label;
                nivelEl.style.color = classificacao.color;
                nivelEl.style.fontWeight = '700';
            }
        }
    });

    // Soma das Pontuações Padrão (COM + AVD + SOC)
    const somaPP = calcularSomaPP();
    const somaPPEl = document.getElementById('soma_pp');
    if (somaPPEl) somaPPEl.textContent = somaPP;

    // CCA
    const ccaInput = document.getElementById('pp_CCA');
    if (ccaInput) {
        const classificacaoCCA = classificarNivelAdaptativo(ccaInput.value);
        const nivelCCA = document.getElementById('nivel_CCA');
        if (nivelCCA) {
            nivelCCA.textContent = classificacaoCCA.label;
            nivelCCA.style.color = classificacaoCCA.color;
            nivelCCA.style.fontWeight = '700';
        }
    }

    // Comportamento Mal-adaptativo
    const sections = ['sectionA', 'sectionB', 'sectionC'];
    sections.forEach(key => {
        const res = calcularComportamento(key);
        const somaEl = document.getElementById(`soma_${key}`);
        if (somaEl) somaEl.textContent = res.soma;
    });

    // Itens Críticos (Seção C itens com pontuação 2 ou 1)
    atualizarItensCriticos();

    // Atualizar gráfico
    atualizarGrafico();
}

// ============================================================
// ITENS CRÍTICOS
// ============================================================
function atualizarItensCriticos() {
    const criticos = [];
    
    // Verificar todos os itens de comportamento
    ['sectionA', 'sectionB', 'sectionC'].forEach(sectionKey => {
        const section = RULES.behavior[sectionKey];
        for (let i = 1; i <= section.maxItems; i++) {
            const input = document.querySelector(`input[name="${sectionKey}_${i}"]:checked`);
            if (input && parseInt(input.value) >= 1) {
                criticos.push({
                    section: section.name,
                    num: i,
                    text: section.items[i - 1].text,
                    value: parseInt(input.value)
                });
            }
        }
    });

    const container = document.getElementById('itensCriticos');
    if (container) {
        if (criticos.length === 0) {
            container.innerHTML = '<p class="no-criticos">Nenhum item crítico identificado.</p>';
        } else {
            container.innerHTML = criticos.map(c => `
                <div class="critico-item ${c.value === 2 ? 'critico-alto' : 'critico-medio'}">
                    <span class="critico-badge">${c.value === 2 ? 'Frequente' : 'Às vezes'}</span>
                    <span class="critico-section">${c.section}</span> — Item ${c.num}: ${c.text}
                </div>
            `).join('');
        }
    }
}

// ============================================================
// GRÁFICO DE PERFIL
// ============================================================
function atualizarGrafico() {
    const canvas = document.getElementById('perfilGrafico');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);

    // Configurações
    const padding = { top: 40, right: 40, bottom: 60, left: 70 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    
    // Escala Y: 20 a 140 (Pontuação Padrão)
    const minY = 20;
    const maxY = 140;
    const rangeY = maxY - minY;

    function yPos(val) {
        return padding.top + chartH - ((val - minY) / rangeY) * chartH;
    }

    // Faixas de classificação (fundo)
    const faixas = [
        { min: 130, max: 140, color: 'rgba(26,116,49,0.1)' },
        { min: 115, max: 129, color: 'rgba(45,158,66,0.1)' },
        { min: 86, max: 114, color: 'rgba(59,130,246,0.08)' },
        { min: 71, max: 85, color: 'rgba(245,158,11,0.1)' },
        { min: 20, max: 70, color: 'rgba(220,38,38,0.1)' }
    ];

    faixas.forEach(f => {
        ctx.fillStyle = f.color;
        const y1 = yPos(Math.min(f.max, maxY));
        const y2 = yPos(Math.max(f.min, minY));
        ctx.fillRect(padding.left, y1, chartW, y2 - y1);
    });

    // Linhas de referência
    [70, 85, 100, 115, 130].forEach(val => {
        ctx.beginPath();
        ctx.strokeStyle = val === 100 ? '#dc2626' : '#d1d5db';
        ctx.lineWidth = val === 100 ? 2 : 1;
        if (val !== 100) ctx.setLineDash([4, 4]);
        else ctx.setLineDash([]);
        ctx.moveTo(padding.left, yPos(val));
        ctx.lineTo(padding.left + chartW, yPos(val));
        ctx.stroke();
        ctx.setLineDash([]);

        // Label Y
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(val, padding.left - 10, yPos(val) + 4);
    });

    // Domínios
    const labels = ['COM', 'AVD', 'SOC', 'CCA', 'HMOT'];
    const fullLabels = ['Comunicação', 'AVD', 'Socialização', 'CCA', 'Hab. Motoras'];
    const barWidth = chartW / labels.length;
    const pontos = [];

    labels.forEach((key, i) => {
        const x = padding.left + barWidth * i + barWidth / 2;

        // Label X
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 11px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(fullLabels[i], x, h - padding.bottom + 20);
        ctx.font = '10px system-ui';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(`(${key})`, x, h - padding.bottom + 34);

        // Ponto
        const ppInput = document.getElementById(`pp_${key}`);
        const val = ppInput ? parseInt(ppInput.value) : NaN;
        
        if (!isNaN(val) && val >= minY && val <= maxY) {
            pontos.push({ x, y: yPos(val), val, key });
        }
    });

    // Linha conectando pontos
    if (pontos.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2.5;
        pontos.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
    }

    // Pontos
    pontos.forEach(p => {
        const classificacao = classificarNivelAdaptativo(p.val);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = classificacao.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Valor sobre o ponto
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(p.val, p.x, p.y - 14);
    });

    // Título
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Perfil da Pontuação Padrão do Domínio e CCA', w / 2, 20);
}

// ============================================================
// GERAÇÃO DINÂMICA DO FORMULÁRIO
// ============================================================
function gerarFormulario() {
    if (!RULES) return;

    // Domínios adaptativos
    const dominios = ['COM', 'AVD', 'SOC', 'HMOT'];
    dominios.forEach(key => {
        const domain = RULES.domains[key];
        const container = document.getElementById(`items_${key}`);
        if (!container || !domain) return;

        let html = '';
        domain.items.forEach(item => {
            const isBinary = item.type === 'binary';
            html += `
            <div class="item-row">
                <div class="item-number">${item.num}.</div>
                <div class="item-content">
                    <div class="item-text">${item.text}</div>
                    ${item.tip ? `<div class="item-tip">ℹ ${item.tip}</div>` : ''}
                </div>
                <div class="item-scoring">
                    <label class="score-option">
                        <input type="radio" name="${key}_${item.num}" value="2" onchange="processarResultados()">
                        <span class="score-btn score-2">2</span>
                    </label>
                    ${!isBinary ? `
                    <label class="score-option">
                        <input type="radio" name="${key}_${item.num}" value="1" onchange="processarResultados()">
                        <span class="score-btn score-1">1</span>
                    </label>` : ''}
                    <label class="score-option">
                        <input type="radio" name="${key}_${item.num}" value="0" onchange="processarResultados()">
                        <span class="score-btn score-0">0</span>
                    </label>
                </div>
                <div class="item-est">
                    <input type="checkbox" id="est_${key}_${item.num}" class="est-checkbox" onchange="processarResultados()" title="Estimado">
                </div>
            </div>`;
        });
        container.innerHTML = html;
    });

    // Comportamento mal-adaptativo
    ['sectionA', 'sectionB', 'sectionC'].forEach(sectionKey => {
        const section = RULES.behavior[sectionKey];
        const container = document.getElementById(`items_${sectionKey}`);
        if (!container || !section) return;

        let html = '';
        section.items.forEach(item => {
            html += `
            <div class="item-row">
                <div class="item-number">${item.num}.</div>
                <div class="item-content">
                    <div class="item-text">${item.text}</div>
                    ${item.tip ? `<div class="item-tip">ℹ ${item.tip}</div>` : ''}
                </div>
                <div class="item-scoring">
                    <label class="score-option">
                        <input type="radio" name="${sectionKey}_${item.num}" value="2" onchange="processarResultados()">
                        <span class="score-btn score-2">2</span>
                    </label>
                    <label class="score-option">
                        <input type="radio" name="${sectionKey}_${item.num}" value="1" onchange="processarResultados()">
                        <span class="score-btn score-1">1</span>
                    </label>
                    <label class="score-option">
                        <input type="radio" name="${sectionKey}_${item.num}" value="0" onchange="processarResultados()">
                        <span class="score-btn score-0">0</span>
                    </label>
                </div>
                <div class="item-est">
                    <input type="checkbox" id="est_${sectionKey}_${item.num}" class="est-checkbox" onchange="processarResultados()" title="Estimado">
                </div>
            </div>`;
        });
        container.innerHTML = html;
    });
}

// ============================================================
// NAVEGAÇÃO ENTRE SEÇÕES
// ============================================================
function mostrarSecao(secaoId) {
    document.querySelectorAll('.secao-conteudo').forEach(el => el.classList.remove('ativa'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(secaoId)?.classList.add('ativa');
    document.querySelector(`[data-secao="${secaoId}"]`)?.classList.add('active');
    
    // Scroll ao topo da seção
    document.getElementById(secaoId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================
// IMPRESSÃO
// ============================================================
function imprimirResultados() {
    window.print();
}

// ============================================================
// LIMPAR FORMULÁRIO
// ============================================================
function limparFormulario() {
    if (!confirm('Deseja limpar todos os dados? Esta ação não pode ser desfeita.')) return;
    document.querySelectorAll('input[type="radio"]').forEach(el => el.checked = false);
    document.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
    document.querySelectorAll('input[type="number"]').forEach(el => el.value = '');
    document.querySelectorAll('input[type="text"]').forEach(el => el.value = '');
    document.querySelectorAll('input[type="date"]').forEach(el => el.value = '');
    processarResultados();
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadRules();
    if (RULES) {
        gerarFormulario();
        processarResultados();
    }
});
