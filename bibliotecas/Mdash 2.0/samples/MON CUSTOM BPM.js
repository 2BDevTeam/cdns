






function isMonitor(numeroMonitor) {

    var monitoExistente = GetQueryStringParam("i");

    return monitoExistente == numeroMonitor;



}

function loadTbvalOptions(wtwvstamp) {
    return new Promise(function (resolve, reject) {
        try {
            var requestData = [{
                wtwvstamp: wtwvstamp
            }];

            $.ajax({
                type: "POST",
                url: "../programs/gensel.aspx?cscript=gettbvaloptions",
                data: {
                    __EVENTARGUMENT: JSON.stringify(requestData)
                },
                success: function (response) {
                    try {
                        if (response.cod === "0000" && response.data) {
                            resolve(response.data);
                        } else {
                            console.error('Erro ao buscar opções tbval:', response.message);
                            reject(new Error(response.message || 'Erro desconhecido'));
                        }
                    } catch (e) {
                        console.error('Erro ao processar resposta tbval:', e);
                        reject(e);
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Erro AJAX ao buscar opções tbval:', error);
                    reject(new Error(error));
                }
            });
        } catch (e) {
            console.error('Erro ao carregar opções tbval:', e);
            reject(e);
        }
    });
}

function handleBPMSkeletons(show) {
    if (show) {

        setTimeout(function () {
            $("#bpmSkeletonAcoes").show();
            $("#bpmSkeletonMainContent").show();

        }, 500);

        return
    }

    setTimeout(function () {
        $("#bpmSkeletonAcoes").hide();
        $("#bpmSkeletonMainContent").hide();
    }, 500);


}

function initCustomBPM(dadosMonitor) {
    return new Promise(function (resolve, reject) {
        try {

            if (!isMonitor(dadosMonitor.monitor)) {
                resolve({ success: false, reason: 'Monitor não corresponde' });
                return;
            }

            var bpmUI = buildBPMHtml();
            $(dadosMonitor.containerToRender).append(bpmUI);

            initVueCustomBPM(dadosMonitor).then(function (result) {
                handleBPMSkeletons(false);
                resolve({
                    success: true,
                    vueApp: result.vueInstance,
                    bpm: result.refs
                });
            }).catch(function (error) {
                handleBPMSkeletons(false);
                reject(error);
            });

        } catch (error) {
            handleBPMSkeletons(false);
            console.log("Erro em initCustomBPM: " + error.message);
            reject(error);
        }
    });
}


function buildBPMHtml() {
    var bpmUI = "";
    bpmUI += "<div id='customBpmApp'>";
    bpmUI += "    <!-- Empty State quando não há dados -->";
    bpmUI += "    <div v-if='isEmpty' class='bpm-custom-2b-card' style='margin-top: 0.9em; text-align: center; padding: 60px 20px;'>";
    bpmUI += "        <div class='bpm-custom-2b-empty-state'>";
    bpmUI += "            <div class='bpm-custom-2b-empty-state-icon' style='font-size: 80px; margin-bottom: 20px;'><i class='fa fa-info-circle'></i></div>";
    bpmUI += "            <h3 class='bpm-custom-2b-empty-state-title' style='font-size: 24px; color: #334155; margin-bottom: 12px;'>Nenhum Workflow Encontrado</h3>";
    bpmUI += "            <p class='bpm-custom-2b-empty-state-text' style='font-size: 16px; color: #64748b; margin-bottom: 24px;'>";
    bpmUI += "                Não foram encontrados dados de workflow para este processo.";
    bpmUI += "            </p>";

    bpmUI += "        </div>";
    bpmUI += "    </div>";

    bpmUI += "    <div v-if='!isEmpty' style='margin-top: 0.9em;' class=''>";
    bpmUI += "        <div class='gr-row'>";
    bpmUI += "            <!-- COLUNA 1: Timeline de Acções -->";
    bpmUI += "            <div class='gr-col-md-3 gr-col-sm-3 gr-col-lg-3'>";

    bpmUI += "                <div style='height: 100%!important' class='bpm-custom-2b-card'>";
    bpmUI += '                        <div id="bpmSkeletonAcoes" class="mdashskeleton">';
    bpmUI += '                            <div class="mdash-skeleton mdash-skeleton-image"></div>';
    bpmUI += '                            <div class="mdash-skeleton mdash-skeleton-title"></div>';
    bpmUI += '                            <div class="mdash-skeleton mdash-skeleton-text"></div>';
    bpmUI += '                            <div class="mdash-skeleton mdash-skeleton-text"></div>';
    bpmUI += '                        </div>';
    bpmUI += "                    <header class='bpm-custom-2b-card-header'>";
    bpmUI += "                        <div>";
    bpmUI += "                            <h2 class='bpm-custom-2b-card-title'>Acções</h2>";
    // bpmUI += "                            <p class='bpm-custom-2b-card-subtitle'>Clique numa acção para ver detalhes</p>";
    bpmUI += "                        </div>";
    bpmUI += "                        <span class='bpm-custom-2b-text-xs bpm-custom-2b-text-slate-500 bpm-custom-2b-font-medium'>";
    bpmUI += "                            {{ actions.length }} acções";
    bpmUI += "                        </span>";
    bpmUI += "                    </header>";
    bpmUI += "                    <div class='bpm-custom-2b-card-content bpm-custom-2b-scroll-area'>";

    bpmUI += "                        <div class='bpm-custom-2b-actions-timeline'>";

    bpmUI += "                            <div v-for='action in actions' :key='action.wwfastamp' class='bpm-custom-2b-action-item'";
    bpmUI += "                                :class='{ selected: selectedAction && selectedAction.wwfastamp === action.wwfastamp, completed: action.fechado, current: !action.fechado }'";
    bpmUI += "                                @click='selectAction(action)'>";

    bpmUI += "                                <div class='bpm-custom-2b-action-marker' :class='action.fechado ? \"completed\" : \"current\"'></div>";
    bpmUI += "                                <div class='bpm-custom-2b-action-content'>";
    bpmUI += "                                    <div class='bpm-custom-2b-action-header'>";
    bpmUI += "                                        <h3 class='bpm-custom-2b-action-title'>{{ action.wtwad }}</h3>";
    bpmUI += "                                        <span class='bpm-custom-2b-action-date'>{{ getFormattedDate(action.dopen) }}</span>";
    bpmUI += "                                    </div>";
    bpmUI += "                                    <p class='bpm-custom-2b-action-description'>";
    bpmUI += "                                        {{ dadosMonitor.descricaoIdInterno }} {{ action.displayIdInterno || dadosMonitor.idInterno }}";
    bpmUI += "                                    </p>";
    bpmUI += "                                    <div class=' action-item-options  bpm-custom-2b-flex bpm-custom-2b-gap-1 bpm-custom-2b-mt-1'>";
    bpmUI += "                                        <span class='bpm-custom-2b-badge bpm-custom-2b-badge-small'";
    bpmUI += "                                            :class='getStatusBadge(action)'>";
    bpmUI += "                                            {{ getStatusText(action) }}";
    bpmUI += "                                        </span>";
    bpmUI += "                                        <button v-if='action.fechado' type='button' class='btn btn-xs btn-default btn-reabrir-accao' @click.prevent.stop='reabrirAccao(action)' style='margin-left: 0.5em; padding: 2px 8px;' data-tooltip='true' data-original-title='Reabrir'>";
    bpmUI += "                                            <i class='fa fa-unlock'></i>";
    bpmUI += "                                        </button>";
    bpmUI += "                                    </div>";
    bpmUI += "                                </div>";
    bpmUI += "                            </div>";
    bpmUI += "                        </div>";
    bpmUI += "                    </div>";
    bpmUI += "                </div>";
    bpmUI += "            </div>";
    bpmUI += "            <div class='gr-col-md-9 gr-col-sm-9 gr-col-lg-9'>";
    bpmUI += '                        <div id="bpmSkeletonMainContent" class="mdashskeleton">';
    bpmUI += '                            <div class="mdash-skeleton mdash-skeleton-image"></div>';
    bpmUI += '                            <div class="mdash-skeleton mdash-skeleton-title"></div>';
    bpmUI += '                            <div class="mdash-skeleton mdash-skeleton-text"></div>';
    bpmUI += '                            <div class="mdash-skeleton mdash-skeleton-text"></div>';
    bpmUI += '                        </div>';
    bpmUI += "                <div style='height: 100%!important' class='bpm-custom-2b-card' v-if='selectedAction'>";

    bpmUI += "                    <!-- Cabeçalho da acção -->";
    bpmUI += "                    <div class='bpm-custom-2b-card-header' style='border-bottom: none; padding-bottom: 8px;'>";
    bpmUI += "                        <div>";
    bpmUI += "                            <h1 class='bpm-custom-2b-action-main-title'>{{ selectedAction.wtwad }}</h1>";
    bpmUI += "                        </div>";


    bpmUI += "";
    bpmUI += "                        <div class='bpm-custom-2b-process-index'>";
    bpmUI += "                            {{dadosMonitor.idInterno}}";
    bpmUI += "                        </div>";
    bpmUI += "                    </div>";
    bpmUI += "                    <div class='bpm-custom-2b-card-content'>";
    bpmUI += "                        <div  style='display:flex;align-items:space-between;' class='bpm-action-options'>";
    bpmUI += "                            <div class='custom-options-container'>";
    bpmUI += "                                <button v-for='btn in customButtons' :key='btn.id' :id='btn.id' type='button' class='btn btn-default btn-sm' @click='callCustomFunction(btn.onClick)' style='margin-right:0.4em;'>";
    bpmUI += "                                    {{ btn.label }} <span v-if='btn.icon' :class='\"glyphicon \" + btn.icon'></span>";
    bpmUI += "                                </button>";
    bpmUI += "                            </div>";
    bpmUI += "                            <div id='defaultOptionsContainer' class='default-options-container'>";
    bpmUI += "                                <button v-if='editOnAction()' id='terminarAcaoBtn' type='button' class='btn btn-primary btn-sm' @click='completeAction' :disabled='selectedAction.fechado'>";
    bpmUI += "                                      <i class='fa fa-bullseye'></i>";
    bpmUI += "                                    Terminar";
    bpmUI += "                                </button>";
    bpmUI += "                            </div>";
    bpmUI += "                        </div>";
    bpmUI += "                        <!-- Informações de status da acção -->";
    bpmUI += "                        <div class='bpm-custom-2b-action-status-info'>";
    bpmUI += "                            <div class='bpm-custom-2b-status-item'>";
    bpmUI += "                                <span class='bpm-custom-2b-status-label'>Estado</span>";
    bpmUI += "                                <span class='bpm-custom-2b-badge bpm-custom-2b-badge-small'";
    bpmUI += "                                    :class='getStatusBadge(selectedAction)'>";
    bpmUI += "                                    {{ getStatusText(selectedAction) }}";
    bpmUI += "                                </span>";
    bpmUI += "                            </div>";
    bpmUI += "                            <div class='bpm-custom-2b-status-item'>";
    bpmUI += "                                <span class='bpm-custom-2b-status-label'>Prazo</span>";
    bpmUI += "                                <span class='bpm-custom-2b-status-value text-amber-600'>{{ getFormattedDate(selectedAction.dprazo) || 'N/D' }}</span>";
    bpmUI += "                            </div>";
    bpmUI += "                            <div class='bpm-custom-2b-status-item'>";
    bpmUI += "                                <span class='bpm-custom-2b-status-label'>Workflow</span>";
    bpmUI += "                                <span class='bpm-custom-2b-status-value'>{{ selectedAction.wtwd }}</span>";
    bpmUI += "                            </div>";
    bpmUI += "                            <div class='bpm-custom-2b-status-item'>";
    bpmUI += "                                <span class='bpm-custom-2b-status-label'>Abertura</span>";
    bpmUI += "                                <span class='bpm-custom-2b-status-value'>{{ selectedAction.usnaopen }}</span>";
    bpmUI += "                            </div>";
    bpmUI += "                            <div class='bpm-custom-2b-status-item'>";
    bpmUI += "                                <span class='bpm-custom-2b-status-label'>Início</span>";
    bpmUI += "                                <span class='bpm-custom-2b-status-value'>{{ getFormattedDate(selectedAction.dinicio) }}</span>";
    bpmUI += "                            </div>";
    bpmUI += "                            <div class='bpm-custom-2b-status-item'>";
    bpmUI += "                                <span class='bpm-custom-2b-status-label'>Responsável</span>";
    bpmUI += "                                <span class='bpm-custom-2b-status-value'>{{ selectedAction.usnaresp }}</span>";
    bpmUI += "                            </div>";

    bpmUI += "                        </div>";

    bpmUI += "                        <div class='bpm-custom-2b-card-content'>";
    bpmUI += "                            <!-- Tabs -->";
    bpmUI += "                            <div class='bpm-custom-2b-tabs'>";
    bpmUI += "                                <ul class='bpm-custom-2b-tabs-nav'>";
    bpmUI += "                                    <li>";
    bpmUI += "                                        <button type='button' class='bpm-custom-2b-tab-button'";
    bpmUI += "                                            :class='{ active: activeTab === \"variaveis\" }'";
    bpmUI += "                                            @click='activeTab = \"variaveis\"'>";
    bpmUI += "                                            Variáveis";
    bpmUI += "                                        </button>";
    bpmUI += "                                    </li>";
    //bpmUI += "                                    <li>";
    //bpmUI += "                                        <button type='button' class='bpm-custom-2b-tab-button'";
    //bpmUI += "                                            :class='{ active: activeTab === \"ligacoes\" }'";
    //bpmUI += "                                            @click='activeTab = \"ligacoes\"'>";
    //bpmUI += "                                            Ligações";
    //bpmUI += "                                        </button>";
    //bpmUI += "                                    </li>";
    //bpmUI += "                                    <li>";
    //bpmUI += "                                        <button type='button' class='bpm-custom-2b-tab-button'";
    //bpmUI += "                                            :class='{ active: activeTab === \"anexos\" }'";
    //bpmUI += "                                            @click='activeTab = \"anexos\"'>";
    //bpmUI += "                                            Anexos";
    //bpmUI += "                                        </button>";
    //bpmUI += "                                    </li>";
    bpmUI += "                                    <li>";
    bpmUI += "                                        <button type='button' class='bpm-custom-2b-tab-button'";
    bpmUI += "                                            :class='{ active: activeTab === \"comentarios\" }'";
    bpmUI += "                                            @click='activeTab = \"comentarios\"'>";
    bpmUI += "                                            Comentários";
    bpmUI += "                                        </button>";
    bpmUI += "                                    </li>";
    bpmUI += "                                </ul>";
    bpmUI += "                            </div>";
    bpmUI += "                            <!-- Conteúdo das tabs -->";
    bpmUI += "                            <div v-if='activeTab === \"variaveis\"'>";
    bpmUI += "                                <div v-if='selectedActionVariables && selectedActionVariables.length > 0' class='bpm-custom-2b-space-y-3'>";
    bpmUI += "                                    <div v-for='variable in selectedActionVariables' :key='variable.u_wwfvfastamp || variable.wwfvstamp' class='bpm-custom-2b-form-group'>";
    bpmUI += "                                        <label class='bpm-custom-2b-form-label'>{{ variable.nome }}</label>";
    bpmUI += "                                        <!-- Input para tipo Caracter (C) -->";
    bpmUI += "                                        <input v-if='variable.tipo === \"C\"' type='text' class='bpm-custom-2b-form-input' v-model='variable.cval' :readonly='variable.isReadOnly || selectedAction.fechado' />";
    bpmUI += "                                        <!-- Input para tipo Data (D) -->";
    bpmUI += "                                        <input v-if='variable.tipo === \"D\"' type='text' class='bpm-custom-2b-form-input bpm-datepicker' :data-varstamp='variable.u_wwfvfastamp || variable.wwfvstamp' v-model='variable.dval' :readonly='variable.isReadOnly || selectedAction.fechado' placeholder='yyyy-mm-dd' data-language='pt' />";
    bpmUI += "                                        <!-- Input para tipo Numérico (N) -->";
    bpmUI += "                                        <input v-if='variable.tipo === \"N\"' type='number' class='bpm-custom-2b-form-input' v-model='variable.nval' :readonly='variable.isReadOnly || selectedAction.fechado' />";
    bpmUI += "                                        <!-- Select para tipo Tabela (T) -->";
    bpmUI += "                                        <div v-if='variable.tipo === \"T\"'>";
    bpmUI += "                                            <select v-if='!variable.isLoadingOptions' class='bpm-custom-2b-form-select' v-model='variable.cval' :disabled='variable.isReadOnly || selectedAction.fechado'>";
    bpmUI += "                                                <option value=''>Selecione...</option>";
    bpmUI += "                                                <option v-for='option in variable.tbvalOptions' :key='option' :value='option'>{{ option }}</option>";
    bpmUI += "                                            </select>";
    bpmUI += "                                            <div v-else style='padding:8px; background:#f5f5f5; border-radius:4px; text-align:center;'>";
    bpmUI += "                                                <i class='fa fa-spinner fa-spin'></i> Carregando opções...";
    bpmUI += "                                            </div>";
    bpmUI += "                                        </div>";
    bpmUI += "                                        <!-- Textarea para tipo Memo (M) -->";
    bpmUI += "                                        <textarea v-if='variable.tipo === \"M\"' rows='3' class='bpm-custom-2b-form-textarea' v-model='variable.mval' :readonly='variable.isReadOnly || selectedAction.fechado'></textarea>";
    bpmUI += "                                    </div>";
    bpmUI += "                                    <div class='bpm-custom-2b-flex justify-end' style='margin-top: 16px;'>";
    bpmUI += "                                        <button type='button' @click='saveVariables' class='btn btn-primary btn-sm' :disabled='selectedAction.fechado'>";
    bpmUI += "                                            Gravar Variáveis";
    bpmUI += "                                        </button>";
    bpmUI += "                                    </div>";
    bpmUI += "                                </div>";
    bpmUI += "                                <div v-else class='bpm-custom-2b-note mt-3'>";
    bpmUI += "                                    Nenhuma variável disponível para esta acção.";
    bpmUI += "                                </div>";
    bpmUI += "                            </div>";
    bpmUI += "                            <div v-if='activeTab === \"ligacoes\"'>";
    bpmUI += "                                <p class='bpm-custom-2b-text-xs bpm-custom-2b-text-slate-500 mb-2'>";
    bpmUI += "                                    Processos relacionados e referências cruzadas.";
    bpmUI += "                                </p>";
    bpmUI += "                                <ul class='bpm-custom-2b-list'>";
    bpmUI += "                                    <li class='bpm-custom-2b-list-item'>";
    bpmUI += "                                        <div class='bpm-custom-2b-list-item-content'>";
    bpmUI += "                                            <h4 class='bpm-custom-2b-list-item-title'>Processo conexo nº 2025/198</h4>";
    bpmUI += "                                            <p class='bpm-custom-2b-list-item-description'>Mesmos factos, réu distinto.</p>";
    bpmUI += "                                        </div>";
    bpmUI += "                                        <a href='#' class='bpm-custom-2b-list-item-action'>Abrir</a>";
    bpmUI += "                                    </li>";
    bpmUI += "                                    <li class='bpm-custom-2b-list-item'>";
    bpmUI += "                                        <div class='bpm-custom-2b-list-item-content'>";
    bpmUI += "                                            <h4 class='bpm-custom-2b-list-item-title'>Execução fiscal nº 2025/45</h4>";
    bpmUI += "                                            <p class='bpm-custom-2b-list-item-description'>Ligada ao mesmo contribuinte.</p>";
    bpmUI += "                                        </div>";
    bpmUI += "                                        <a href='#' class='bpm-custom-2b-list-item-action'>Abrir</a>";
    bpmUI += "                                    </li>";
    bpmUI += "                                </ul>";
    bpmUI += "                            </div>";
    bpmUI += "                            <div v-if='activeTab === \"anexos\"'>";
    bpmUI += "                                <p class='bpm-custom-2b-text-xs bpm-custom-2b-text-slate-500 mb-2'>";
    bpmUI += "                                    Documentos relevantes para esta acção.";
    bpmUI += "                                </p>";
    bpmUI += "                                <ul class='bpm-custom-2b-list'>";
    bpmUI += "                                    <li class='bpm-custom-2b-list-item'>";
    bpmUI += "                                        <div class='bpm-custom-2b-list-item-content'>";
    bpmUI += "                                            <h4 class='bpm-custom-2b-list-item-title'>Mandado de notificação.pdf</h4>";
    bpmUI += "                                            <p class='bpm-custom-2b-list-item-description'>Carregado em 02.12.2025 por Assistente Ana.</p>";
    bpmUI += "                                        </div>";
    bpmUI += "                                        <a href='#' class='bpm-custom-2b-list-item-action'>Download</a>";
    bpmUI += "                                    </li>";
    bpmUI += "                                    <li class='bpm-custom-2b-list-item' style='border-style: dashed; background-color: #f8fafc;'>";
    bpmUI += "                                        <div class='bpm-custom-2b-list-item-content'>";
    bpmUI += "                                            <p class='bpm-custom-2b-text-xxs bpm-custom-2b-text-slate-500'>";
    bpmUI += "                                                Arraste aqui um novo documento ou clique para anexar.";
    bpmUI += "                                            </p>";
    bpmUI += "                                        </div>";
    bpmUI += "                                        <button class='bpm-custom-2b-text-xs bpm-custom-2b-font-medium text-slate-700'>+ Anexar</button>";
    bpmUI += "                                    </li>";
    bpmUI += "                                </ul>";
    bpmUI += "                            </div>";
    bpmUI += "                            <div v-if='activeTab === \"comentarios\"'>";

    bpmUI += "                                <div class='bpm-custom-2b-space-y-2'>";
    bpmUI += "                                    <div v-if='selectedAction.coment' class='bpm-custom-2b-form-group'>";
    bpmUI += "                                        <label class='bpm-custom-2b-form-label'>Comentários Existentes</label>";
    bpmUI += "                                        <pre class='bpm-custom-2b-form-textarea' style='white-space: pre-wrap; background-color: #f8f9fa;'>{{ selectedAction.coment }}</pre>";
    bpmUI += "                                    </div>";
    bpmUI += "                                    <div class='bpm-custom-2b-form-group'>";
    bpmUI += "                                        <label class='bpm-custom-2b-form-label'>Adicionar Novo Comentário</label>";
    bpmUI += "                                        <textarea rows='5' class='bpm-custom-2b-form-textarea'";
    bpmUI += "                                            placeholder='Escreva o seu comentário aqui...'";
    bpmUI += "                                            v-model='newComment'";
    bpmUI += "                                            :readonly='selectedAction.fechado'></textarea>";
    bpmUI += "                                    </div>";
    bpmUI += "                                    <div class='bpm-custom-2b-flex justify-end'>";
    bpmUI += "                                        <button type='button' @click='addComment' class='btn btn-default btn-sm' :disabled='selectedAction.fechado'>";
    bpmUI += "                                            Gravar Comentário";
    bpmUI += "                                        </button>";
    bpmUI += "                                    </div>";
    bpmUI += "                                </div>";
    bpmUI += "                            </div>";
    bpmUI += "                        </div>";
    bpmUI += "                    </div>";
    bpmUI += "                </div>";
    bpmUI += "                <!-- Estado vazio quando nenhuma ação está selecionada -->";
    bpmUI += "                <div class='bpm-custom-2b-card' v-else>";
    bpmUI += "                    <div class='bpm-custom-2b-empty-state'>";
    bpmUI += "                        <div class='bpm-custom-2b-empty-state-icon'></div>";
    bpmUI += "                        <h3 class='bpm-custom-2b-empty-state-title'>Nenhuma ação selecionada</h3>";
    bpmUI += "                        <p class='bpm-custom-2b-empty-state-text'>Selecione uma ação na lista à esquerda para ver detalhes.</p>";
    bpmUI += "                    </div>";
    bpmUI += "                </div>";
    bpmUI += "            </div>";
    bpmUI += "        </div>";
    bpmUI += "    </div>";
    bpmUI += "</div>";

    // Modal Bootstrap para confirmação de reabertura (fora do Vue)
    bpmUI += "<div class='modal fade' id='modalReabrirAccao' tabindex='-1' role='dialog'>";
    bpmUI += "    <div class='modal-dialog' role='document' style='max-width: 500px;'>";
    bpmUI += "        <div class='modal-content'>";
    bpmUI += "            <div class='modal-header' >";
    bpmUI += "                <h4 class='modal-title' style='color: #333; font-weight: 600;'>";
    // bpmUI += "                    <i class='fa fa-unlock' style='margin-right: 8px; color: #ff9800;'></i>";
    bpmUI += "                    Confirmar Reabertura da Acção";
    bpmUI += "                </h4>";
    bpmUI += "                <button type='button' class='close' data-dismiss='modal' aria-label='Close'>";
    bpmUI += "                    <span aria-hidden='true'>&times;</span>";
    bpmUI += "                </button>";
    bpmUI += "            </div>";
    bpmUI += "            <div class='modal-body'>";
    bpmUI += "                <div class='bpm-custom-2b-action-status-info' style='background-color: #fef3c7; border: 1px solid #fde68a; padding: 16px; border-radius: 4px; margin-bottom: 16px;'>";
    bpmUI += "                    <div style='display: flex; align-items: center; margin-bottom: 12px;'>";
    bpmUI += "                        <i class='fa fa-exclamation-triangle' style='color: #92400e; font-size: 24px; margin-right: 12px;'></i>";
    bpmUI += "                        <div>";
    bpmUI += "                            <strong style='color: #92400e; font-size: 14px;'>Atenção!</strong>";
    bpmUI += "                        </div>";
    bpmUI += "                    </div>";
    bpmUI += "                    <p style='color: #92400e; margin: 0; font-size: 13px;'>";
    bpmUI += "                        Ao abrir a acção <strong id='nomeAccaoReabrir'></strong> poderá ter impacto no workflow.";
    bpmUI += "                    </p>";
    bpmUI += "                </div>";
    bpmUI += "                <div style='margin-top: 16px;'>";
    bpmUI += "                    <p style='color: #333; font-size: 14px; margin: 0;'>Deseja confirmar a reabertura desta acção?</p>";
    bpmUI += "                </div>";
    bpmUI += "            </div>";
    bpmUI += "            <div class='modal-footer'>";
    bpmUI += "                <button type='button' class='btn btn-default btn-sm' data-dismiss='modal'>";
    bpmUI += "                    Cancelar";
    bpmUI += "                </button>";
    bpmUI += "                <button type='button' class='btn btn-primary btn-sm' id='btnConfirmarReabrirAccao'>";
    bpmUI += "                    <i class='fa fa-unlock'></i> Confirmar Reabertura";
    bpmUI += "                </button>";
    bpmUI += "            </div>";
    bpmUI += "        </div>";
    bpmUI += "    </div>";
    bpmUI += "</div>";

    return bpmUI;
}


function getWorkflowByStamp(wwfstamp) {

    if (!wwfstamp) {
        console.log("wwfstamp vazio, retornando null");
        return null;
    }

    var workflowResult = null;

    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=getWorkflowByStamp",
        async: false,
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ wwfstamp: wwfstamp }]),
        },
        success: function (response) {

            var errorMessage = "ao trazer resultados  do workflow com ID " + wwfstamp;
            try {
                //console.log(response)
                if (response.cod != "0000") {

                    console.log("Erro " + errorMessage, response)
                    workflowResult = null;
                    return;
                }
                workflowResult = response.data;

            } catch (error) {
                console.log("Erro interno " + errorMessage, response)
                workflowResult = null;
                //alertify.error("Erro interno " + errorMessage, 10000)
            }

            //  javascript:__doPostBack('','')
        }
    });

    return workflowResult;



}






