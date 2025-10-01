    $.ajax({
        type: "POST",
        async: false,

        data: {
            '__EVENTTARGET': 'ctl00$conteudo$moeda$moedamBox1',
        },
        success: function (response) {



           // console.log(response)




        }
    });
    
javascript:setTimeout('__doPostBack(\'ctl00$conteudo$moeda$moedamBox1\',\'\')', 0)