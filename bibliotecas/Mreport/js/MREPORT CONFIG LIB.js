function pageLoad() {

    registerListeners()
    organizarCampos()

    outrasFuncoes()

}



function organizarCampos() {

    try {

    } catch (error) {

    }


}


function addStyleToReportDesigner() {

    var themecolor = getColorByType("primary").background;

    var reportConfigCss = "";
    reportConfigCss += "  :root {";
    reportConfigCss += "      --primary-color: " + themecolor + ";";
    reportConfigCss += "      --secondary-color: " + themecolor + ";";
    reportConfigCss += "      --accent-color: " + themecolor + ";";
    reportConfigCss += "      --light-color: #f8f9fa;";
    reportConfigCss += "      --dark-color: #212529;";
    reportConfigCss += "      --success-color: #4cc9f0;";
    reportConfigCss += "      --warning-color: #f72585;";
    reportConfigCss += "      --info-color: #7209b7;";
    reportConfigCss += "  }";

    reportConfigCss += "  .app-header {";
    reportConfigCss += "      background: linear-gradient(135deg, " + themecolor + ", " + themecolor + ");";
    reportConfigCss += "      color: white;";
    reportConfigCss += "      padding: 15px 0;";
    reportConfigCss += "      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);";
    reportConfigCss += "  }";

    reportConfigCss += "  .app-title {";
    reportConfigCss += "      font-weight: 700;";
    reportConfigCss += "      font-size: 1.8rem;";
    reportConfigCss += "      margin: 0;";
    reportConfigCss += "  }";

    reportConfigCss += "  .m-report-side-bar {";
    reportConfigCss += "      background-color: white;";
    reportConfigCss += "      border-radius: 10px;";
    reportConfigCss += "      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);";
    reportConfigCss += "      padding: 20px;";
    reportConfigCss += "      height: calc(100vh - 120px);";
    reportConfigCss += "      overflow-y: auto;";
    reportConfigCss += "  }";

    reportConfigCss += "  .main-content {";
    reportConfigCss += "      background-color: white;";
    reportConfigCss += "      border-radius: 10px;";
    reportConfigCss += "      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);";
    reportConfigCss += "      padding: 20px;";
    reportConfigCss += "      height: calc(100vh - 120px);";
    reportConfigCss += "      overflow-y: auto;";
    reportConfigCss += "      position: relative;";
    reportConfigCss += "  }";

    reportConfigCss += "  .properties-panel {";
    reportConfigCss += "      background-color: white;";
    reportConfigCss += "      border-radius: 10px;";
    reportConfigCss += "      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);";
    reportConfigCss += "      padding: 20px;";
    reportConfigCss += "      height: calc(100vh - 120px);";
    reportConfigCss += "      overflow-y: auto;";
    reportConfigCss += "  }";

    reportConfigCss += "  .component-item {";
    reportConfigCss += "      background-color: var(--light-color);";
    reportConfigCss += "      font-family: Nunito, sans-serif;";
    //  reportConfigCss += "      border: 1px solid #e0e0e0;";
    reportConfigCss += "      border-radius: 8px;";
    reportConfigCss += "      padding: 12px 15px;";
    reportConfigCss += "      margin-bottom: 10px;";
    reportConfigCss += "      cursor: grab;";
    reportConfigCss += "      transition: all 0.3s ease;";
    reportConfigCss += "      display: flex;";
    reportConfigCss += "      align-items: center;";
    reportConfigCss += "      color: #3f5670;";
    reportConfigCss += "      gap: 10px;";
    reportConfigCss += "  }";

    reportConfigCss += "  .component-item:hover {";
    reportConfigCss += "      background-color: #e9ecef;";
    reportConfigCss += "      transform: translateY(-2px);";
    reportConfigCss += "      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);";
    reportConfigCss += "  }";

    reportConfigCss += "  .component-icon {";
    reportConfigCss += "      color: " + themecolor + ";";
    reportConfigCss += "      font-size: 1.2rem;";
    reportConfigCss += "  }";

    reportConfigCss += "  .report-canvas {";
    reportConfigCss += "      min-height: 800px;";
    reportConfigCss += "      background-color: #fafafa;";
    reportConfigCss += "      border: 2px dashed #d0d0d0;";
    reportConfigCss += "      border-radius: 8px;";
    reportConfigCss += "      padding: 20px;";
    reportConfigCss += "      position: relative;";
    reportConfigCss += "  }";

    reportConfigCss += "  .report-object {";
    reportConfigCss += "      position: absolute;";
    reportConfigCss += "      border: 1px solid #d0d0d0;";
    reportConfigCss += "      border-radius: 6px;";
    reportConfigCss += "      background-color: white;";
    reportConfigCss += "      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);";
    reportConfigCss += "      padding: 10px;";
    reportConfigCss += "      cursor: move;";
    reportConfigCss += "      overflow: hidden;";
    reportConfigCss += "      z-index: 10;";
    reportConfigCss += "  }";

    reportConfigCss += "  .report-object.selected {";
    reportConfigCss += "      border: 2px solid " + themecolor + ";";
    reportConfigCss += "      box-shadow: 0 4px 12px rgba(67, 97, 238, 0.2);";
    reportConfigCss += "  }";

    reportConfigCss += "  .object-handle {";
    reportConfigCss += "      height: 20px;";
    reportConfigCss += "      background-color: " + themecolor + ";";
    reportConfigCss += "      margin: -10px -10px 10px -10px;";
    reportConfigCss += "      border-radius: 6px 6px 0 0;";
    reportConfigCss += "      cursor: move;";
    reportConfigCss += "      display: flex;";
    reportConfigCss += "      align-items: center;";
    reportConfigCss += "      padding: 0 10px;";
    reportConfigCss += "      color: white;";
    reportConfigCss += "      font-size: 0.8rem;";
    reportConfigCss += "  }";

    reportConfigCss += "  .report-object.dragging {";
    reportConfigCss += "      opacity: 0.7;";
    reportConfigCss += "      transform: scale(0.95);";
    reportConfigCss += "      z-index: 1000;";
    reportConfigCss += "      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);";
    reportConfigCss += "  }";

    reportConfigCss += "  .resize-handle {";
    reportConfigCss += "      position: absolute;";
    reportConfigCss += "      width: 10px;";
    reportConfigCss += "      height: 10px;";
    reportConfigCss += "      background-color: " + themecolor + ";";
    reportConfigCss += "      border-radius: 50%;";
    reportConfigCss += "      bottom: 0;";
    reportConfigCss += "      right: 0;";
    reportConfigCss += "      cursor: nwse-resize;";
    reportConfigCss += "  }";

    reportConfigCss += "  .filter-item {";
    reportConfigCss += "      background-color: #f0f4ff;";
    reportConfigCss += "      border: 1px solid #d0d8ff;";
    reportConfigCss += "      border-radius: 8px;";
    reportConfigCss += "      padding: 12px;";
    reportConfigCss += "      margin-bottom: 10px;";
    reportConfigCss += "  }";

    reportConfigCss += "  .btn-primary {";
    reportConfigCss += "      background-color: " + themecolor + ";";
    reportConfigCss += "      border-color: " + themecolor + ";";
    reportConfigCss += "  }";

    reportConfigCss += "  .btn-primary:hover {";
    reportConfigCss += "      background-color: " + themecolor + ";";
    reportConfigCss += "      border-color: " + themecolor + ";";
    reportConfigCss += "  }";

    reportConfigCss += "  .btn-success {";
    reportConfigCss += "      background-color: var(--success-color);";
    reportConfigCss += "      border-color: var(--success-color);";
    reportConfigCss += "  }";

    reportConfigCss += "  .card {";
    reportConfigCss += "      border: none;";
    reportConfigCss += "      border-radius: 10px;";
    reportConfigCss += "      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);";
    reportConfigCss += "      margin-bottom: 20px;";
    reportConfigCss += "  }";

    reportConfigCss += "  .card-header {";
    reportConfigCss += "      background-color: white;";
    reportConfigCss += "      border-bottom: 1px solid #eaeaea;";
    reportConfigCss += "      font-weight: 600;";
    reportConfigCss += "      padding: 15px 20px;";
    reportConfigCss += "      border-radius: 10px 10px 0 0 !important;";
    reportConfigCss += "  }";

    reportConfigCss += "  .section-title {";
    reportConfigCss += "      font-weight: 600;";
    reportConfigCss += "      color: " + themecolor + ";";
    reportConfigCss += "      margin-bottom: 15px;";
    reportConfigCss += "      padding-bottom: 8px;";
    reportConfigCss += "      border-bottom: 1px solid #eaeaea;";
    reportConfigCss += "  }";

    reportConfigCss += "  .empty-state {";
    reportConfigCss += "      text-align: center;";
    reportConfigCss += "      padding: 40px 20px;";
    reportConfigCss += "      color: #6c757d;";
    reportConfigCss += "  }";

    reportConfigCss += "  .empty-state i {";
    reportConfigCss += "      font-size: 3rem;";
    reportConfigCss += "      margin-bottom: 15px;";
    reportConfigCss += "      color: #dee2e6;";
    reportConfigCss += "  }";

    reportConfigCss += "  .m-report-form-label {";
    reportConfigCss += "      font-weight: 500;";
    reportConfigCss += "      margin-bottom: 5px;";
    reportConfigCss += "  }";

    reportConfigCss += "  .nav-tabs .nav-link.active {";
    reportConfigCss += "      color: " + themecolor + ";";
    reportConfigCss += "      font-weight: 600;";
    reportConfigCss += "      border-bottom: 2px solid " + themecolor + ";";
    reportConfigCss += "  }";

    reportConfigCss += "  .nav-tabs .nav-link {";
    reportConfigCss += "      color: #6c757d;";
    reportConfigCss += "  }";

    reportConfigCss += "  .grid-system {";
    reportConfigCss += "      display: grid;";
    reportConfigCss += "      grid-template-columns: repeat(12, 1fr);";
    reportConfigCss += "      gap: 10px;";
    reportConfigCss += "      margin-bottom: 15px;";
    reportConfigCss += "  }";

    reportConfigCss += "  .grid-item {";
    reportConfigCss += "      height: 20px;";
    reportConfigCss += "      background-color: #e9ecef;";
    reportConfigCss += "      border-radius: 3px;";
    reportConfigCss += "      cursor: pointer;";
    reportConfigCss += "  }";

    reportConfigCss += "  .grid-item.active {";
    reportConfigCss += "      background-color: " + themecolor + ";";
    reportConfigCss += "  }";

    reportConfigCss += "  .badge-primary {";
    reportConfigCss += "      background-color: " + themecolor + ";";
    reportConfigCss += "  }";

    $('head').append('<style>' + reportConfigCss + '</style>');


}

