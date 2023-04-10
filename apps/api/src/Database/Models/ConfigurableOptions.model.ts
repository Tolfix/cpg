import mongoose, { model, Schema, Document } from "mongoose"
import increment from "mongoose-auto-increment";
import { Default_Language, MongoDB_URI } from "../../Config";
import { IConfigurableOptions } from "interfaces/ConfigurableOptions.interface";
import GetText from "../../Translation/GetText";
import Logger from "@cpg/logger";

const log = new Logger("cpg:api:database:mongo:models:configurableoptions");

const ConfigurableOptionsSchema = new Schema
    (
        {

            name: {
                type: String,
                required: true,
            },

            products_ids: {
                type: [Number],
                default: [],
            },

            options: {
                type: [
                    {
                        name: String,
                        price: Number,
                    }
                ],
                default: [],
            },

        },
        {
            timestamps: true,
        }
    );

// Log when creation
ConfigurableOptionsSchema.post('save', function (doc: IConfigurableOptions & Document)
{
    // @ts-ignore
    log.info(GetText(Default_Language).database.txt_Model_Created(doc.modelName, doc.id));
    // Logger.db(`Created configurable_options ${doc.id}`);
});

const connection = mongoose.createConnection(MongoDB_URI);
increment.initialize(connection);

ConfigurableOptionsSchema.plugin(increment.plugin, {
    model: 'configurable_options',
    field: 'id',
    startAt: 1,
    incrementBy: 1
});

const ConfigurableOptionsModel = model<IConfigurableOptions & Document>("configurable_options", ConfigurableOptionsSchema);

export default ConfigurableOptionsModel;