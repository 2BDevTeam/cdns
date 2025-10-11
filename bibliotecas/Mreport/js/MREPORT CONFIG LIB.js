
var GMReportFilters = [new MReportFilter({})];
GMReportFilters = [];

var GMReportConfig = new MReportConfig({});

var GMReportObjects = [new MReportObject({})];
GMReportObjects = [];


var GMReportFontes = [new MReportFonte({})];
var GMReportFontes = [];


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




function addStyvaroReportDesigner() {

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

    reportConfigCss += "  .report-canvas-container {";
    reportConfigCss += "      border: 1px solid #dee2e6;";
    reportConfigCss += "      border-radius: 0.375rem;";
    reportConfigCss += "      background: #f8f9fa;";
    reportConfigCss += "      min-height: 800px;";
    reportConfigCss += "  }";

    reportConfigCss += "  .report-section {";
    reportConfigCss += "      border-bottom: 1px solid #dee2e6;";
    reportConfigCss += "      min-height: 150px;";
    reportConfigCss += "      position: relative;";
    reportConfigCss += "  }";

    reportConfigCss += "  .report-section:last-child {";
    reportConfigCss += "      border-bottom: none;";
    reportConfigCss += "  }";

    reportConfigCss += "  .section-label {";
    reportConfigCss += "      background: #e9ecef;";
    reportConfigCss += "      padding: 0.5rem 1rem;";
    reportConfigCss += "      font-weight: 600;";
    reportConfigCss += "      font-size: 0.875rem;";
    reportConfigCss += "      color: #495057;";
    reportConfigCss += "      border-bottom: 1px solid #dee2e6;";
    reportConfigCss += "  }";

    reportConfigCss += "  .section-content {";
    reportConfigCss += "      position: relative;";
    reportConfigCss += "      min-height: 120px;";
    reportConfigCss += "      padding: 1rem;";
    reportConfigCss += "      background: white;";
    reportConfigCss += "  }";

    reportConfigCss += "  .empty-section {";
    reportConfigCss += "      text-align: center;";
    reportConfigCss += "      color: #6c757d;";
    reportConfigCss += "      padding: 2rem;";
    reportConfigCss += "  }";

    reportConfigCss += "  .empty-section i {";
    reportConfigCss += "      font-size: 1.5rem;";
    reportConfigCss += "      margin-bottom: 0.5rem;";
    reportConfigCss += "      display: block;";
    reportConfigCss += "  }";

    reportConfigCss += "  .report-header .section-content {";
    reportConfigCss += "      background: #f8f9fa;";
    reportConfigCss += "      min-height: 100px;";
    reportConfigCss += "  }";

    reportConfigCss += "  .report-content .section-content {";
    reportConfigCss += "      background: white;";
    reportConfigCss += "      min-height: 500px;";
    reportConfigCss += "  }";
    reportConfigCss += "  .section-content {";
    reportConfigCss += "      position: relative;";
    reportConfigCss += "      min-height: 120px;";
    reportConfigCss += "      height: auto;";
    reportConfigCss += "      padding: 1rem;";
    reportConfigCss += "      background: white;";
    reportConfigCss += "      overflow: visible;";
    // Adicionar o padrão de grade
    reportConfigCss += "      background-image: ";
    reportConfigCss += "          radial-gradient(circle, #e0e6ed 1px, transparent 1px);";
    reportConfigCss += "      background-size: 20px 20px;";
    reportConfigCss += "      background-position: 0 0;";
    reportConfigCss += "  }";

    reportConfigCss += "  .report-header .section-content,";
    reportConfigCss += "  .report-footer .section-content {";
    reportConfigCss += "      background: #f8f9fa;";
    reportConfigCss += "      min-height: 100px;";

    reportConfigCss += "      background-size: 15px 15px;";
    reportConfigCss += "      background-position: 0 0;";
    reportConfigCss += "  }";

    // Estilo especial para a seção de conteúdo com grade mais visível
    reportConfigCss += "  .report-content .section-content {";
    reportConfigCss += "      background: white;";
    reportConfigCss += "      min-height: 500px;";
    reportConfigCss += "      background-image: ";
    reportConfigCss += "          linear-gradient(rgba(224, 230, 237, 0.4) 1px, transparent 1px),";
    reportConfigCss += "          linear-gradient(90deg, rgba(224, 230, 237, 0.4) 1px, transparent 1px),";
    reportConfigCss += "          radial-gradient(circle, rgba(59, 130, 246, 0.15) 1px, transparent 1px);";
    reportConfigCss += "      background-size: 20px 20px, 20px 20px, 100px 100px;";
    reportConfigCss += "      background-position: -1px -1px, -1px -1px, 0 0;";
    reportConfigCss += "  }";

    reportConfigCss += "  .report-footer .section-content {";
    reportConfigCss += "      background: #f8f9fa;";
    reportConfigCss += "      min-height: 100px;";
    reportConfigCss += "  }";

    reportConfigCss += "  .report-header .section-content,";
    reportConfigCss += "  .report-content .section-content,";
    reportConfigCss += "  .report-footer .section-content {";
    reportConfigCss += "      background: white;";
    reportConfigCss += "      background-image: ";
    reportConfigCss += "          linear-gradient(rgba(224, 230, 237, 0.4) 1px, transparent 1px),";
    reportConfigCss += "          linear-gradient(90deg, rgba(224, 230, 237, 0.4) 1px, transparent 1px),";
    reportConfigCss += "          radial-gradient(circle, rgba(59, 130, 246, 0.15) 1px, transparent 1px);";
    reportConfigCss += "      background-size: 20px 20px, 20px 20px, 100px 100px;";
    reportConfigCss += "      background-position: -1px -1px, -1px -1px, 0 0;";
    reportConfigCss += "  }";

    reportConfigCss += "  .report-object {";
    // reportConfigCss += "      position: absolute;";
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
    reportConfigCss += "      background-color: #ffffffff;";
    reportConfigCss += "      border: 1px solid #ffffffff;";
    reportConfigCss += "      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);";
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

    addStyvaroReportDesigner();
    generatemreportReportDesigner();

    // Configurar interact.js para drag and drop e redimensionamento
    var canvas = document.getElementById('report-canvas');


    // Aplicação principal
    var App = PetiteVue.reactive({
        // Estado da aplicação
        components: [
            { id: 1, name: 'Texto', type: 'text', icon: 'fas fa-font' },
            { id: 2, name: 'Tabela', type: 'table', icon: 'fas fa-table' },
            { id: 3, name: 'Imagem', type: 'image', icon: 'fas fa-image' },
            { id: 4, name: 'Gráfico', type: 'chart', icon: 'fas fa-chart-bar' },
            { id: 5, name: 'Cabeçalho', type: 'header', icon: 'fas fa-heading' },
            { id: 6, name: 'Rodapé', type: 'footer', icon: 'fas fa-ellipsis-h' }
        ],
        reportObjects: GMReportObjects,
        filters: GMReportFilters,
        dataSources: GMReportFontes,
        selectedObject: null,
        dragging: false,
        dragObject: null,
        dragOffset: { x: 0, y: 0 },
        resizing: false,
        resizeObject: null,
        resizeStart: { x: 0, y: 0, width: 0, height: 0 },
        getSectionObjects: function (section) {
            var self = this;
            return self.reportObjects.filter(function (obj) {
                return obj.section === section;
            });
        },
        startDrag: function (component, event) {
            var self = this;

            self.dragging = true;
            self.dragObject = new MReportObject({
                tipo: component.type,
                name: component.name,
                icon: component.icon,
                section: 'content' // Define uma secção padrão
            });

            // Calcular posição inicial baseada na posição do mouse
            // Usa a secção de conteúdo como referência padrão
            var contentSection = document.querySelector('.report-content .section-content');
            if (contentSection) {
                var rect = contentSection.getBoundingClientRect();

                // Posicionar o objeto onde o mouse está, centralizando o objeto no cursor
                self.dragObject.x = event.clientX - rect.left - (self.dragObject.width / 2);
                self.dragObject.y = event.clientY - rect.top - (self.dragObject.height / 2);

                // Definir o offset como metade do tamanho do objeto para manter centrado
                self.dragOffset.x = self.dragObject.width / 2;
                self.dragOffset.y = self.dragObject.height / 2;
            }

            // event.preventDefault();
        },

        handleDrag: function (event) {
            var self = this;
            if (!self.dragging || !self.dragObject) return;

            // Encontrar a secção atual baseada na posição do mouse
            var sections = document.querySelectorAll('.section-content');
            var targetSection = null;

            for (var i = 0; i < sections.length; i++) {
                var rect = sections[i].getBoundingClientRect();
                if (event.clientX >= rect.left && event.clientX <= rect.right &&
                    event.clientY >= rect.top && event.clientY <= rect.bottom) {
                    targetSection = sections[i];
                    break;
                }
            }

            // Se não encontrou nenhuma secção, usa a de conteúdo como padrão
            if (!targetSection) {
                targetSection = document.querySelector('.report-content .section-content');
            }

            if (targetSection) {
                var rect = targetSection.getBoundingClientRect();

                // Atualizar posição do objeto mantendo-o centrado no cursor
                self.dragObject.x = event.clientX - rect.left - self.dragOffset.x;
                self.dragObject.y = event.clientY - rect.top - self.dragOffset.y;

                // Limitar à área da secção
                self.dragObject.x = Math.max(0, Math.min(self.dragObject.x, rect.width - self.dragObject.width));
                self.dragObject.y = Math.max(0, Math.min(self.dragObject.y, rect.height - self.dragObject.height));

                // Atualizar a secção do objeto baseada na secção atual
                var sectionElement = targetSection.closest('.report-section');
                if (sectionElement) {
                    console.log("section element", self.dragObject.section, "dataset", sectionElement.dataset.section)
                    self.dragObject.section = sectionElement.dataset.section;

                }
            }

            event.preventDefault();
        },

        drop: function (event, section) {
            var self = this;


            if (!self.dragging || !self.dragObject) return;

            // Determinar a secção de destino
            var targetSection = section;
            if (!targetSection) {
                // Se não foi especificada, tenta determinar pela posição
                var sectionElement = event.target.closest('.report-section');
                if (sectionElement) {
                    targetSection = sectionElement.dataset.section;
                } else {
                    targetSection = 'content'; // Padrão
                }
            }

            // Encontrar o elemento da secção
            var sectionContent = document.querySelector('.report-' + targetSection + ' .section-content');
            if (!sectionContent) return;

            var rect = sectionContent.getBoundingClientRect();

            // Posição final onde o objeto será colocado (relativa à secção)
            self.dragObject.x = event.clientX - rect.left - (self.dragObject.width / 2);
            self.dragObject.y = event.clientY - rect.top - (self.dragObject.height / 2);

            // Limitar à área da secção
            self.dragObject.x = Math.max(0, Math.min(self.dragObject.x, rect.width - self.dragObject.width));
            self.dragObject.y = Math.max(0, Math.min(self.dragObject.y, rect.height - self.dragObject.height));

            // Definir a secção do objeto
            self.dragObject.section = targetSection;

            // Adicionar objeto ao canvas
            self.reportObjects.push(self.dragObject);
            self.selectObject(self.dragObject);

            // Limpar estado de drag
            self.dragging = false;
            self.dragObject = null;

            // Configurar interact para o novo objeto
            this.$nextTick(function () {
                interact('.report-object').unset();
                interact('.report-object')
                    .draggable({
                        inertia: true,
                        modifiers: [
                            interact.modifiers.restrictRect({
                                restriction: 'parent',
                                endOnly: true
                            })
                        ],
                        autoScroll: true,
                        listeners: {
                            start: function (event) {
                                var id = event.target.getAttribute('data-mreportobjectstamp');
                                var obj = self.reportObjects.find(function (o) {
                                    return o.mreportobjectstamp == id;
                                });
                                if (obj) {
                                    self.selectObject(obj);
                                }
                            },
                            // No método drop, dentro do $nextTick, atualize o move listener do interact:
                            move: function (event) {
                                var target = event.target;
                                var id = target.getAttribute('data-mreportobjectstamp');
                                var obj = self.reportObjects.find(function (o) {
                                    return o.mreportobjectstamp == id;
                                });

                                if (obj) {
                                    // Atualiza a posição no modelo
                                    obj.x += event.dx;
                                    obj.y += event.dy;

                                    // Detetar se mudou de secção
                                    var sectionContent = target.closest('.section-content');
                                    if (sectionContent) {
                                        var sectionElement = sectionContent.closest('.report-section')

                                        var sectionElement = sectionContent.closest('.report-section');
                                        if (sectionElement && sectionElement.dataset.section !== obj.section) {
                                            // Atualiza a secção se mudou para outra área
                                            obj.section = sectionElement.dataset.section;
                                        }
                                    }

                                    // Atualiza o transform para movimento suave
                                    target.style.transform = "translate3d(" + obj.x + "px, " + obj.y + "px, 0)";
                                }
                            }
                        }
                    })
                    .resizable({
                        edges: { left: true, right: true, bottom: true, top: true },
                        inertia: true,
                        modifiers: [
                            /* interact.modifiers.restrictEdges({
                                 outer: 'parent'
                             }),*/
                            interact.modifiers.restrictSize({
                                min: { width: 50, height: 30 }
                            })
                        ],
                        listeners: {
                            move: function (event) {
                                var target = event.target;
                                var id = target.getAttribute('data-mreportobjectstamp');
                                var obj = self.reportObjects.find(function (o) {
                                    return o.mreportobjectstamp == id;
                                });

                                if (obj) {
                                    // Atualiza tamanho no modelo
                                    obj.width = event.rect.width;
                                    obj.height = event.rect.height;

                                    // Atualiza posição se redimensionar da esquerda ou topo
                                    obj.x += event.deltaRect.left;
                                    obj.y += event.deltaRect.top;

                                    // Atualiza o estilo
                                    target.style.width = obj.width + 'px';
                                    target.style.height = obj.height + 'px';
                                    target.style.transform = "translate3d(" + obj.x + "px, " + obj.y + "px, 0)";
                                }
                            }
                        }
                    });
            });

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

            var newFilter = new MReportFilter({});
            newFilter.setUIFormConfig();
            self.filters.push(newFilter);
        },

        schemaToBeDefined: function (fonte) {
            var self = this;

            return fonte.schema.length == 0;
        },

        openConfigReportElement: function (obj, componente) {
            var self = this;

            this.$nextTick(function () {
                handleShowConfigContainer({
                    idValue: obj[obj.idfield],
                    localsource: obj.localsource,
                    idField: obj.idfield,
                    componente: componente
                });
            });


        },

        removeFilter: function (index) {
            var self = this;
            self.filters.splice(index, 1);
        },

        addDataSource: function () {
            var self = this;
            var newSource = new MReportFonte({});
            newSource.setUIFormConfig();
            self.dataSources.push(newSource);
        },

        removeDataSource: function (index) {
            var self = this;
            self.dataSources.splice(index, 1);
        }
    });
    window.reportDesignerState = App;

    // Inicializar petite-vue
    PetiteVue.createApp(App).mount('#reportDesignerContainer');

    // Adicionar evento global de mousemove para redimensionamento
    /*  document.addEventListener('mousemove', function (event) {
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
      });*/
    try {

    } catch (error) {

    }

}