function outrasFuncoes() {

    addStyleToReportDesigner();
    generateMDashReportDesigner();

    // Configurar interact.js para drag and drop e redimensionamento
    var canvas = document.getElementById('report-canvas');

    // Inicializar petite-vue
    PetiteVue.createApp(App).mount('#reportDesignerContainer');

    // Adicionar evento global de mousemove para redimensionamento
    document.addEventListener('mousemove', function (event) {
        var self = App;
        if (!self.resizing || !self.resizeObject) return;

        var deltaX = event.clientX - self.resizeStart.x;
        var deltaY = event.clientY - self.resizeStart.y;

        self.resizeObject.width = Math.max(50, self.resizeStart.width + deltaX);
        self.resizeObject.height = Math.max(30, self.resizeStart.height + deltaY);

        event.preventDefault();
    });

    document.addEventListener('mouseup', function () {
        var self = App;
        self.resizing = false;
        self.resizeObject = null;
    });
    try {

    } catch (error) {

    }

}




function registerListeners() {

    try {
        

    } catch (error) {

    }
}





function generateMDashReportDesigner() {



    var reportConfigHtml = "";
    reportConfigHtml += "<div id='reportDesignerContainer'>";
    reportConfigHtml += "    <div class='container-fluid mt-4'>";
    reportConfigHtml += "        <div class='row g-4'>";
    reportConfigHtml += "            <div class='col-md-3'>";
    reportConfigHtml += "                <div class='m-report-side-bar'>";
    reportConfigHtml += "                    <h5 class='section-title'><i class='fas fa-shapes me-2'></i> Objectos</h5>";
    reportConfigHtml += "                    <div class='component-item' v-for='component in components' :key='component.id' draggable='true' @dragstart='startDrag(component, $event)' @drop.prevent='drop($event)' @dragover.prevent>";
    reportConfigHtml += "                        <i class='component-icon' :class='component.icon'></i>";
    reportConfigHtml += "                        <span>{{ component.name }}</span>";
    reportConfigHtml += "                    </div>";
    reportConfigHtml += "                    <div class='mt-4'>";
    reportConfigHtml += "                        <h5 class='section-title'><i  class='fas fa-filter me-2'></i> Filtros</h5>";
    reportConfigHtml += "                        <button style='margin-bottom:2em;margin-left:0.3em' type='button' class='btn btn-primary btn-sm w-100 mb-3' @click='addFilter'>";
    reportConfigHtml += "                            <i class='fas fa-plus me-1'></i> Adicionar Filtro";
    reportConfigHtml += "                        </button>";
    reportConfigHtml += "                        <div class='filter-item' v-for='(filter, index) in filters' :key='index'>";
    reportConfigHtml += "                            <div class='d-flex justify-content-between align-items-center mb-2'>";
    reportConfigHtml += "                                <span class='fw-bold'>{{ filter.name || 'Novo Filtro' }}</span>";
    reportConfigHtml += "                                <button type='button' class='btn btn-sm btn-outline-danger' @click='removeFilter(index)'>";
    reportConfigHtml += "                                    <i class='fas fa-times'></i>";
    reportConfigHtml += "                                </button>";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                            <div class='mb-2'>";
    reportConfigHtml += "                                <label class='m-report-form-label'>Tipo</label>";
    reportConfigHtml += "                                <select class='form-select form-select-sm' v-model='filter.type'>";
    reportConfigHtml += "                                    <option value='text'>Texto</option>";
    reportConfigHtml += "                                    <option value='number'>Numérico</option>";
    reportConfigHtml += "                                    <option value='checkbox'>Checkbox</option>";
    reportConfigHtml += "                                    <option value='list'>Lista</option>";
    reportConfigHtml += "                                </select>";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                            <div class='mb-2'>";
    reportConfigHtml += "                                <label class='m-report-form-label'>Ordem</label>";
    reportConfigHtml += "                                <input type='number' class='form-control form-control-sm' v-model='filter.order'>";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                            <div class='mb-2'>";
    reportConfigHtml += "                                <label class='m-report-form-label'>Tamanho (1-12)</label>";
    reportConfigHtml += "                                <input type='number' min='1' max='12' class='form-control form-control-sm' v-model='filter.size'>";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                        </div>";
    reportConfigHtml += "                    </div>";
    reportConfigHtml += "                    <div class='mt-4'>";
    reportConfigHtml += "                        <h5 class='section-title'><i style='margin-left:0.3em' class='fas fa-database me-2'></i> Fontes de Dados</h5>";
    reportConfigHtml += "                        <button style='margin-bottom:2em;' type='button' class='btn btn-primary btn-sm w-100 mb-3' @click='addDataSource'>";
    reportConfigHtml += "                            <i class='fas fa-plus me-1'></i> Adicionar Fonte";
    reportConfigHtml += "                        </button>";
    reportConfigHtml += "                        <div class='filter-item' v-for='(source, index) in dataSources' :key='index'>";
    reportConfigHtml += "                            <div class='d-flex justify-content-between align-items-center mb-2'>";
    reportConfigHtml += "                                <span class='fw-bold'>{{ source.name || 'Nova Fonte' }}</span>";
    reportConfigHtml += "                                <button type='button' class='btn btn-sm btn-outline-danger' @click='removeDataSource(index)'>";
    reportConfigHtml += "                                    <i class='fas fa-times'></i>";
    reportConfigHtml += "                                </button>";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                            <div class='mb-2'>";
    reportConfigHtml += "                                <label class='m-report-form-label'>Tipo</label>";
    reportConfigHtml += "                                <select class='form-select form-select-sm' v-model='source.type'>";
    reportConfigHtml += "                                    <option value='query'>Query SQL</option>";
    reportConfigHtml += "                                    <option value='api'>API REST</option>";
    reportConfigHtml += "                                </select>";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                            <div class='mb-2'>";
    reportConfigHtml += "                                <label class='m-report-form-label'>Query/URL</label>";
    reportConfigHtml += "                                <textarea class='form-control form-control-sm' rows='3' v-model='source.query'></textarea>";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                        </div>";
    reportConfigHtml += "                    </div>";
    reportConfigHtml += "                </div>";
    reportConfigHtml += "            </div>";
    reportConfigHtml += "            <div class='col-md-6'>";
    reportConfigHtml += "                <div class='main-content'>";
    reportConfigHtml += "                    <div class='d-flex justify-content-between align-items-center mb-3'>";
    reportConfigHtml += "                        <h5 class='section-title mb-0'><i class='fa fa-file-text me-2'></i> Desenho do relatório</h5>";
    reportConfigHtml += "                        <div style='display:none'>";
    reportConfigHtml += "                            <button type='button' class='btn btn-sm btn-outline-secondary me-2'>";
    reportConfigHtml += "                                <i class='fas fa-plus me-1'></i> Página";
    reportConfigHtml += "                            </button>";
    reportConfigHtml += "                            <button type='button' class='btn btn-sm btn-outline-secondary'>";
    reportConfigHtml += "                                <i class='fas fa-cog me-1'></i> Configurações";
    reportConfigHtml += "                            </button>";
    reportConfigHtml += "                        </div>";
    reportConfigHtml += "                    </div>";

    reportConfigHtml += "                    <div class='report-canvas' id='report-canvas'  @mousemove='handleDrag' @dragover.prevent @drop='drop($event)' @click='deselectAll'>";
    // reportConfigHtml += "                    <div class='report-canvas' id='report-canvas'  @mousemove='handleDrag' @dragover.prevent @drop='drop(null)' @click='deselectAll'>";
    reportConfigHtml += "                        <div v-if='reportObjects.length === 0' class='empty-state'>";
    reportConfigHtml += "                            <i class='fas fa-object-ungroup'></i>";
    reportConfigHtml += "                            <h5>Área de Trabalho Vazia</h5>";
    reportConfigHtml += "                            <p>Arraste componentes da barra lateral para começar a criar o seu relatório</p>";
    reportConfigHtml += "                        </div>";
    reportConfigHtml += "                        <div class='report-object' v-for='obj in reportObjects' :key='obj.id' :style='{ left: obj.x + \"px\", top: obj.y + \"px\", width: obj.width + \"px\", height: obj.height + \"px\", zIndex: obj.selected ? 100 : 10 }' :class='{ selected: obj.selected, dragging: obj === dragObject }' @click.stop='selectObject(obj)'>";
    //reportConfigHtml += "                        <div class='report-object' v-for='obj in reportObjects' :key='obj.id' :style='{ left: obj.x + \"px\", top: obj.y + \"px\", width: obj.width + \"px\", height: obj.height + \"px\", zIndex: obj.selected ? 100 : 10 }' :class='{ selected: obj.selected }' @click.stop='selectObject(obj)'>";
    reportConfigHtml += "                            <div class='object-handle'>";
    reportConfigHtml += "                                <i :class='obj.icon' class='me-1'></i>{{ obj.name }}";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                            <div class='object-content' v-if='obj.type === \"text\"'>{{ obj.content || 'Texto de exemplo' }}</div>";
    reportConfigHtml += "                            <div class='object-content' v-if='obj.type === \"table\"'>";
    reportConfigHtml += "                                <div class='table-responsive'>";
    reportConfigHtml += "                                    <table class='table table-sm table-bordered'>";
    reportConfigHtml += "                                        <thead><tr><th v-for='col in 3' :key='col'>Coluna {{ col }}</th></tr></thead>";
    reportConfigHtml += "                                        <tbody><tr v-for='row in 3' :key='row'><td v-for='col in 3' :key='col'>Dado {{ row }}-{{ col }}</td></tr></tbody>";
    reportConfigHtml += "                                    </table>";
    reportConfigHtml += "                                </div>";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                            <div class='resize-handle' @mousedown.stop='startResize(obj, $event)'></div>";
    reportConfigHtml += "                        </div>";
    reportConfigHtml += "                    </div>";
    reportConfigHtml += "                </div>";
    reportConfigHtml += "            </div>";
    reportConfigHtml += "            <div class='col-md-3'>";
    reportConfigHtml += "                <div class='properties-panel'>";
    reportConfigHtml += "                    <h5 class='section-title'><i class='fas fa-sliders-h me-2'></i> Propriedades</h5>";
    reportConfigHtml += "                    <div v-if='selectedObject'>";
    reportConfigHtml += "                        <div class='mb-3'><label class='m-report-form-label'>Nome</label><input type='text' class='form-control' v-model='selectedObject.name'></div>";
    reportConfigHtml += "                        <div class='mb-3' v-if='selectedObject.type === \"text\"'>";
    reportConfigHtml += "                            <label class='m-report-form-label'>Conteúdo</label>";
    reportConfigHtml += "                            <textarea class='form-control' rows='3' v-model='selectedObject.content'></textarea>";
    reportConfigHtml += "                            <div class='form-text'>Use {{ campo }} para inserir valores de campos de dados</div>";
    reportConfigHtml += "                        </div>";
    reportConfigHtml += "                        <div class='mb-3' v-if='selectedObject.type === \"table\"'>";
    reportConfigHtml += "                            <label class='m-report-form-label'>Fonte de Dados</label>";
    reportConfigHtml += "                            <select class='form-select' v-model='selectedObject.dataSource'>";
    reportConfigHtml += "                                <option v-for='source in dataSources' :key='source.id' :value='source.id'>{{ source.name }}</option>";
    reportConfigHtml += "                            </select>";
    reportConfigHtml += "                        </div>";
    reportConfigHtml += "                        <div class='mb-3'>";
    reportConfigHtml += "                            <label class='m-report-form-label'>Posição e Tamanho</label>";
    reportConfigHtml += "                            <div class='row g-2'>";
    reportConfigHtml += "                                <div class='col-6'><input type='number' class='form-control' placeholder='X' v-model='selectedObject.x'></div>";
    reportConfigHtml += "                                <div class='col-6'><input type='number' class='form-control' placeholder='Y' v-model='selectedObject.y'></div>";
    reportConfigHtml += "                                <div class='col-6'><input type='number' class='form-control' placeholder='Largura' v-model='selectedObject.width'></div>";
    reportConfigHtml += "                                <div class='col-6'><input type='number' class='form-control' placeholder='Altura' v-model='selectedObject.height'></div>";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                        </div>";
    reportConfigHtml += "                        <div class='mb-3'>";
    reportConfigHtml += "                            <label class='m-report-form-label'>Estilo</label>";
    reportConfigHtml += "                            <div class='form-check'><input class='form-check-input' type='checkbox' id='boldCheck' v-model='selectedObject.bold'><label class='form-check-label' for='boldCheck'>Texto em Negrito</label></div>";
    reportConfigHtml += "                            <div class='form-check'><input class='form-check-input' type='checkbox' id='italicCheck' v-model='selectedObject.italic'><label class='form-check-label' for='italicCheck'>Texto em Itálico</label></div>";
    reportConfigHtml += "                        </div>";
    reportConfigHtml += "                        <div class='mb-3'><label class='m-report-form-label'>Cor do Texto</label><input type='color' class='form-control form-control-color' v-model='selectedObject.textColor'></div>";
    reportConfigHtml += "                        <div class='mb-3'><label class='m-report-form-label'>Cor de Fundo</label><input type='color' class='form-control form-control-color' v-model='selectedObject.backgroundColor'></div>";
    reportConfigHtml += "                        <button type='button' class='btn btn-danger w-100' @click='removeObject(selectedObject)'><i class='fas fa-trash me-1'></i> Remover Componente</button>";
    reportConfigHtml += "                    </div>";
    reportConfigHtml += "                    <div v-else class='empty-state'>";
    reportConfigHtml += "                        <i class='fas fa-mouse-pointer'></i>";
    reportConfigHtml += "                        <h5>Nenhum Componente Selecionado</h5>";
    reportConfigHtml += "                        <p>Selecione um componente na área de design para ver as suas propriedades</p>";
    reportConfigHtml += "                    </div>";
    reportConfigHtml += "                </div>";
    reportConfigHtml += "            </div>";
    reportConfigHtml += "        </div>";
    reportConfigHtml += "    </div>";
    reportConfigHtml += "</div>";

    $("#campos > .row:last").after(reportConfigHtml);

}



