

// MASPForm - representa o formulário completo

var ASPFORM_SETTINGS = {
    enabledSufix: "mBox1",
    readOnlySufix: "_mLabel1"
}
function MASPForm() {
    this.fields = [MASPFormField({})];
    this.fields
    this.formID = "";
    this.isSynced = false;
    this.validationErrors = [];
    this.originalSnapshot = {};
    this.enableAntiPostBack = function () {
        // var elementos = $('input[onchange*="__doPostBack"], select[onchange*="__doPostBack"], textarea[onchange*="__doPostBack"]');
        var selfAspForm = this;
        var inputs = $('*[onchange*="__doPostBack"]');

        inputs.each(function () {
            var $input = $(this);
            $input.attr('data-antipostback', 'true')
                .attr('data-original-onchange', $input.attr('onchange') || '')
                .attr('data-original-onkeypress', $input.attr('onkeypress') || '')
                .attr('data-original-onblur', $input.attr('onblur') || '');
        });

        inputs.off('change keypress blur')
            .removeAttr('onchange onkeypress onblur');

        $('[data-antipostback="true"]').each(function () {
            var $input = $(this);
            var originalId = this.id;
            var originalName = this.name;

            $input.off('change.antipostback keypress.antipostback blur.antipostback');


            $input.on('change.antipostback', debounce(function () {

                selfAspForm.syncFields();

            }, 100));


        });
    }
    this.initForm = function () {

        var fields = getAspFormControlsFromServer();
        this.fields = [];
        var self = this;
        fields.map(function (field) {
            var formField = new MASPFormField(field);
            formField.setFrontEndId();
            self.fields.push(formField);
        });
        self.enableAntiPostBack();
    }

    this.syncFields = function () {

        var self = this;
        var fields = getAspFormControlsFromServer();
        this.fields = [];
        var self = this;
        fields.map(function (field) {
            var formField = new MASPFormField(field);
            formField.setFrontEndId();
            formField.sync();
            self.fields.push(formField);
        });

    }




};





MASPForm.prototype.addField = function (field) {
    if (!field) return;
    this.fields.push(field);
};

MASPForm.prototype.getField = function (id) {
    var i;
    for (i = 0; i < this.fields.length; i++) {
        if (this.fields[i].ID === id) {
            return this.fields[i];
        }
    }
    return null;
};

MASPForm.prototype.getFieldByHtmlID = function (idHtml) {
    var i;
    for (i = 0; i < this.fields.length; i++) {
        if (this.fields[i].IDHtml === idHtml) {
            return this.fields[i];
        }
    }
    return null;
};

MASPForm.prototype.applyAllToDom = function () {
    var i;
    for (i = 0; i < this.fields.length; i++) {
        var f = this.fields[i];
        f.applyStateToDom();
        f.applyValueToDom();
    }
};

MASPForm.prototype.readAllFromDom = function () {
    var i;
    for (i = 0; i < this.fields.length; i++) {
        this.fields[i].readValueFromDom();
    }
};

MASPForm.prototype.createSnapshot = function () {
    this.originalSnapshot = {};
    var i;
    for (i = 0; i < this.fields.length; i++) {
        var f = this.fields[i];
        this.originalSnapshot[f.ID] = f.createSnapshot();
    }
};

MASPForm.prototype.hasChanges = function () {
    var i;
    for (i = 0; i < this.fields.length; i++) {
        var f = this.fields[i];
        var snap = this.originalSnapshot[f.ID];
        if (!snap) return true;
        if (f.isDifferentFrom(snap)) return true;
    }
    return false;
};

MASPForm.prototype.getDirtyFields = function () {
    var dirty = [];
    var i;
    for (i = 0; i < this.fields.length; i++) {
        var f = this.fields[i];
        if (f.IsDirty) dirty.push(f);
    }
    return dirty;
};

MASPForm.prototype.serialize = function () {
    var obj = {};
    var i;
    for (i = 0; i < this.fields.length; i++) {
        var f = this.fields[i];
        obj[f.ID] = f.Valor;
    }
    return obj;
};

MASPForm.prototype.toPlainObject = function () {
    var result = [];
    var i;
    for (i = 0; i < this.fields.length; i++) {
        result.push(this.fields[i].toPlainObject());
    }
    return result;
};

MASPForm.prototype.fromJson = function (jsonArray) {
    var form = new MASPForm();
    if (!jsonArray || !jsonArray.length) return form;

    var i;
    for (i = 0; i < jsonArray.length; i++) {
        var item = jsonArray[i];
        var field = new MASPFormField(item);
        form.addField(field);
    }

    form.createSnapshot();
    return form;
};


function MASPFormField(options) {
    options = options || {};

    this.ID = options.ID || "";
    this.IDHtml = options.IDHtml || "";
    this.Tipo = options.Tipo || "";
    this.FrontEndId = options.FrontEndId || "";
    this.Valor = typeof options.Valor !== "undefined" ? options.Valor : "";
    this.Visible = options.Visible !== false;
    this.Enabled = options.Enabled !== false;
    this.readOnlyy = options.readOnlyy || false;
    this.CssClass = options.CssClass || "";
    this.ToolTip = options.ToolTip || "";
    this.MaxLength = (typeof options.MaxLength === "number" ? options.MaxLength : -1);
    this.TextMode = options.TextMode || "";
    this.Attributes = options.Attributes || {};
    this.IsDirty = false;
    this.IsValid = true;


}