function saveWorkflowVariables(workflow, actionStamp, variables) {
    var success = false;


    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=gravarvariaveiswwf",
        async: false,
        data: {
            '__EVENTARGUMENT': JSON.stringify([{
                wwfstamp: workflow._rawValue.wwfstamp,
                variables: variables
            }]),
        },
        success: function (response) {
            console.log("Resposta ao gravar variáveis: ", response);
            if (response.cod === "0000") {
                success = true;
            }
            else {

                alertify.error("Erro ao gravar variáveis", 10000);
            }


        }
    });

    // Simulação temporária
    console.log("Gravando variáveis da acção: ", variables);

    return success;
}


function refreshBPMData(dadosMonitor, selectedActionId) {
    try {
        var workflowData = getWorkflowByStamp(dadosMonitor.wwfstamp);

        // Mapear WWFV (variáveis globais) com tipovar='Global'
        var wwfvGlobal = workflowData.WWFV ? workflowData.WWFV.map(function (v) {
            return Object.assign({}, v, { tipovar: 'Global' });
        }) : [];

        // Mapear WWFVFA (variáveis de acção) com tipovar='Accao'
        var wwfvfaAccao = workflowData.WWFVFA ? workflowData.WWFVFA.map(function (v) {
            return Object.assign({}, v, { tipovar: 'Accao' });
        }) : [];

        // Unificar ambas as listas
        var wwfvUnified = wwfvGlobal.concat(wwfvfaAccao);

        return {
            wwfa: workflowData.WWFA,
            wwfv: wwfvUnified,
            selectedActionId: selectedActionId
        };
    } catch (error) {
        console.log("Erro ao refrescar dados BPM: " + error.message);
        return null;
    }
}




