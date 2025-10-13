


var GMappedLocalDBs = [new LocalDBMappedData({ table: "defaultTable", schema: {} })];
GMappedLocalDBs = [];

function localDataBaseExists(databaseName) {
    // Get the list of existing databases
    var existingDatabases = Object.keys(alasql.databases);

    // Check if the desired database is in the list
    return existingDatabases.includes(databaseName);
}

function LocalDBMappedData(data) {

    this.table = data.table || "defaultTable";
    this.schema = data.schema || {};
    this.fontestamp = data.fontestamp || "";

}

function getAllMappedLocalDBDataSimpleArray() {

    var mappedData = []

    GMappedLocalDBs.forEach(function (item) {
        item.schema.map(function (field) {
            mappedData.push(item.table + "-" + field)
        })
    })

    return mappedData;

}




function replaceLocalDbKeywords(dados) {
    var dadosString = JSON.stringify(dados);

    // Usar uma única regex com alternation (|) para substituir todas as palavras de uma vez
    dadosString = dadosString.replace(/\b(total|no)\b/g, function (match) {
        switch (match) {
            case 'total': return 'tot';
            case 'no': return 'num';
            default: return match;
        }
    });

    return JSON.parse(dadosString);
}

function extractLocalDbSchema(dadosSchema) {

    // Extract the keys and values from dadosSchema to determine the table schema
    var typeMap = {
        'number': 'NUMERIC',
        'string': 'VARCHAR(max)',
        'boolean': "BIT",
        'date': "DATETIME"
    };


    var tableSchema = "";
    Object.entries(dadosSchema).map(function (entry) {
        var key = entry[0];
        var value = entry[1];
        return key + " " + typeMap[typeof value];
    }).forEach(function (item, index, array) {
        tableSchema += item;
        if (index < array.length - 1) {
            tableSchema += ", ";
        }
    });


    return tableSchema;
}



function findDataByMapCode(mapCode) {

    var parts = mapCode.split("-");
    if (parts.length != 2) return [];
    var tableName = parts[0];
    var fieldName = parts[1];

    
    var records = alasql("SELECT " + fieldName + " FROM " + tableName);
    return records;
}

function setTupDataOnLocalDb(databaseName, tableName, dadosSchema, dados, fontestamp) {

    if (!localDataBaseExists(databaseName)) {

        alasql('CREATE DATABASE ' + databaseName + '; USE ' + databaseName + ';');
    }


    if (localTableExists(databaseName, tableName) == true) {
        alasql("DELETE FROM  " + tableName + ";");
    }



    if (localTableExists(databaseName, tableName) != true) {
        var createTableQuery = "CREATE TABLE " + tableName + " (" + dadosSchema + ");";
        alasql(createTableQuery);
    }


    alasql.tables[tableName].data = dados;

    var fonteExistData = GMappedLocalDBs.find(function (item) { return item.fontestamp == fontestamp });
    var newMappedData = new LocalDBMappedData({ table: tableName, schema: Object.keys(dados[0]), fontestamp: fontestamp })
    if (fonteExistData) {

        fonteExistData.table = newMappedData.table;
        fonteExistData.schema = newMappedData.schema;
        fonteExistData.fontestamp = newMappedData.fontestamp;
    } else {

        GMappedLocalDBs.push(newMappedData);
    }


}


function localTableExists(databaseName, tableName) {
    // Get the list of tables within the specified database
    var database = alasql.databases[databaseName];
    if (database) {
        var existingTables = Object.keys(database.tables);

        // Check if the desired table is in the list
        return existingTables.includes(tableName);
    }

    return false; // Database doesn't exist, so the table can't exist either
}





