DECLARE @url              VARCHAR(MAX), 
        @response         NVARCHAR(4000), 
        @requestBody      VARCHAR(8000), 
        @username         VARCHAR(120), 
        @password         VARCHAR(120), 
        @code             VARCHAR(120), 
        @parameters       VARCHAR(8000), 
        @statusText       VARCHAR(1000), 
        @status           VARCHAR(1000),
        @xmlResult        XML,
        @extractedResult  NVARCHAR(1000)

-- Configurar parâmetros da requisição
SET @url = 'https://pandorabox.cfm.co.mz/intranetteste/ws/wscript.asmx'
SET @username = 'Teu user'
SET @password = 'Tua password'
SET @parameters = 'parametros do script'
SET @code = 'Codigo do script'

-- Construir o corpo da requisição SOAP
SET @requestBody = '<?xml version="1.0" encoding="utf-8"?>'
SET @requestBody = @requestBody + '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'
SET @requestBody = @requestBody + '<soap:Body>'
SET @requestBody = @requestBody + '<RunCode xmlns="http://www.phc.pt/">'
SET @requestBody = @requestBody + '<userName>' + @username + '</userName>'
SET @requestBody = @requestBody + '<password>' + @password + '</password>'
SET @requestBody = @requestBody + '<code>' + @code + '</code>'
SET @requestBody = @requestBody + '<parameter>' + @parameters + '</parameter>'
SET @requestBody = @requestBody + '</RunCode>'
SET @requestBody = @requestBody + '</soap:Body>'
SET @requestBody = @requestBody + '</soap:Envelope>'

-- Executar a requisição SOAP
EXEC Sp_2b_request 
    @UserName = '', 
    @Password = '', 
    @ContentType = 'text/xml', 
    @Accept = 'text/xml', 
    @URI = @url, 
    @methodName = 'POST', 
    @requestBody = @requestBody, 
    @statusText = @statusText OUT, 
    @status = @status OUT, 
    @response = @response OUT 

-- Inicializar o resultado
SET @extractedResult = 'Sem Resposta XML'

-- Tentar processar a resposta XML
BEGIN TRY
    -- Tentar converter a resposta para XML
    SET @xmlResult = CONVERT(XML, @response)
    
    -- Extrair o valor de RunCodeResult
    SET @extractedResult = @xmlResult.value('(//*:RunCodeResult)[1]', 'NVARCHAR(1000)')
    
    -- Se não encontrou o valor, ajustar a mensagem
    IF @extractedResult IS NULL
        SET @extractedResult = 'Tag RunCodeResult não encontrada no XML'
END TRY
BEGIN CATCH
    -- Se a conversão falhou, tentar método alternativo
    BEGIN TRY
        -- Remover a declaração XML que pode causar problemas de encoding
        DECLARE @cleanResponse NVARCHAR(4000)
        SET @cleanResponse = REPLACE(@response, '<?xml version="1.0" encoding="utf-8"?>', '')
        SET @cleanResponse = REPLACE(@cleanResponse, '<?xml version="1.0" encoding="UTF-8"?>', '')
        
        -- Tentar converter novamente
        SET @xmlResult = CAST(@cleanResponse AS XML)
        
        -- Extrair o valor de RunCodeResult
        SET @extractedResult = @xmlResult.value('(//*:RunCodeResult)[1]', 'NVARCHAR(1000)')
        
        -- Se não encontrou o valor
        IF @extractedResult IS NULL
            SET @extractedResult = 'Tag RunCodeResult não encontrada após limpeza do XML'
    END TRY
    BEGIN CATCH
        -- Se ainda falhar, manter a mensagem "Sem Resposta XML"
        -- O valor já está inicializado, não precisa alterar
    END CATCH
END CATCH

-- Verificar se extraiu algum valor válido
IF @extractedResult = 'Sem Resposta XML' 
   OR @extractedResult = 'Tag RunCodeResult não encontrada no XML'
   OR @extractedResult = 'Tag RunCodeResult não encontrada após limpeza do XML'
BEGIN
    -- Tentar verificar se há algum conteúdo na resposta
    IF @response IS NULL OR LTRIM(RTRIM(@response)) = ''
        SET @extractedResult = 'Resposta vazia do servidor'
    ELSE IF CHARINDEX('RunCodeResult', @response) > 0
        SET @extractedResult = 'Erro na extração XML - conteúdo encontrado mas não processado'
END

-- Exibir os resultados finais
SELECT 
    @status AS [Status_HTTP],
    @extractedResult AS [Resultado_SOAP],
    @statusText AS [Descricao_Status],
    @response AS [Resposta_Completa],
    @requestBody AS [Request_Enviado]