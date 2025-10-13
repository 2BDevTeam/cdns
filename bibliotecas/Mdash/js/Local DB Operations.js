




function localDataBaseExists(databaseName) {
    // Get the list of existing databases
    var existingDatabases = Object.keys(alasql.databases);

    // Check if the desired database is in the list
    return existingDatabases.includes(databaseName);
}


function extractLocalDbSchema(dadosSchema) {

    // Extract the keys and values from dadosSchema to determine the table schema
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

function setTupDataOnLocalDb(databaseName, tableName, dadosSchema, dados) {

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





