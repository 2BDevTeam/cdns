 var App = PetiteVue.reactive({
        components: getTiposObjectoConfig(),
        reportObjects: GMReportObjects,
        dataSources: GMDashFontes,
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
        addDataSource: function () {
            var self = this;
            var newSource = new MReportFonte({});
            newSource.setUIFormConfig();
            self.dataSources.push(newSource);
            realTimeComponentSync(newSource, newSource.table, newSource.idfield);
        },

        removeDataSource: function (index, source) {
            var self = this;
            self.dataSources.splice(index, 1);

            GMRelatorioDeleteRecords.push({
                table: "MReportFonte",
                stamp: source.mreportfonstestamp,
                tableKey: "mreportfonstestamp"
            });
        }
    });