MASPFormField.prototype.setFrontEndId = function () {
    var self = this;


    if (self.readOnlyy) {

        self.FrontEndId = self.IDHtml + ASPFORM_SETTINGS.readOnlySufix;
        return
    }
    self.FrontEndId = self.IDHtml + "_" + self.ID + ASPFORM_SETTINGS.enabledSufix;


}


MASPFormField.prototype.setValue = function () {
    var self = this;

    if ($("#" + self.FrontEndId).length > 0) {

        console.log("Setting value for field:", self.ID, self.FrontEndId, self.Valor);
        if (self.readOnlyy) {
            console.log("ReadOnly field - setting text:",self.FrontEndId, self.Valor);
            $("#" + self.FrontEndId).text(self.Valor);
            return;
        }

      
        $("#" + self.FrontEndId).val(self.Valor)

        console.log("CHANGING FIELDS")
    }


}


MASPFormField.prototype.sync = function () {
    var self = this;
    self.setValue();


}


MASPFormField.prototype.findControl = function (id) {
    var self = this;
    //ctl00_conteudo_nome_nomemBox1
    //ctl00_conteudo_morada2_mLabel1
    //ctl00_conteudo_datafinal2_datafinal2mBox1
    switch (self.Tipo) {
        case "WebControlLib.NossoCampoTextBox":
            // Implementar procura de controlo dentro do GridView se necessário
            return null;
        default:
            return null;
    }


}

MASPFormField.prototype.getDomElement = function () {
    if (!this.IDHtml) return null;
    return document.getElementById(this.IDHtml);
};

MASPFormField.prototype.applyValueToDom = function () {
    var el = this.getDomElement();
    if (!el) return;
    if (typeof el.value !== "undefined") {
        el.value = this.Valor;
    }
};

MASPFormField.prototype.readValueFromDom = function () {
    var el = this.getDomElement();
    if (!el) return;

    var newVal = (typeof el.value !== "undefined") ? el.value : null;
    if (newVal !== null && newVal !== this.Valor) {
        this.Valor = newVal;
        this.IsDirty = true;
    }
};

MASPFormField.prototype.applyStateToDom = function () {
    var el = this.getDomElement();
    if (!el) return;

    el.style.display = this.Visible ? "" : "none";
    el.disabled = !this.Enabled;

    if (this.readOnlyy === true && typeof el.readOnly !== "undefined") {
        el.readOnly = true;
    }

    if (this.CssClass && el.className !== this.CssClass) {
        el.className = this.CssClass;
    }

    if (this.ToolTip && el.title !== this.ToolTip) {
        el.title = this.ToolTip;
    }
};

MASPFormField.prototype.createSnapshot = function () {
    return {
        Valor: this.Valor,
        Visible: this.Visible,
        Enabled: this.Enabled,
        readOnlyy: this.readOnlyy
    };
};

MASPFormField.prototype.isDifferentFrom = function (oldSnap) {
    if (!oldSnap) return true;
    if (oldSnap.Valor !== this.Valor) return true;
    if (oldSnap.Visible !== this.Visible) return true;
    if (oldSnap.Enabled !== this.Enabled) return true;
    if (oldSnap.readOnlyy !== this.readOnlyy) return true;
    return false;
};

MASPFormField.prototype.toPlainObject = function () {
    return {
        ID: this.ID,
        IDHtml: this.IDHtml,
        Tipo: this.Tipo,
        Valor: this.Valor,
        Visible: this.Visible,
        Enabled: this.Enabled,
        readOnlyy: this.readOnlyy,
        CssClass: this.CssClass,
        ToolTip: this.ToolTip,
        MaxLength: this.MaxLength,
        TextMode: this.TextMode,
        Attributes: this.Attributes
    };
};

function debounce(func, wait) {
    var timeout;
    return function executedFunction() {
        var args = arguments;
        var context = this;
        var later = function () {
            clearTimeout(timeout);
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}



function getAspFormControlsFromServer() {

    var $form = $('form').first();

    var controls = [];

    var arr = $form.serializeArray();

    arr = arr.filter(function (f) {
        return f.name !== '__EVENTTARGET' && f.name !== '__EVENTARGUMENT';
    });

    ['__VIEWSTATE', '__VIEWSTATEGENERATOR', '__EVENTVALIDATION', '__VIEWSTATEENCRYPTED'].forEach(function (name) {
        var $inp = $('input[name="' + name + '"]');
        if ($inp.length) {
            // Remove qualquer entrada com o mesmo name (segurança)
            arr = arr.filter(function (f) { return f.name !== name; });
            // Adiciona o valor tal como está no DOM
            arr.push({ name: name, value: $inp.val() });
        }
    });

    arr.push({ name: '__EVENTTARGET', value: 'ctl00$conteudo$options2$userOption1023' });
    arr.push({ name: '__EVENTARGUMENT', value: '2' });

    var errorMessage = "ao obter os controles do servidor.";
    $.ajax({
        type: "POST",
        async: false,
        data: $.param(arr), // converte de volta para string urlencoded
        success: function (response) {

            // console.log('Resposta recebida do servidor para controles ASP.NET.',response);
            if (response.cod != "0000") {
                console.error('Erro ao ' + errorMessage, response.msg);
                return;
            }

            controls = response.controls || [];

        },
        error: function (xhr, status, err) {
            console.error('Erro no AJAX: ' + errorMessage, err);
        }
    });

    return controls;


}