function registerListeners() {

    try {


    } catch (error) {

    }
}


function handleCodeEditor() {
    var editors = [];
    document.querySelectorAll('.m-editor').forEach(function (el, idx) {
        // Garante um id único para cada editor
        if (!el.id) el.id = 'm-editor' + idx;
        var aceEditor = ace.edit(el.id);
        aceEditor.setTheme("ace/theme/monokai");
        aceEditor.session.setMode("ace/mode/sql");
        editors.push(aceEditor);
    });

    // Guarda o editor atualmente focado
    var focusedEditor = null;
    editors.forEach(function (ed) {
        ed.on('focus', function () {
            focusedEditor = ed;
        });
    });

    // Atalho: Ctrl + Shift + F para o editor focado
    document.addEventListener("keydown", function (e) {
        if (e.shiftKey && e.key.toLowerCase() === "f" && focusedEditor) {
            e.preventDefault();
            formatCode(focusedEditor);
        }
    });

    function formatCode(editorInstance) {
        return;
        var code = editorInstance.getValue();
        try {
            var formatted = prettier.format(code, {
                parser: "babel",
                plugins: [prettierPlugins.babel],
            });
            editorInstance.setValue(formatted, -1);
        } catch (err) {
            //alert("Erro ao formatar: " + err.message);
        }
    }

}

