import { SchemaComposer } from 'graphql-compose';
import fs from "fs";
import { HomeDir } from '../../Config';
import Logger from 'lib/Logger';
import GetText from '../../Translation/GetText';

const schemaComposer = new SchemaComposer();

// Go through each in ./Schemas/*.js files and add them to schemaComposer
Logger.graphql(GetText().graphql.txt_Schemas_Loading);
// Logger.graphql("Loading GraphQL schemas...");
const schemaDir = HomeDir + "/build/Database/GraphQL/Schemas";
const files = fs.readdirSync(`${schemaDir}`).filter((f) => f.endsWith('schemas.js'));
for (const f of files)
{

    // Now we require the file.
    const schema = require(`${schemaDir}/${f}`);
    // Get the schema.startsWith
    const name = schema.startsWith;
    if (!name)
        continue;

    // Now get scheme[`${name}Query`] and schema[`${name}Mutation`]
    const query = schema[`${name}Query`];
    const mutation = schema[`${name}Mutation`];

    Logger.graphql(GetText().graphql.txt_Schemas_Adding(name));
    // Logger.graphql(`Adding GraphQL schema/query ${name}`);

    // Add the query and mutation to the schemaComposer
    if (query)
        schemaComposer.Query.addFields(query);
    if (mutation)
        schemaComposer.Mutation.addFields(mutation);


}

// Let's create the schema
export default schemaComposer.buildSchema();