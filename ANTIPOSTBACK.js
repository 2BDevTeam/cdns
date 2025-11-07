var $form = $('form').first();

// Transformar em array de pares name/value
var arr = $form.serializeArray();

// Remove entradas antigas de eventtarget/argument se existirem
arr = arr.filter(function (f) {
    return f.name !== '__EVENTTARGET' && f.name !== '__EVENTARGUMENT';
});

// Garantir que os hidden ASP.NET estão presentes exactamente com o name correto
['__VIEWSTATE','__VIEWSTATEGENERATOR','__EVENTVALIDATION','__VIEWSTATEENCRYPTED'].forEach(function(name){
    var $inp = $('input[name="' + name + '"]');
    if ($inp.length) {
        // Remove qualquer entrada com o mesmo name (segurança)
        arr = arr.filter(function (f) { return f.name !== name; });
        // Adiciona o valor tal como está no DOM
        arr.push({ name: name, value: $inp.val() });
    }
});

// Adiciona/força os campos do postback
arr.push({ name: '__EVENTTARGET', value: 'ctl00$conteudo$options2$userOption1023' });
arr.push({ name: '__EVENTARGUMENT', value: '2' });

$.ajax({
    type: "POST",
    async: false,
    data: $.param(arr), // converte de volta para string urlencoded
    success: function (response) {
        // Criar um elemento temporário com o HTML retornado
        var $temp = $('<div>').html(response);
        
        // Buscar o valor do input pelo ID exato
        var ncontValue = $temp.find('#ctl00_conteudo_ncont2_ncont2mBox1').val();
        
        // Usar o valor como necessário
        if (ncontValue) {
            console.log('Valor de ncont:', ncontValue);
            // Faça algo com o valor aqui
        } else {
            console.log('Input ctl00_conteudo_ncont2_ncont2mBox1 não encontrado na resposta');
            
            // Debug: mostrar todos os inputs para verificar
            console.log('Todos os inputs encontrados:');
            $temp.find('input').each(function() {
                console.log('Input:', $(this).attr('id'), $(this).attr('name'), $(this).val());
            });
        }
    },
    error: function (xhr, status, err) {
        console.error('Erro no AJAX:', err);
    }
});