function ReportObject(data) {
    var self = this;
    self.id = data.id || 'obj_' + Date.now();
    self.type = data.type;
    self.name = data.name;
    self.x = data.x || 0;
    self.y = data.y || 0;
    self.width = data.width || 200;
    self.height = data.height || 100;
    self.selected = data.selected || false;
    self.icon = data.icon;

    // Propriedades específicas por tipo
    if (self.type === 'text') {
        self.content = data.content || '';
        self.bold = data.bold || false;
        self.italic = data.italic || false;
        self.textColor = data.textColor || '#000000';
        self.backgroundColor = data.backgroundColor || '#ffffff';
    }

    if (self.type === 'table') {
        self.dataSource = data.dataSource || '';
        self.columns = data.columns || [];
        self.groupBy = data.groupBy || [];
        self.totals = data.totals || [];
    }
}

function ReportFilter(data) {
    var self = this;
    self.id = data.id || 'filter_' + Date.now();
    self.name = data.name || '';
    self.type = data.type || 'text';
    self.order = data.order || 0;
    self.size = data.size || 6;
    self.sqlExpression = data.sqlExpression || '';
    self.jsExpression = data.jsExpression || '';
    self.options = data.options || [];
}

function DataSource(data) {
    var self = this;
    self.id = data.id || 'ds_' + Date.now();
    self.name = data.name || '';
    self.type = data.type || 'query';
    self.query = data.query || '';
    self.testData = data.testData || [];
}