function getLocalSource(source) {
    var localsource = []
    localsource = eval(source)
    return localsource
}


function extractFiltersFromExpression(sqlExpression) {
    if (!sqlExpression) return [];

    var regexPattern = /\{([^}]+)\}/g; // Padrão para capturar texto dentro de {}
    var matches = [];
    var match;

    // Extrai todos os matches usando regex
    while ((match = regexPattern.exec(sqlExpression)) !== null) {
        var filterName = match[1].trim(); // Remove espaços em branco

        // Verifica se o filtro já não existe no array para evitar duplicatas
        if (matches.indexOf(filterName) === -1) {
            matches.push(filterName);
        }
    }

    return matches;
}

function generateDummyDataForSchema(columns, numRecords) {
    if (!numRecords) numRecords = 3;

    var randomString = function (len) {
        if (!len) len = 5;
        var text = "";
        for (var i = 0; i < len; i++) {
            text += String.fromCharCode(97 + Math.floor(Math.random() * 26));
        }
        return text;
    };

    var randomInt = function (min, max) {
        if (typeof min === "undefined") min = 0;
        if (typeof max === "undefined") max = 200;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    var randomDate = function () {
        var start = new Date(2000, 0, 1).getTime();
        var end = new Date(2025, 11, 31).getTime();
        var date = new Date(start + Math.random() * (end - start));
        return date.toISOString().split("T")[0] + " " + date.toTimeString().split(" ")[0];
    };

    var getValueByType = function (type) {
        var t = type.toLowerCase();
        if (t.indexOf("char") !== -1) return randomString(randomInt(3, 10));
        if (t.indexOf("numeric") !== -1 || t.indexOf("int") !== -1) return randomInt();
        if (t.indexOf("bit") !== -1) return true;
        if (t.indexOf("date") !== -1) return randomDate();
        if (t.indexOf("text") !== -1) return "lorem ipsum " + randomString(10);
        return null;
    };

    var records = [];
    for (var i = 0; i < numRecords; i++) {
        var record = {};
        for (var j = 0; j < columns.length; j++) {
            var col = columns[j];
            record[col.name] = getValueByType(col.system_type_name);
        }
        records.push(record);
    }

    return records;
}


function handleShowConfigContainer(data) {

    var idValue = data.idValue || "";
    var localsource = data.localsource || "";
    var idField = data.idField || "";
    var componente = data.componente || "";

    var localSourceRes = getLocalSource(localsource);

    var mreportConfigItem = localSourceRes.find(function (obj) {
        return obj[idField] == idValue;
    });


    var objectsUIFormConfig = [new UIObjectFormConfig({})]
    if (mreportConfigItem) {

        objectsUIFormConfig = mreportConfigItem.objectsUIFormConfig;

        var sufixoForm = localsource;
        var containerId = "Container" + localsource;

        var sourceData = {
            sourceTable: localsource,
            sourceKey: localsource
        }

        // console.log("sourceData", sourceData)
        var containers = [];

        objectsUIFormConfig.forEach(function (obj) {

            var isDiv = obj.contentType === "div";
            var customData = obj.customData + "  @change='handleChangeComponent'  v-model='mreportConfigItem." + obj.campo + "'";
            if (isDiv) {
                //console.log("Div detected for campo: " + obj.campo);
                customData += " v-on:keyup='changeDivContent(\"" + obj.campo + "\")'";
            }

            containers.push({
                colSize: obj.colSize,
                style: "margin-bottom:0.5em; " + (obj.tipo == "checkbox" ? "display:flex;flex-direction:column" : ""),
                content: {
                    contentType: obj.contentType,
                    type: obj.tipo,
                    id: obj.campo,
                    classes: obj.classes + " mreportconfig-item-input",
                    customData: customData,
                    style: obj.style,
                    selectCustomData: obj.customData + " v-model='mreportConfigItem." + obj.campo + "'",
                    fieldToOption: obj.fieldToOption,
                    fieldToValue: obj.fieldToValue,
                    rows: obj.rows || 10,
                    cols: obj.cols || 10,
                    label: obj.titulo,
                    selectData: obj.selectValues,
                    value: mreportConfigItem[obj.campo],
                    event: "",
                    placeholder: "",

                }
            })


        })


        $("#modalMReportConfigItem").remove()
        var containerData = {
            containerId: containerId,
            spinnerId: "overlay" + sufixoForm,
            hasSpinner: false,
            customData: "",
            sourceData: sourceData,
            items: containers
        }
        var formContainerResult = GenerateCustomFormContainer(containerData);

        var modalBodyHtml = ""
        modalBodyHtml += formContainerResult;

        var modalMReportConfigItem = {
            title: "Configuração ",
            id: "modalMReportConfigItem",
            customData: "",
            otherclassess: "",
            body: modalBodyHtml,
            footerContent: "",
        };
        var modalHTML = generateModalHTML(modalMReportConfigItem);

        $("#maincontent").append(modalHTML);

        $("#modalMReportConfigItem").modal("show");
        $("#modalMReportConfigItem .modal-dialog").css("width", "90%")
        PetiteVue.createApp({
            mreportConfigItem: mreportConfigItem,
            localsource: localsource,
            filterValues: {},
            mainQueryHasError: false,
            queryJsonResult: "",
            executarExpressaoDbListagem: function () {
                var self = this;
                console.log("executarExpressaoDbListagem", self.mreportConfigItem.expressaolistagem, self.filterValues)
                $.ajax({
                    type: "POST",
                    url: "../programs/gensel.aspx?cscript=executeexpressaolistagemdb",

                    data: {
                        '__EVENTARGUMENT': JSON.stringify([{ expressaodblistagem: self.mreportConfigItem.expressaolistagem, filters: self.filterValues }]),
                    },
                    success: function (response) {

                        var errorMessage = "ao trazer resultados da listagem . consulte no console do browser"
                        try {

                            //console.log(response)
                            if (response.cod != "0000") {

                                console.log("Erro " + errorMessage, response)
                                alertify.error("Erro " + errorMessage, 9000);
                                self.mainQueryError = JSON.stringify(response, null, 2);;
                                self.mainQueryHasError = true;
                                return false
                            }
                            var queryResult = response.data.length > 0 ? response.data : generateDummyDataForSchema(response.schema, 3);

                            var lastResults = queryResult.slice(0, 20);

                            self.mreportConfigItem.schema = response.schema;
                            self.mreportConfigItem.lastResults = lastResults;
                            self.mreportConfigItem.stringifyJSONFields();


                            self.queryJsonResult = JSON.stringify(queryResult).replaceAll("total", "tot");
                            self.mainQueryHasError = false;
                            //realTimeComponentSync(self.containerItem, self.containerItem.table, self.containerItem.idfield);
                            alertify.success("Query executada com sucesso", 5000);
                        } catch (error) {
                            console.log("Erro interno " + errorMessage, error)
                            alertify.error("Erro " + errorMessage, 9000);
                            self.mainQueryError = "Erro interno " + errorMessage;
                            self.mainQueryHasError = true;
                            //alertify.error("Erro interno " + errorMessage, 10000)
                        }

                        //  javascript:__doPostBack('','')
                    }
                })

            },
            abrirQueryJsonResult: function () {

                $("#queryJsonResultModal").remove()
                var formattedJson = JSON.stringify(JSON.parse(this.queryJsonResult), null, 2);
                var modalHtmlBody = "<pre id='queryJsonResultModalBody' style='background: #f8f9fa; padding: 15px; border-radius: 5px; max-height: 400px; overflow-y: auto;'>" + formattedJson + "</pre>"
                var modalData = {
                    title: "Resultado JSON",
                    id: "queryJsonResultModal",
                    customData: "",
                    otherclassess: "",
                    body: modalHtmlBody,
                    footerContent: ""
                };

                var modalHTML = generateModalHTML(modalData);
                $("#mainPage").append(modalHTML);
                $("#queryJsonResultModal").modal("show");
            },
            abrirErroResult: function () {

                $("#queryErrorResultModal").remove();
                var formattedJson = this.mainQueryError
                var modalHtmlBody = "<pre id='queryErrorResultModalBody' style='background: #f8f9fa; padding: 15px; border-radius: 5px; max-height: 400px; overflow-y: auto;'>" + formattedJson + "</pre>"
                var modalData = {
                    title: "Erro na query",
                    id: "queryErrorResultModal",
                    customData: "",
                    otherclassess: "",
                    body: modalHtmlBody,
                    footerContent: ""
                };
                var modalHTML = generateModalHTML(modalData);
                $("#mainPage").append(modalHTML);
                $("#queryErrorResultModal").modal("show");
            },
            getFilterByExpressaoDb: function () {
                var expressaoDb = this.mreportConfigItem.expressaolistagem;
                if (!expressaoDb) return [];

                var filterCodes = extractFiltersFromExpression(expressaoDb);
                var matchedFilters = [];

                var lastUsedFiltersLocaStorage = localStorage.getItem("lastUsedFilters");
                lastUserFilters = {}
                try {

                    if (lastUsedFiltersLocaStorage) {

                        lastUserFilters = JSON.parse(lastUsedFiltersLocaStorage);
                    }
                } catch (error) {

                }

                this.filterValues = lastUserFilters||{}


                filterCodes.forEach(function (filterCode) {
                    var filter = GMReportFilters.find(function (f) {
                        return f.codigo === filterCode;
                    });

                    if (filter) {
                        matchedFilters.push(filter);
                    }
                });
                return matchedFilters;
            },
            updateFilter: function (filter, event) {


                localStorage.setItem("lastUsedFilters", JSON.stringify(this.filterValues));
            },

            changeExpressaoDbListagemAndHandleFilters: function () {
                var self = this;
                var value = $("#expressaolistagem").text();

                var filterCodes = extractFiltersFromExpression(value);

                var lastUsedFiltersLocaStorage = localStorage.getItem("lastUsedFilters");
                lastUserFilters = {}
                try {

                    if (lastUsedFiltersLocaStorage) {

                        lastUserFilters = JSON.parse(lastUsedFiltersLocaStorage);
                    }
                } catch (error) {

                }


                var matchedFilters = [];
                filterCodes.forEach(function (filterCode) {
                    var filter = GMReportFilters.find(function (f) {
                        return f.codigo === filterCode;
                    });

                    if (filter) {
                        self.filterValues[filter.codigo] = lastUserFilters[filter.codigo] || "";
                    }
                });

                var editor = ace.edit("expressaolistagem");


                self.mreportConfigItem.expressaolistagem = editor.getValue();


            },
            handleChangeComponent: function () {

                //realTimeComponentSync(this.mreportConfigItem, this.mreportConfigItem.table, this.mreportConfigItem.idfield);
            },
            changeDivContent: function (e) {

                var divElement = $("#" + e);

                if (divElement.length === 0) {
                    console.warn('Elemento não encontrado:', e);
                    return;
                }
                var hasFormElements = divElement.find('button, input, textarea, select').length > 0;

                if (hasFormElements) {

                    return;
                }
                var editor = ace.edit(e);
                this.mreportConfigItem[e] = editor.getValue();
                //realTimeComponentSync(this.mreportConfigItem, this.mreportConfigItem.table, this.mreportConfigItem.idfield);

            }
        }).mount('#maincontent');

        handleCodeEditor();
    }

}




function generatemreportReportDesigner() {
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
    reportConfigHtml += "                                <span class='fw-bold'>{{ filter.descricao || 'Novo Filtro' }}</span>";
    reportConfigHtml += "                                <button type='button' class='btn btn-sm btn-outline-danger' @click='openConfigReportElement(filter,\"Filtro\")'>";

    reportConfigHtml += "                                    <span class='glyphicon glyphicon-cog'></span>";
    reportConfigHtml += "                                </button>";
    reportConfigHtml += "                                <button type='button' class='btn btn-sm btn-outline-danger' @click='removeFilter(index)'>";
    reportConfigHtml += "                                    <span class='glyphicon glyphicon glyphicon-trash' ></span>";
    reportConfigHtml += "                                </button>";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                            <div class='mb-2'>";
    reportConfigHtml += "                                <label class='m-report-form-label'>Ordem</label>";
    reportConfigHtml += "                                <input type='number' class='form-control form-control-sm' v-model='filter.ordem'>";
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
    reportConfigHtml += "                                <span class='fw-bold'>{{ source.descricao || 'Nova Fonte' }}</span>";
    reportConfigHtml += "                                <button type='button' class='btn btn-sm btn-outline-danger' @click='openConfigReportElement(source,\"Fonte\")'>";

    reportConfigHtml += "                                    <span class='glyphicon glyphicon-cog'></span>";
    reportConfigHtml += "                                </button>"
    reportConfigHtml += "                                <button type='button' class='btn btn-sm btn-outline-danger' @click='removeDataSource(index)'>";
    reportConfigHtml += "                                    <i class='fas fa-times'></i>";
    reportConfigHtml += "                                </button>";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                            <div v-if='source.schema.length==0'  class='mb-2'>";
    reportConfigHtml += "                     <div class='alert alert-info' role='alert' style='margin-top:1em;'>Atenção!Para usar esta fonte de dados deve definir o schema. </div> ";
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

    reportConfigHtml += "                    <div class='report-canvas-container'>";
    reportConfigHtml += "                        <div class='report-section report-header' data-section='header'>";
    reportConfigHtml += "                            <div class='section-label'>";
    reportConfigHtml += "                                <i class='fas fa-heading me-1'></i> Cabeçalho";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                            <div class='section-content' @dragover.prevent @drop='drop($event, \"header\")' @click='deselectAll'>";
    reportConfigHtml += "                                <div class='report-object' v-for='obj in getSectionObjects(\"header\")' :key='obj.mreportobjectstamp' :data-mreportobjectstamp='obj.mreportobjectstamp' :style='{ transform: \"translate3d(\" + obj.x + \"px, \" + obj.y + \"px, 0)\", width: obj.width + \"px\", height: obj.height + \"px\", zIndex: obj.selected ? 100 : 10 }' :class='{ selected: obj.selected }' @click.stop='selectObject(obj)'>";
    reportConfigHtml += "                                    <div class='object-handle'>";
    reportConfigHtml += "                                        <i :class='obj.icon' class='me-1'></i>{{ obj.name }}";
    reportConfigHtml += "                                    </div>";
    reportConfigHtml += "                                    <div class='object-content' v-if='obj.type === \"text\"'>{{ obj.content || 'Texto de exemplo' }}</div>";
    reportConfigHtml += "                                    <div class='object-content' v-if='obj.type === \"table\"'>";
    reportConfigHtml += "                                        <div class='table-responsive'>";
    reportConfigHtml += "                                            <table class='table table-sm table-bordered'>";
    reportConfigHtml += "                                                <thead><tr><th v-for='col in 3' :key='col'>Coluna {{ col }}</th></tr></thead>";
    reportConfigHtml += "                                                <tbody><tr v-for='row in 3' :key='row'><td v-for='col in 3' :key='col'>Dado {{ row }}-{{ col }}</td></tr></tbody>";
    reportConfigHtml += "                                            </table>";
    reportConfigHtml += "                                        </div>";
    reportConfigHtml += "                                    </div>";
    reportConfigHtml += "                                    <div class='resize-handle' @mousedown.stop='startResize(obj, $event)'></div>";
    reportConfigHtml += "                                </div>";
    reportConfigHtml += "                                <div v-if='getSectionObjects(\"header\").length === 0' class='empty-section'>";
    reportConfigHtml += "                                    <i class='fas fa-arrow-down'></i>";
    reportConfigHtml += "                                    <p>Arraste componentes para o cabeçalho</p>";
    reportConfigHtml += "                                </div>";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                        </div>";

    reportConfigHtml += "                        <div class='report-section report-content' data-section='content'>";
    reportConfigHtml += "                            <div class='section-label'>";
    reportConfigHtml += "                                <i class='fas fa-file-alt me-1'></i> Conteúdo";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                            <div class='section-content' @dragover.prevent @drop='drop($event, \"content\")' @click='deselectAll'>";
    reportConfigHtml += "                                <div class='report-object' v-for='obj in getSectionObjects(\"content\")' :key='obj.mreportobjectstamp' :data-mreportobjectstamp='obj.mreportobjectstamp' :style='{ transform: \"translate3d(\" + obj.x + \"px, \" + obj.y + \"px, 0)\", width: obj.width + \"px\", height: obj.height + \"px\", zIndex: obj.selected ? 100 : 10 }' :class='{ selected: obj.selected }' @click.stop='selectObject(obj)'>";
    reportConfigHtml += "                                    <div class='object-handle'>";
    reportConfigHtml += "                                        <i :class='obj.icon' class='me-1'></i>{{ obj.name }}";
    reportConfigHtml += "                                    </div>";
    reportConfigHtml += "                                    <div class='object-content' v-if='obj.type === \"text\"'>{{ obj.content || 'Texto de exemplo' }}</div>";
    reportConfigHtml += "                                    <div class='object-content' v-if='obj.type === \"table\"'>";
    reportConfigHtml += "                                        <div class='table-responsive'>";
    reportConfigHtml += "                                            <table class='table table-sm table-bordered'>";
    reportConfigHtml += "                                                <thead><tr><th v-for='col in 3' :key='col'>Coluna {{ col }}</th></tr></thead>";
    reportConfigHtml += "                                                <tbody><tr v-for='row in 3' :key='row'><td v-for='col in 3' :key='col'>Dado {{ row }}-{{ col }}</td></tr></tbody>";
    reportConfigHtml += "                                            </table>";
    reportConfigHtml += "                                        </div>";
    reportConfigHtml += "                                    </div>";
    reportConfigHtml += "                                    <div class='resize-handle' @mousedown.stop='startResize(obj, $event)'></div>";
    reportConfigHtml += "                                </div>";
    reportConfigHtml += "                                <div v-if='getSectionObjects(\"content\").length === 0' class='empty-section'>";
    reportConfigHtml += "                                    <i class='fas fa-arrow-down'></i>";
    reportConfigHtml += "                                    <p>Arraste componentes para o conteúdo</p>";
    reportConfigHtml += "                                </div>";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                        </div>";

    reportConfigHtml += "                        <div class='report-section report-footer' data-section='footer'>";
    reportConfigHtml += "                            <div class='section-label'>";
    reportConfigHtml += "                                <i class='fas fa-ellipsis-h me-1'></i> Rodapé";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                            <div class='section-content' @dragover.prevent @drop='drop($event, \"footer\")' @click='deselectAll'>";
    reportConfigHtml += "                                <div class='report-object' v-for='obj in getSectionObjects(\"footer\")' :key='obj.mreportobjectstamp' :data-mreportobjectstamp='obj.mreportobjectstamp' :style='{ transform: \"translate3d(\" + obj.x + \"px, \" + obj.y + \"px, 0)\", width: obj.width + \"px\", height: obj.height + \"px\", zIndex: obj.selected ? 100 : 10 }' :class='{ selected: obj.selected }' @click.stop='selectObject(obj)'>";
    reportConfigHtml += "                                    <div class='object-handle'>";
    reportConfigHtml += "                                        <i :class='obj.icon' class='me-1'></i>{{ obj.name }}";
    reportConfigHtml += "                                    </div>";
    reportConfigHtml += "                                    <div class='object-content' v-if='obj.type === \"text\"'>{{ obj.content || 'Texto de exemplo' }}</div>";
    reportConfigHtml += "                                    <div class='object-content' v-if='obj.type === \"table\"'>";
    reportConfigHtml += "                                        <div class='table-responsive'>";
    reportConfigHtml += "                                            <table class='table table-sm table-bordered'>";
    reportConfigHtml += "                                                <thead><tr><th v-for='col in 3' :key='col'>Coluna {{ col }}</th></tr></thead>";
    reportConfigHtml += "                                                <tbody><tr v-for='row in 3' :key='row'><td v-for='col in 3' :key='col'>Dado {{ row }}-{{ col }}</td></tr></tbody>";
    reportConfigHtml += "                                            </table>";
    reportConfigHtml += "                                        </div>";
    reportConfigHtml += "                                    </div>";
    reportConfigHtml += "                                    <div class='resize-handle' @mousedown.stop='startResize(obj, $event)'></div>";
    reportConfigHtml += "                                </div>";
    reportConfigHtml += "                                <div v-if='getSectionObjects(\"footer\").length === 0' class='empty-section'>";
    reportConfigHtml += "                                    <i class='fas fa-arrow-down'></i>";
    reportConfigHtml += "                                    <p>Arraste componentes para o rodapé</p>";
    reportConfigHtml += "                                </div>";
    reportConfigHtml += "                            </div>";
    reportConfigHtml += "                        </div>";
    reportConfigHtml += "                    </div>";
    reportConfigHtml += "                </div>";
    reportConfigHtml += "            </div>";
    reportConfigHtml += "            <div class='col-md-3'>";
    reportConfigHtml += "                <div class='properties-panel'>";
    reportConfigHtml += "                    <h5 class='section-title'><i class='fas fa-sliders-h me-2'></i> Propriedades</h5>";
    reportConfigHtml += "                    <div v-if='selectedObject'>";
    reportConfigHtml += "                        <div class='mb-3'><label class='m-report-form-label'>Nome</label><input type='text' class='form-control' v-model='selectedObject.name'></div>";
    reportConfigHtml += "                        <div class='mb-3'><label class='m-report-form-label'>Secção</label>";
    reportConfigHtml += "                            <select class='form-select' v-model='selectedObject.section'>";
    reportConfigHtml += "                                <option value='header'>Cabeçalho</option>";
    reportConfigHtml += "                                <option value='content'>Conteúdo</option>";
    reportConfigHtml += "                                <option value='footer'>Rodapé</option>";
    reportConfigHtml += "                            </select>";
    reportConfigHtml += "                        </div>";
    reportConfigHtml += "                        <div class='mb-3' v-if='selectedObject.type === \"text\"'>";
    reportConfigHtml += "                            <label class='m-report-form-label'>Conteúdo</label>";
    reportConfigHtml += "                            <textarea class='form-control' rows='3' v-model='selectedObject.content'></textarea>";
    reportConfigHtml += "                            <div class='form-text'>Use {{ campo }} para inserir valores de campos de dados</div>";
    reportConfigHtml += "                        </div>";
    reportConfigHtml += "                        <div class='mb-3' v-if='selectedObject.type === \"table\"'>";
    reportConfigHtml += "                            <label class='m-report-form-label'>Fonte de Dados</label>";
    reportConfigHtml += "                            <select class='form-select' v-model='selectedObject.dataSource'>";
    reportConfigHtml += "                                <option v-for='source in dataSources' :key='source.mreportfonstestamp' :value='source.mreportfonstestamp'>{{ source.name }}</option>";
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



function UIObjectFormConfig(data) {

    this.campo = data.campo || "";
    this.tipo = data.tipo || "";
    this.titulo = data.titulo || "";
    this.classes = data.classes || "";
    this.customData = data.customData || "";
    this.style = data.style || "";
    this.selectValues = data.selectValues || [];
    this.colSize = data.colSize || "4";
    this.fieldToOption = data.fieldToOption || "";
    this.fieldToValue = data.fieldToValue || "";
    this.contentType = data.contentType || "input";

}




function MReportConfig(data) {

    this.orientation = data.orientation || 'portrait'; // portrait ou landscape
    this.pagesize = data.pagesize || 'A4'; // A4, A3, Letter, etc.
    this.margins = data.margins || { top: 20, right: 20, bottom: 20, left: 20 };
    this.sections = Array.isArray(data.sections) ? data.sections.map(function (s) {
        return new ReportSection(s);
    }) : [
        new ReportSection({ type: 'header', height: 100, width: 800, name: "Cabeçalho" }),
        new ReportSection({ type: 'content', height: 400, width: 800, name: "Conteúdo" }),
        new ReportSection({ type: 'footer', height: 50, width: 800, name: "Rodapé" })
    ];
}


MReportConfig.prototype.toJSONString = function () {

    return JSON.stringify(this);
}

function ReportSection(data) {

    this.type = data.type || 'header'; // header, content, footer
    this.name = data.name || "Cabeçalho";
    this.height = data.height || 100; // altura da secção em pixels
    this.width = data.width || 800; // largura da secção em pixels
}






function MReportObject(data) {
    var self = this;

    // Propriedades baseadas na estrutura da tabela
    this.mreportobjectstamp = data.mreportobjectstamp || generateUUID();
    this.mreportcontaineritemstamp = data.mreportcontaineritemstamp || '';
    this.codigo = data.codigo || '';
    this.tipo = data.tipo || 'text'; // text, table, image, chart, header, footer
    this.tamanho = data.tamanho || 6; // Tamanho no grid (1-12)
    this.ordem = data.ordem || 0;
    this.categoria = data.categoria || 'basic'; // basic, advanced, custom
    this.expressaoobjecto = data.expressaoobjecto || '';
    this.configjson = data.configjson || '{}';
    this.queryconfigjson = data.queryconfigjson || '{}';
    this.section = data.section || 'content'; // header, content, footer
    this.x = data.x || 0;
    this.y = data.y || 0;
    this.width = data.width || 200;
    this.height = data.height || 100;

    // Propriedades adicionais para funcionalidade (não na BD)

    this.name = data.name || 'Novo Objeto';
    this.icon = data.icon || 'fas fa-question';
    this.content = data.content || '';
    this.selected = data.selected || false;
    //this.resizing = data.resizing || false;


    this.dataSource = data.dataSource || null;
    this.bold = data.bold || false;
    this.italic = data.italic || false;
    this.textColor = data.textColor || '#000000';
    this.backgroundColor = data.backgroundColor || '#ffffff';
    this.config = {};
    this.queryConfig = {};

    // Parse dos JSONs se forem strings
    this.config = forceJSONParse(this.configjson, {});
    this.queryConfig = forceJSONParse(this.queryconfigjson, {});

}




function MReportFilter(data) {

    var self = this;

    var maxOrdem = 0;
    if (Array.isArray(GMReportFilters) && GMReportFilters.length > 0) {
        maxOrdem = GMReportFilters.reduce(function (max, item) {
            return Math.max(max, item.ordem || 0);
        }, 0);
    }
    this.mreportfilterstamp = data.mreportfilterstamp || generateUUID();
    this.mreportstamp = data.mreportstamp || '';
    this.codigo = data.codigo || 'Filtro' + generateUUID();
    this.descricao = data.descricao || 'Novo Filtro ' + (data.ordem || (maxOrdem + 1));
    this.tipo = data.tipo || 'text'; // text, number, checkbox, list, etc.
    this.campooption = data.campooption || '';
    this.eventochange = data.eventochange || false; // BIT -> boolean
    this.expressaochange = data.expressaochange || '';
    this.campovalor = data.campovalor || '';
    this.tamanho = data.tamanho || 6; // Tamanho padrão (1-12 para grid system)
    this.expressaolistagem = data.expressaolistagem || '';
    this.expressaojslistagem = data.expressaojslistagem || '';
    this.valordefeito = data.valordefeito || '';
    this.ordem = data.ordem || (maxOrdem + 1);



    this.objectsUIFormConfig = data.objectsUIFormConfig || [];
    this.localsource = data.localsource || "";
    this.idfield = data.idfield || "mreportfilterstamp";
    this.table = "MReportFilter";


}


MReportFilter.prototype.setUIFormConfig = function () {

    var UIFormConfig = getmreportFilterUIObjectFormConfigAndSourceValues();
    this.objectsUIFormConfig = UIFormConfig.objectsUIFormConfig;
    this.localsource = UIFormConfig.localsource;
    this.idfield = UIFormConfig.idField;

}

function getmreportFilterUIObjectFormConfigAndSourceValues() {
    var objectsUIFormConfig = [
        new UIObjectFormConfig({ colSize: 4, campo: "codigo", tipo: "text", titulo: "Código", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "descricao", tipo: "text", titulo: "Descrição", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "ordem", tipo: "digit", titulo: "Ordem", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({
            colSize: 12,
            campo: "tipo",
            tipo: "select",
            titulo: "Tipo",
            fieldToOption: "option",
            contentType: "select",
            fieldToValue: "value",
            classes: "form-control input-source-form  input-sm ",
            selectValues: [
                { option: "Texto", value: "text" },
                { option: "Radio", value: "radio" },
                { option: "Lógico", value: "logic" },
                { option: "Data", value: "date" },
                { option: "Número", value: "number" },
                { option: "Lista", value: "list" },
                { option: "Multipla escolha", value: "multiselect" }
            ]
        }),

        new UIObjectFormConfig({ colSize: 6, campo: "campooption", tipo: "text", titulo: "Campo de Opção", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "campovalor", tipo: "text", titulo: "Campo de Valor", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "tamanho", tipo: "digit", titulo: "Tamanho", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaolistagem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de Listagem", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaojslistagem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de Listagem JS", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "valordefeito", tipo: "div", cols: 90, rows: 90, titulo: "Valor por Defeito", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 4, campo: "eventochange", tipo: "checkbox", titulo: "Tem evento change", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaochange", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de Change", classes: "input-source-form m-editor", contentType: "div" }),
    ];

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMReportFilters", idField: "mreportfilterstamp" };
}



function generateFilterVariablesParaFonteHTML() {
    var filterVariablesHTML = "";

    filterVariablesHTML += "<div style='display:flex;flex-direction:row;flex-wrap:wrap;' v-for=\"filter in getFilterByExpressaoDb()\" :key=\"filter.mreportfilterstamp\" class=\"\">";
    filterVariablesHTML += "    <label class=\"m-report-filter-item\" :for=\"filter.codigo\">{{ filter.descricao }}</label>";
    filterVariablesHTML += "    <!-- text -->";
    filterVariablesHTML += "    <input @change=\"updateFilter(filter,$event)\" v-if=\"filter.tipo === 'text'\" type=\"text\"";
    filterVariablesHTML += "        class=\"form-control input-sm input-mreport-filter\" :id=\"filter.codigo\"";
    filterVariablesHTML += "        v-model=\"filterValues[filter.codigo]\" />";
    filterVariablesHTML += "";
    filterVariablesHTML += "    <!-- digit -->";
    filterVariablesHTML += "    <input @change=\"updateFilter(filter,$event)\" v-else-if=\"filter.tipo === 'digit'\" type=\"text\"";
    filterVariablesHTML += "        class=\"form-control input-sm input-mreport-filter\" :id=\"filter.codigo\"";
    filterVariablesHTML += "        v-model=\"filterValues[filter.codigo]\" />";
    filterVariablesHTML += "";
    filterVariablesHTML += "    <!-- logic -->";
    filterVariablesHTML += "    <input @change=\"updateFilter(filter,$event)\" v-else-if=\"filter.tipo === 'logic'\" type=\"checkbox\"";
    filterVariablesHTML += "        class=\"form-check-input\" :id=\"filter.codigo\" v-model=\"filterValues[filter.codigo]\" />";
    filterVariablesHTML += "";
    filterVariablesHTML += "    <!-- fallback -->";
    filterVariablesHTML += "    <input @change=\"updateFilter(filter,$event)\" v-else type=\"text\" class=\"form-control input-sm input-mreport-filter\"";
    filterVariablesHTML += "        :id=\"filter.codigo\" v-model=\"filterValues[filter.codigo]\" />";
    filterVariablesHTML += "</div>";

    return filterVariablesHTML;
}



function generateQueryButtonOptions() {

    var schemaQueryEditorContainerHtml = "";

    schemaQueryEditorContainerHtml += "<div class='row' style='margin-top: 1em;'>";

    // Botão Executar Expressão DB
    schemaQueryEditorContainerHtml += "<div class='col-md-1' style='margin-bottom:0.5em;'>";
    schemaQueryEditorContainerHtml += "<button type='button' id='executarexpressaodblistagem' ";
    schemaQueryEditorContainerHtml += "class='pull-left btn btn-primary btn-sm' ";
    schemaQueryEditorContainerHtml += "v-on:click='executarExpressaoDbListagem()' ";
    schemaQueryEditorContainerHtml += "style='margin-top:0.4em;'>";
    schemaQueryEditorContainerHtml += "<span class='glyphicon glyphicon-play'></span>";
    schemaQueryEditorContainerHtml += "</button>";
    schemaQueryEditorContainerHtml += "</div>";

    // Botão Query JSON Result
    schemaQueryEditorContainerHtml += "<div class='col-md-1' style='margin-bottom:0.5em;'>";
    schemaQueryEditorContainerHtml += "<button type='button' id='queryjsonresultbtn' ";
    schemaQueryEditorContainerHtml += "class='pull-left btn btn-default btn-sm' ";
    schemaQueryEditorContainerHtml += "v-if='queryJsonResult && mainQueryHasError==false' ";
    schemaQueryEditorContainerHtml += "v-on:click='abrirQueryJsonResult()' ";
    schemaQueryEditorContainerHtml += "style='margin-top:0.4em;margin-left:-4em;'>";
    schemaQueryEditorContainerHtml += "<span class='glyphicon glyphicon-th-list'></span>";
    schemaQueryEditorContainerHtml += "</button>";
    schemaQueryEditorContainerHtml += "</div>";

    // Botão Export JSON Result (Error)
    schemaQueryEditorContainerHtml += "<div class='col-md-1' style='margin-bottom:0.5em;'>";
    schemaQueryEditorContainerHtml += "<button type='button' id='exportjsonresultbtn' ";
    schemaQueryEditorContainerHtml += "class='pull-left btn btn-warning btn-sm' ";
    schemaQueryEditorContainerHtml += "v-if='mainQueryHasError' ";
    schemaQueryEditorContainerHtml += "v-on:click='abrirErroResult()' ";
    schemaQueryEditorContainerHtml += "style='margin-top:0.4em;background: #dc3545!important;color:white;margin-left:-8em;'>";
    schemaQueryEditorContainerHtml += "<span class='glyphicon glyphicon-info-sign'></span>";
    schemaQueryEditorContainerHtml += "</button>";
    schemaQueryEditorContainerHtml += "</div>";

    // Fechar linha dos botões
    schemaQueryEditorContainerHtml += "</div>";
    return schemaQueryEditorContainerHtml;

}



function MReportFonte(data) {
    var self = this;

    var maxOrdem = 0;
    if (Array.isArray(GMReportFontes) && GMReportFontes.length > 0) {
        maxOrdem = GMReportFontes.reduce(function (max, item) {
            return Math.max(max, item.ordem || 0);
        }, 0);
    }
    // Propriedades baseadas na estrutura da tabela
    this.mreportfonstestamp = data.mreportfonstestamp || generateUUID();
    this.mreportstamp = data.mreportstamp || '';
    this.codigo = data.codigo || "Fonte-" + generateUUID();
    this.descricao = data.descricao || 'Nova Fonte ' + (data.ordem || (maxOrdem + 1));
    this.tipo = data.tipo || 'query'; // query, api, json, csv, etc.
    this.expressaolistagem = data.expressaolistagem || '';
    this.expressaojslistagem = data.expressaojslistagem || '';
    this.ordem = (data.ordem || (maxOrdem + 1));
    this.schemajson = data.schemajson || '[]';
    this.lastResultscached = data.lastResultscached || '[]';


    // propriedades adicionais para funcionalidade
    this.schema = [];
    this.lastResults = [];

    this.lastResults = forceJSONParse(this.lastResultscached, []);
    this.schema = forceJSONParse(this.schemajson, []);
    this.testData = data.testData || [];
    this.lastExecuted = data.lastExecuted || [];
    this.isActive = data.isActive !== undefined ? data.isActive : true;


    var schemaQueryEditorContainerHtml = "";

    schemaQueryEditorContainerHtml += generateQueryButtonOptions();


    schemaQueryEditorContainerHtml += generateFilterVariablesParaFonteHTML();


    this.schemaQueryEditor = schemaQueryEditorContainerHtml;


    this.objectsUIFormConfig = data.objectsUIFormConfig || [];
    this.localsource = data.localsource || "";
    this.idfield = data.idfield || "mreportfonstestamp";
    this.table = "MReportFonte";
}

MReportFonte.prototype.setUIFormConfig = function () {

    var UIFormConfig = getMReportFonteUIObjectFormConfigAndSourceValues();
    this.objectsUIFormConfig = UIFormConfig.objectsUIFormConfig;
    this.localsource = UIFormConfig.localsource;
    this.idfield = UIFormConfig.idField;
}

function getMReportFonteUIObjectFormConfigAndSourceValues() {
    var objectsUIFormConfig = [
        new UIObjectFormConfig({ colSize: 4, campo: "codigo", tipo: "text", titulo: "Código", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "descricao", tipo: "text", titulo: "Descrição", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "ordem", tipo: "digit", titulo: "Ordem", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({
            colSize: 12,
            campo: "tipo",
            tipo: "select",
            titulo: "Tipo",
            fieldToOption: "option",
            contentType: "select",
            fieldToValue: "value",
            classes: "form-control input-source-form  input-sm ",
            selectValues: [
                { option: "Query SQL", value: "query" },
                /*   { option: "API REST", value: "api" },
                   { option: "JSON", value: "json" },
                   { option: "CSV", value: "csv" }*/
            ]
        }),
        new UIObjectFormConfig({ customData: " v-on:keyup='changeExpressaoDbListagemAndHandleFilters()'", colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaolistagem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de Listagem", classes: "input-source-form m-editor", contentType: "div" }),

        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "schemaQueryEditor", tipo: "div", cols: 90, rows: 90, titulo: "", classes: "input-source-form", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaojslistagem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de Listagem JS", classes: "input-source-form m-editor ", contentType: "div" })
    ];
    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMReportFontes", idField: "mreportfonstestamp" };
}


MReportFonte.prototype.stringifyJSONFields = function () {
    var data = this;
    data.schemajson = JSON.stringify(data.schema || []);
    data.lastResultscached = JSON.stringify(data.lastResults || []);
    return data;
}




function forceJSONParse(data, defaultValue) {

    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (e) {
            return defaultValue;
        }
    }
    else {
        return data || defaultValue;
    }

}