function initVueCustomBPM(dadosMonitor) {
    return new Promise(function (resolve, reject) {
        try {
            var createApp = Vue.createApp;
            var ref = Vue.ref;
            var onMounted = Vue.onMounted;
            var computed = Vue.computed;

            // Variáveis expostas globalmente para acesso externo
            var exposedRefs = {};

            var app = createApp({
                setup: function () {


                    var workflowData = getWorkflowByStamp(dadosMonitor.wwfstamp);
                    console.log("Workflow Data:", workflowData);

                    var hasData = workflowData && workflowData.WWF && workflowData.WWF.length > 0;
                    var isEmpty = ref(!hasData);

                    var workflow = ref(hasData ? workflowData.WWF[0] : null);
                    var wwfa = ref(hasData ? workflowData.WWFA : []);

                    // Mapear WWFV (variáveis globais) com tipovar='Global'
                    var wwfvGlobal = hasData && workflowData.WWFV ? workflowData.WWFV.map(function (v) {
                        return Object.assign({}, v, { tipovar: 'Global' });
                    }) : [];

                    // Mapear WWFVFA (variáveis de acção) com tipovar='Accao'
                    var wwfvfaAccao = hasData && workflowData.WWFVFA ? workflowData.WWFVFA.map(function (v) {
                        return Object.assign({}, v, { tipovar: 'Accao' });
                    }) : [];

                    // Unificar ambas as listas numa única lista de variáveis
                    var wwfv = ref(wwfvGlobal.concat(wwfvfaAccao));

                    var monitor = ref(dadosMonitor);
                    var customButtons = ref(dadosMonitor.customButtons || []);
                    var beforeCompleteCallback = dadosMonitor.beforeCompleteAction || null;
                    var onActionSelectCallback = dadosMonitor.onActionSelect || null;

                    var tbvalLoadingCache = {};

                    // Acção selecionada
                    var selectedAction = ref(null);

                    // Tab ativa
                    var activeTab = ref('variaveis');


                    var showModal = ref(false);
                    var confirmArchive = ref(false);

                    var newComment = ref('');

                    // Função para chamar funções customizadas
                    var callCustomFunction = function (functionName) {
                        if (typeof window[functionName] === 'function') {
                            window[functionName]();
                        }
                    };

                    // Função para converter data ISO para yyyy-MM-dd (formato do input date)
                    var convertDateForInput = function (dateString) {
                        if (!dateString || dateString.indexOf('1900-01-01') !== -1) return '';

                        // Se já está no formato yyyy-mm-dd, retornar como está
                        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                            return dateString;
                        }

                        var date = new Date(dateString);

                        // Verificar se a data é válida
                        if (isNaN(date.getTime())) return '';

                        var year = date.getFullYear();
                        var month = (date.getMonth() + 1).toString().padStart(2, '0');
                        var day = date.getDate().toString().padStart(2, '0');

                        return year + '-' + month + '-' + day;
                    };

                    // Helpers para processamento de variáveis
                    var isVariableVisible = function (variable, actionNo, wwfastamp) {
                        // Se é variável de Acção, verifica pelo wtwano
                        if (variable.tipovar === 'Accao') {
                            return variable.wwfastamp && variable.wwfastamp.toString().trim() == wwfastamp.toString().trim();
                        }

                        // Se é variável Global, usa a lógica normal com linvis
                        var linvis = variable.linvis || '';
                        if (!linvis) return true;

                        return linvis.split(',').indexOf(actionNo.toString()) === -1;
                    };

                    var isVariableReadOnly = function (variable, actionNo) {
                        // Se é variável de Acção, verifica o campo leitura
                        if (variable.tipovar === 'Accao') {
                            return variable.leitura === true || variable.leitura === 1;
                        }
                        
                        // Se é variável Global, usa a lógica normal com lronly
                        var lronly = variable.lronly || '';
                        if (!lronly) return false;

                        return lronly.split(',').indexOf(actionNo.toString()) !== -1;
                    };

                    var processDateVariable = function (variable) {
                        if (variable.tipo !== 'D' || !variable.dval) return;
                        variable.dval = convertDateForInput(variable.dval);
                    };

                    var parseTbvalOptionsFromString = function (tbvalString) {
                        if (!tbvalString) return [];

                        return tbvalString
                            .split(',')
                            .map(function (opt) { return opt.trim(); })
                            .filter(function (opt) { return opt !== ''; });
                    };

                    var loadTbvalOptionsFromCache = function (cacheKey) {
                        var cached = tbvalLoadingCache[cacheKey];

                        return {
                            options: cached ? (cached.options || []) : [],
                            loading: cached ? (cached.loading || false) : false
                        };
                    };

                    var initializeTbvalCache = function (cacheKey) {
                        tbvalLoadingCache[cacheKey] = {
                            loading: true,
                            options: []
                        };
                    };

                    var updateTbvalCache = function (cacheKey, options, loading) {
                        tbvalLoadingCache[cacheKey] = {
                            loading: loading || false,
                            options: options || []
                        };
                    };

                    var updateVariableInWwfv = function (varStamp, updates, tipovar) {
                        var foundVar = wwfv.value.find(function (v) {
                            if (tipovar === 'Accao') {
                                return v.u_wwfvfastamp === varStamp;
                            } else {
                                return v.wwfvstamp === varStamp;
                            }
                        });

                        if (foundVar) {
                            Object.assign(foundVar, updates);
                        }
                    };

                    var loadTbvalOptionsAsync = function (wtwvstamp, varStamp, tipovar) {
                        var cacheKey = varStamp; // Usar o stamp da variável como chave de cache
                        initializeTbvalCache(cacheKey);

                        loadTbvalOptions(wtwvstamp)
                            .then(function (options) {
                                updateTbvalCache(cacheKey, options, false);
                                updateVariableInWwfv(varStamp, {
                                    tbvalOptions: options,
                                    isLoadingOptions: false
                                }, tipovar);
                            })
                            .catch(function (error) {
                                console.error('Erro ao carregar opções do tbval:', error);
                                updateTbvalCache(cacheKey, [], false);
                                updateVariableInWwfv(varStamp, {
                                    tbvalOptions: [],
                                    isLoadingOptions: false
                                }, tipovar);
                            });
                    };

                    var processTableVariable = function (variable) {
                        if (variable.tipo !== 'T') return;

                        var hasQuerySource = variable.qtbval === true || variable.qtbval === 1;

                        console.log('Processing table variable:', variable.nome, 'hasQuerySource:', hasQuerySource, 'tbval:', variable.tbval, 'qtbval:', variable.qtbval);

                        if (hasQuerySource) {
                            // Usar o stamp correto dependendo do tipo de variável
                            var varStamp = variable.tipovar === 'Accao' ? variable.u_wwfvfastamp : variable.wwfvstamp;
                            var cached = loadTbvalOptionsFromCache(varStamp);

                            if (tbvalLoadingCache[varStamp]) {
                                variable.tbvalOptions = cached.options;
                                variable.isLoadingOptions = cached.loading;
                            } else {
                                variable.tbvalOptions = [];
                                variable.isLoadingOptions = true;
                                loadTbvalOptionsAsync(variable.wtwvstamp, varStamp, variable.tipovar);
                            }
                        } else {
                            variable.tbvalOptions = parseTbvalOptionsFromString(variable.tbval||variable.tbval1);
                            console.log('Parsed tbval options:', variable.tbval);
                        }
                    };

                    var enrichVariable = function (variable, actionNo) {
                        var enriched = Object.assign({}, variable, {
                            isReadOnly: isVariableReadOnly(variable, actionNo)
                        });

                        processDateVariable(enriched);
                        processTableVariable(enriched);

                        return enriched;
                    };

                    // Computed para variáveis filtradas da ação selecionada
                    var selectedActionVariables = computed(function () {
                        if (!selectedAction.value) return [];

                        var actionNo = selectedAction.value.wtwano;
                        var wwfastamp = selectedAction.value.wwfastamp;

                        var filteredVars = wwfv.value
                            .filter(function (v) { return isVariableVisible(v, actionNo,wwfastamp); })
                            .map(function (v) { return enrichVariable(v, actionNo); });
                        
                   
                        // Criar cópia do array antes de ordenar (slice cria uma cópia superficial)
                        var sortedVars = filteredVars.slice().sort(function (a, b) {
                            // Ordenar por ordem (se existir)
                            var ordemA = parseInt(a.ordem);
                            var ordemB = parseInt(b.ordem);
                            
                            // Se ambos têm ordem válida, ordenar por ordem
                            if (!isNaN(ordemA) && !isNaN(ordemB)) {
                                return ordemA - ordemB;
                            }
                            
                            // Se apenas A tem ordem, A vem primeiro
                            if (!isNaN(ordemA)) return -1;
                            
                            // Se apenas B tem ordem, B vem primeiro
                            if (!isNaN(ordemB)) return 1;
                            
                            // Se nenhum tem ordem, manter ordem original
                            return 0;
                        });
                        
                     
                        
                        return sortedVars;
                    });

                    // Selecionar ação
                    var selectAction = function (action) {
                        selectedAction.value = Object.assign({}, action);

                        // Atualizar displayIdInterno específico para esta ação
                        if (monitor.value.getIdInternoPorAccao && typeof monitor.value.getIdInternoPorAccao === 'function') {
                            try {
                                var novoIdInterno = monitor.value.getIdInternoPorAccao(action, selectedActionVariables.value);
                                if (novoIdInterno) {
                                    selectedAction.value.displayIdInterno = novoIdInterno;
                                    
                                    // Atualizar também na lista de ações para persistir
                                    var actionIndex = wwfa.value.findIndex(function(a) {
                                        return a.wwfastamp === action.wwfastamp;
                                    });
                                    if (actionIndex !== -1) {
                                        wwfa.value[actionIndex].displayIdInterno = novoIdInterno;
                                    }
                                }
                            } catch (error) {
                                console.error("Erro ao atualizar ID interno:", error);
                            }
                        }

                        // Chamar callback onActionSelect se fornecido
                        if (onActionSelectCallback && typeof onActionSelectCallback === 'function') {
                            try {
                                // Passar toda a instância do Vue com refs e métodos expostos
                                var vueInstance = {
                                    // Refs reativos
                                    workflow: workflow,
                                    actions: wwfa,
                                    variables: wwfv,
                                    selectedAction: selectedAction,
                                    selectedActionVariables: selectedActionVariables,
                                    activeTab: activeTab,
                                    newComment: newComment,
                                    dadosMonitor: monitor,

                                    // Métodos
                                    selectAction: selectAction,
                                    saveVariables: saveVariables,
                                    addComment: addComment,
                                    completeAction: completeAction,
                                    initializeDatepickers: initializeDatepickers,
                                    
                                    // Helper para obter valores atuais (não reativos)
                                    getCurrentState: function () {
                                        return {
                                            workflow: workflow.value,
                                            actions: wwfa.value,
                                            variables: wwfv.value,
                                            selectedAction: selectedAction.value,
                                            selectedActionVariables: selectedActionVariables.value,
                                            activeTab: activeTab.value
                                        };
                                    }
                                };
                                
                                onActionSelectCallback(action, vueInstance);
                            } catch (error) {
                                console.error('Erro ao executar callback onActionSelect:', error);
                            }
                        }

                        // Reinicializar datepickers quando trocar de acção
                        setTimeout(function () {
                            initializeDatepickers();
                        }, 300);
                    };

                    // Funções helper para formatação
                    var getFormattedDate = function (dateString) {
                        if (!dateString || dateString.indexOf('1900-01-01') !== -1) return '';

                        var date = new Date(dateString);
                        var year = date.getFullYear();
                        var month = (date.getMonth() + 1).toString().padStart(2, '0');
                        var day = date.getDate().toString().padStart(2, '0');

                        return year + '-' + month + '-' + day;
                    };

                    var getVariableValue = function (variable) {
                        switch (variable.tipo) {
                            case 'C': return variable.cval || '';
                            case 'D': return variable.dval || '';
                            case 'N': return variable.nval || 0;
                            case 'M': return variable.mval || '';
                            case 'T': return variable.cval || '';
                            default: return '';
                        }
                    };

                    var getFieldToUpdate = function (tipo) {
                        switch (tipo) {
                            case 'C': return 'cval';
                            case 'D': return 'dval';
                            case 'N': return 'nval';
                            case 'M': return 'mval';
                            case 'T': return 'cval';
                            default: return 'cval';
                        }
                    };

                    // Funções para status
                    var getStatusBadge = function (action) {
                        if (action.fechado) {
                            return 'bpm-custom-2b-badge-success';
                        } else {
                            return 'bpm-custom-2b-badge-warning';
                        }
                    };

                    var getStatusText = function (action) {
                        if (action.fechado) {
                            return 'Concluído';
                        } else {
                            return 'Em curso';
                        }
                    };

                    // Obter próxima ação
                    var getNextAction = function (action) {
                        var currentIndex = actions.value.findIndex(function (a) { return a.id === action.id; });
                        if (currentIndex < actions.value.length - 1) {
                            return actions.value[currentIndex + 1].name;
                        }
                        return "Fim";
                    };

                    // Salvar rascunho
                    var saveDraft = function () {
                        if (!selectedAction.value) return;

                        var index = actions.value.findIndex(function (a) { return a.id === selectedAction.value.id; });
                        if (index !== -1) {
                            actions.value[index] = Object.assign({}, selectedAction.value);
                        }

                        alert('✓ Rascunho guardado');
                    };

                    // Mostrar modal de confirmação
                    var showConfirmModal = function () {
                        if (!selectedAction.value) return;
                        showModal.value = true;
                    };

                    // Fechar modal
                    var closeModal = function () {
                        showModal.value = false;
                        confirmArchive.value = false;
                    };

                    // Concluir ação
                    var completeAction = function (skipBeforeCallback) {
                        if (!selectedAction.value) return;

                        var shouldSkip = skipBeforeCallback === true;

                        if (beforeCompleteCallback && !shouldSkip) {
                            beforeCompleteCallback(selectedAction.value, function () {
                                completeAction(true);
                            });
                            return;
                        }

                        console.log("Prosseguindo com término normal da ação");
                        handleBPMSkeletons(true);

                        $.ajax({
                            type: "POST",
                            url: "../programs/gensel.aspx?cscript=terminaraccao",
                            async: false,
                            data: {
                                '__EVENTARGUMENT': JSON.stringify([{
                                    wwfastamp: selectedAction.value.wwfastamp,
                                    wwfstamp: workflow.value.wwfstamp,
                                    wtwano: selectedAction.value.wtwano,
                                    wtwstamp: workflow.value.wtwstamp,
                                    wtwastamp: selectedAction.value.wtwastamp
                                }]),
                            },
                            success: function (response) {
                                console.log("Resposta ao terminar ação: ", response);
                                if (response.cod === "0000") {
                                    // Refrescar dados
                                    var refreshedData = refreshBPMData(monitor.value, selectedAction.value.wwfastamp);

                                    if (refreshedData) {
                                        wwfa.value = refreshedData.wwfa;
                                        wwfv.value = refreshedData.wwfv;

                                        var updatedAction = wwfa.value.find(function (a) { return a.wwfastamp === selectedAction.value.wwfastamp; });
                                        if (updatedAction) {
                                            selectAction(updatedAction);
                                        }

                                        handleBPMSkeletons(false);
                                        alertify.success('Ação terminada com sucesso', 5000);
                                    } else {
                                        handleBPMSkeletons(false);
                                        alertify.error('Erro ao refrescar dados', 5000);
                                    }
                                } else if (response.cod === "00401") {
                                    // Erro de validação - variáveis obrigatórias não preenchidas
                                    handleBPMSkeletons(false);
                                    alertify.error(response.message, 10000);
                                } else {
                                    handleBPMSkeletons(false);
                                    console.log("Erro ao terminar ação: ", response);
                                    //alertify.error('Erro ao terminar ação', 5000);
                                    alertify.error('Erro ao terminar ação', 5000);
                                }
                            },
                            error: function (err) {
                                handleBPMSkeletons(false);
                                console.log("Erro ao terminar ação: ", err);
                                alertify.error('Erro ao terminar ação', 5000);
                            }
                        });
                    };

                    var editOnAction = function () {
                        return !selectedAction.value.fechado;
                    };

                    // Variável global para armazenar a ação a reabrir
                    var currentActionToReabrir = null;

                    // Reabrir ação - abre modal de confirmação usando jQuery
                    var reabrirAccao = function (action) {
                        if (!action || !action.fechado) return;

                        console.log("Abrindo modal de reabertura para acção: ", action);
                        currentActionToReabrir = action;

                        // Atualizar nome da ação na modal
                        $('#nomeAccaoReabrir').text(action.wtwad);

                        // Abrir modal com jQuery
                        $('#modalReabrirAccao').modal('show');
                    };

                    // Configurar evento de confirmação da modal (apenas uma vez)
                    $(document).off('click', '#btnConfirmarReabrirAccao').on('click', '#btnConfirmarReabrirAccao', function () {
                        if (!currentActionToReabrir) return;

                        var action = currentActionToReabrir;

                        // Fechar modal
                        $('#modalReabrirAccao').modal('hide');

                        handleBPMSkeletons(true);

                        $.ajax({
                            type: "POST",
                            url: "../programs/gensel.aspx?cscript=reabriraccao",
                            async: false,
                            data: {
                                '__EVENTARGUMENT': JSON.stringify([{
                                    wwfastamp: action.wwfastamp
                                }]),
                            },
                            success: function (response) {
                                console.log("Resposta ao reabrir ação: ", response);
                                if (response.cod === "0000") {
                                    // Refrescar dados
                                    var refreshedData = refreshBPMData(monitor.value, action.wwfastamp);

                                    if (refreshedData) {
                                        wwfa.value = refreshedData.wwfa;
                                        wwfv.value = refreshedData.wwfv;

                                        var updatedAction = wwfa.value.find(function (a) { return a.wwfastamp === action.wwfastamp; });
                                        if (updatedAction) {
                                            selectAction(updatedAction);
                                        }

                                        handleBPMSkeletons(false);
                                        alertify.success('Acção reaberta com sucesso', 5000);
                                    } else {
                                        handleBPMSkeletons(false);
                                        alertify.error('Erro ao refrescar dados', 5000);
                                    }
                                } else {
                                    handleBPMSkeletons(false);
                                    alertify.error('Erro ao reabrir acção: ' + response.message, 5000);
                                }
                            },
                            error: function (err) {
                                handleBPMSkeletons(false);
                                console.log("Erro ao reabrir acção: ", err);
                                alertify.error('Erro ao reabrir acção', 5000);
                            }
                        });

                        currentActionToReabrir = null;
                    });

                    // Adicionar comentário
                    var addComment = function () {
                        if (!selectedAction.value || !newComment.value.trim()) return;

                        handleBPMSkeletons(true);

                        $.ajax({
                            type: "POST",
                            url: "../programs/gensel.aspx?cscript=gravarcomentario",
                            async: false,
                            data: {
                                '__EVENTARGUMENT': JSON.stringify([{
                                    wwfstamp: workflow.value.wwfstamp,
                                    wwfastamp: selectedAction.value.wwfastamp,
                                    comentario: newComment.value
                                }]),
                            },
                            success: function (response) {
                                console.log("Resposta ao gravar comentário: ", response);
                                if (response.cod === "0000") {
                                    // Refrescar dados
                                    var refreshedData = refreshBPMData(monitor.value, selectedAction.value.wwfastamp);

                                    if (refreshedData) {
                                        wwfa.value = refreshedData.wwfa;
                                        wwfv.value = refreshedData.wwfv;

                                        var updatedAction = wwfa.value.find(function (a) { return a.wwfastamp === selectedAction.value.wwfastamp; });
                                        if (updatedAction) {
                                            selectAction(updatedAction);
                                        }

                                        newComment.value = '';
                                        handleBPMSkeletons(false);
                                        alertify.success('Comentário gravado com sucesso', 5000);
                                    } else {
                                        handleBPMSkeletons(false);
                                        alertify.error('Erro ao refrescar dados', 5000);
                                    }
                                } else {
                                    handleBPMSkeletons(false);
                                    alertify.error('Erro ao gravar comentário', 5000);
                                }
                            },
                            error: function () {
                                handleBPMSkeletons(false);
                                alertify.error('Erro ao gravar comentário', 5000);
                            }
                        });
                    };

                    // Gravar variáveis
                    var saveVariables = function () {
                        if (!selectedAction.value) return;

                        handleBPMSkeletons(true);

                        // Mapear selectedActionVariables para formato esperado pelo VB
                        var variablesToSave = selectedActionVariables.value.map(function (v) {
                            return {
                                wwfvstamp: v.wwfvstamp,
                                value: getVariableValue(v),
                                fieldToUpdate: getFieldToUpdate(v.tipo),
                                readOnly: v.isReadOnly,
                                tipovar: v.tipovar,
                                u_wwfvfastamp:v.u_wwfvfastamp
                            };
                        });

                        var result = saveWorkflowVariables(workflow, selectedAction.value.wwfastamp, variablesToSave);

                        if (result) {
                            // Refrescar dados
                            var refreshedData = refreshBPMData(monitor.value, selectedAction.value.wwfastamp);

                            if (refreshedData) {
                                wwfa.value = refreshedData.wwfa;
                                wwfv.value = refreshedData.wwfv;

                                // Reselecionar a ação atual após o refresh
                                var updatedAction = wwfa.value.find(function (a) { return a.wwfastamp === refreshedData.selectedActionId; });
                                if (updatedAction) {
                                    selectAction(updatedAction);
                                }

                                handleBPMSkeletons(false);
                                alertify.success('Variáveis gravadas com sucesso', 5000);
                            } else {
                                handleBPMSkeletons(false);
                                alertify.error('Erro ao refrescar dados', 5000);
                            }
                        } else {
                            handleBPMSkeletons(false);
                            alertify.error('Erro ao gravar variáveis', 5000);
                        }
                    };

                    // Função para inicializar datepickers
                    var initializeDatepickers = function () {
                        setTimeout(function () {
                            $('.bpm-datepicker').each(function () {
                                var $input = $(this);
                                var varstamp = $input.attr('data-varstamp');
                                var currentValue = $input.val();

                                // Destruir datepicker existente se houver
                                if ($input.data('datepicker')) {
                                    $input.datepicker('destroy');
                                }

                                // Inicializar datepicker com formato yyyy-mm-dd
                                $input.datepicker({
                                    dateFormat: 'yyyy-mm-dd', // yy = 4 dígitos no jQuery UI
                                    yearRange: '1900:2100',
                                    changeYear: true,
                                    changeMonth: true,
                                    onSelect: function (dateText, inst) {
                                        // Atualizar o valor no Vue quando a data é selecionada - suporta ambos os tipos de stamp
                                        var variable = wwfv.value.find(function (v) {
                                            return v.u_wwfvfastamp === varstamp || v.wwfvstamp === varstamp;
                                        });

                                        if (variable) {
                                            variable.dval = dateText;
                                            console.log("Data selecionada para variável ", varstamp, ": ", variable.dval);
                                            // Forçar atualização do input
                                            $input.val(dateText);
                                            // Disparar evento de input para o Vue detectar a mudança
                                            $input.trigger('input');
                                        }
                                    }
                                });

                                // Restaurar o valor após inicializar o datepicker
                                if (currentValue) {
                                    $input.val(currentValue);
                                }
                            });
                        }, 200);
                    };

                    // Selecionar última acção aberta por padrão (baseado no campo dopen)
                    onMounted(function () {
                        try {
                            console.log("ON MOUNTED", wwfa.value)
                            
                            // Inicializar displayIdInterno para cada ação
                            if (monitor.value.getIdInternoPorAccao && typeof monitor.value.getIdInternoPorAccao === 'function') {
                                wwfa.value.forEach(function(action) {
                                    // Para inicializar, precisamos das variáveis dessa ação
                                    // Por enquanto, usar o ID padrão
                                    action.displayIdInterno = monitor.value.idInterno;
                                });
                            }
                            
                            if (wwfa.value.length > 0) {
                                // Filtrar apenas acções abertas (não fechadas)
                                var accoesAbertas = wwfa.value

                                if (accoesAbertas.length > 0) {
                                    // Clonar array e ordenar por dopen descendente
                                    var accoesOrdenadas = accoesAbertas.slice().sort(function (a, b) {
                                        var dateA = new Date(a.dopen || '1900-01-01');
                                        var dateB = new Date(b.dopen || '1900-01-01');
                                        return dateB - dateA; // Ordem descendente
                                    });
                                    // Selecionar a primeira (última aberta)
                                    console.log("Ações abertas ordenadas: ", accoesOrdenadas[0].dopen);
                                    selectAction(accoesOrdenadas[0]);
                                } else {
                                    // Se todas estão fechadas, selecionar a primeira
                                    selectAction(wwfa.value[0]);
                                }
                            }

                            // Inicializar datepickers após montar (com delay maior para garantir renderização)
                            setTimeout(function () {
                                initializeDatepickers();
                            }, 500);

                            // Expor refs e métodos globalmente
                            exposedRefs = {
                                // Refs reativos
                                workflow: workflow,
                                actions: wwfa,
                                variables: wwfv,
                                selectedAction: selectedAction,
                                selectedActionVariables: selectedActionVariables,
                                activeTab: activeTab,
                                newComment: newComment,
                                dadosMonitor: monitor,

                                // Métodos
                                selectAction: selectAction,
                                saveVariables: saveVariables,
                                addComment: addComment,
                                completeAction: completeAction,
                                initializeDatepickers: initializeDatepickers,
                                refreshData: function () {
                                    var refreshedData = refreshBPMData(monitor.value, selectedAction.value ? selectedAction.value.wwfastamp : null);
                                    if (refreshedData) {
                                        wwfa.value = refreshedData.wwfa;
                                        wwfv.value = refreshedData.wwfv;

                                        // Reinicializar datepickers após refresh
                                        setTimeout(function () {
                                            initializeDatepickers();
                                        }, 100);

                                        return true;
                                    }
                                    return false;
                                },

                                // Helper para obter valores atuais (não reativos)
                                getCurrentState: function () {
                                    return {
                                        workflow: workflow.value,
                                        actions: wwfa.value,
                                        variables: wwfv.value,
                                        selectedAction: selectedAction.value,
                                        selectedActionVariables: selectedActionVariables.value,
                                        activeTab: activeTab.value
                                    };
                                }
                            };

                            // Resolve a promise após montar completamente
                            setTimeout(function () {
                                resolve({
                                    vueInstance: vueAppInstance,
                                    refs: exposedRefs
                                });
                            }, 100);
                        } catch (error) {
                            reject(error);
                        }
                    });

                    return {
                        isEmpty: isEmpty,
                        actions: wwfa,
                        workflow: workflow,
                        editOnAction: editOnAction,
                        dadosMonitor: monitor,
                        customButtons: customButtons,
                        selectedAction: selectedAction,
                        selectedActionVariables: selectedActionVariables,
                        activeTab: activeTab,
                        showModal: showModal,
                        confirmArchive: confirmArchive,
                        newComment: newComment,
                        selectAction: selectAction,
                        callCustomFunction: callCustomFunction,
                        getStatusBadge: getStatusBadge,
                        getStatusText: getStatusText,
                        getFormattedDate: getFormattedDate,
                        getVariableValue: getVariableValue,
                        getNextAction: getNextAction,
                        saveDraft: saveDraft,
                        showConfirmModal: showConfirmModal,
                        closeModal: closeModal,
                        completeAction: completeAction,
                        reabrirAccao: reabrirAccao,
                        addComment: addComment,
                        saveVariables: saveVariables
                    };
                }
            });

            var vueAppInstance = app.mount('#customBpmApp');

        } catch (error) {
            reject(error);
        }
    });
}



function getNomeAccaoWorklow() {
    var trElements = getValuesFromAccaoWorkflowTb("Ação")
    if (trElements) {

        return trElements.find("td:eq(1)").text();
    }

    return "N/A"
}

function getValuesFromAccaoWorkflowTb(nomeFiltro) {

    return $("#acao tr").filter(function () {
        return $(this).find("td").filter(function () {
            return $(this).text() === nomeFiltro;
        }).length > 0;
    });
    //return $("#acao tr:has(td:contains('" + nomeFiltro + "'))");
}