// Aplicação principal
var App = {
    // Estado da aplicação
    components: [
        { id: 1, name: 'Texto', type: 'text', icon: 'fas fa-font' },
        { id: 2, name: 'Tabela', type: 'table', icon: 'fas fa-table' },
        { id: 3, name: 'Imagem', type: 'image', icon: 'fas fa-image' },
        { id: 4, name: 'Gráfico', type: 'chart', icon: 'fas fa-chart-bar' },
        { id: 5, name: 'Cabeçalho', type: 'header', icon: 'fas fa-heading' },
        { id: 6, name: 'Rodapé', type: 'footer', icon: 'fas fa-ellipsis-h' }
    ],
    reportObjects: [],
    filters: [],
    dataSources: [
        {
            id: 'ds1',
            name: 'Dados de Faturação',
            type: 'query',
            query: 'SELECT * FROM faturas',
            testData: [
                { nomecliente: 'Cliente A', nocliente: 1001, valor: 1500.50, data: '2023-05-15', activo: true, morada: 'Rua A, 123' },
                { nomecliente: 'Cliente B', nocliente: 1002, valor: 2300.75, data: '2023-05-16', activo: true, morada: 'Rua B, 456' },
                { nomecliente: 'Cliente C', nocliente: 1003, valor: 800.25, data: '2023-05-17', activo: false, morada: 'Rua C, 789' }
            ]
        }
    ],
    selectedObject: null,
    dragging: false,
    dragObject: null,
    dragOffset: { x: 0, y: 0 },
    resizing: false,
    resizeObject: null,
    resizeStart: { x: 0, y: 0, width: 0, height: 0 },

    // Métodos
    startDrag: function (component, event) {
        var self = this;
        console.log("START DRAGGING", component, event);

        self.dragging = true;
        self.dragObject = new ReportObject({
            type: component.type,
            name: component.name,
            icon: component.icon
        });

        // Calcular posição inicial baseada na posição do mouse
        var canvas = document.getElementById('report-canvas');
        var rect = canvas.getBoundingClientRect();

        // Posicionar o objeto onde o mouse está, centralizando o objeto no cursor
        self.dragObject.x = event.clientX - rect.left - (self.dragObject.width / 2);
        self.dragObject.y = event.clientY - rect.top - (self.dragObject.height / 2);

        // Definir o offset como metade do tamanho do objeto para manter centrado
        self.dragOffset.x = self.dragObject.width / 2;
        self.dragOffset.y = self.dragObject.height / 2;

       // event.preventDefault();
    },

    drop: function (event) {
        var self = this;
        console.log("DROPPING", event);

        if (!self.dragging || !self.dragObject) return;

        // Calcular posição final do drop
        var canvas = document.getElementById('report-canvas');
        var rect = canvas.getBoundingClientRect();

        // Posição final onde o objeto será colocado
        self.dragObject.x = event.clientX - rect.left - (self.dragObject.width / 2);
        self.dragObject.y = event.clientY - rect.top - (self.dragObject.height / 2);

        // Limitar à área do canvas
        self.dragObject.x = Math.max(0, Math.min(self.dragObject.x, rect.width - self.dragObject.width));
        self.dragObject.y = Math.max(0, Math.min(self.dragObject.y, rect.height - self.dragObject.height));

        // Adicionar objeto ao canvas
        self.reportObjects.push(self.dragObject);
        self.selectObject(self.dragObject);

        // Limpar estado de drag
        self.dragging = false;
        self.dragObject = null;

        event.preventDefault();
    }
    ,

    handleDrag: function (event) {
        var self = this;
        if (!self.dragging || !self.dragObject) return;

        var canvas = document.getElementById('report-canvas');
        var rect = canvas.getBoundingClientRect();

        // Atualizar posição do objeto mantendo-o centrado no cursor
        self.dragObject.x = event.clientX - rect.left - self.dragOffset.x;
        self.dragObject.y = event.clientY - rect.top - self.dragOffset.y;

        // Limitar à área do canvas
        self.dragObject.x = Math.max(0, Math.min(self.dragObject.x, rect.width - self.dragObject.width));
        self.dragObject.y = Math.max(0, Math.min(self.dragObject.y, rect.height - self.dragObject.height));

        event.preventDefault();
    },

    stopDrag: function (event) {
        var self = this;
        if (!self.dragging) return;

        // Adicionar objeto ao canvas
        if (self.dragObject) {
            self.reportObjects.push(self.dragObject);
            self.selectObject(self.dragObject);
        }

        self.dragging = false;
        self.dragObject = null;

        event.preventDefault();
    },

    startResize: function (obj, event) {
        var self = this;
        self.resizing = true;
        self.resizeObject = obj;
        self.resizeStart.x = event.clientX;
        self.resizeStart.y = event.clientY;
        self.resizeStart.width = obj.width;
        self.resizeStart.height = obj.height;

        event.preventDefault();
        event.stopPropagation();
    },

    selectObject: function (obj) {
        var self = this;

        // Desselecionar todos os objetos
        self.reportObjects.forEach(function (o) {
            o.selected = false;
        });

        // Selecionar o objeto clicado
        obj.selected = true;
        self.selectedObject = obj;
    },

    deselectAll: function () {
        var self = this;
        self.reportObjects.forEach(function (obj) {
            obj.selected = false;
        });
        self.selectedObject = null;
    },

    removeObject: function (obj) {
        var self = this;
        var index = self.reportObjects.indexOf(obj);
        if (index !== -1) {
            self.reportObjects.splice(index, 1);
            self.selectedObject = null;
        }
    },

    addFilter: function () {
        var self = this;
        self.filters.push(new ReportFilter({}));
    },

    removeFilter: function (index) {
        var self = this;
        self.filters.splice(index, 1);
    },

    addDataSource: function () {
        var self = this;
        self.dataSources.push(new DataSource({}));
    },

    removeDataSource: function (index) {
        var self = this;
        self.dataSources.splice(index, 1);
    }
};




