import mongoose, { Document, model, Schema } from "mongoose"
import increment from "mongoose-auto-increment";
import { Default_Language, MongoDB_URI } from "../../Config";
import { IPromotionsCodes } from "interfaces/PromotionsCodes.interface";
import GetText from "../../Translation/GetText";
import Logger from "@cpg/logger";

const log = new Logger("cpg:api:database:mongo:models:promotionscodes");

const PromotionCodeSchema = new Schema
    (
        {

            name: {
                type: String,
                required: true
            },

            discount: {
                type: Number,
                required: true,
            },

            valid_to: {
                type: String,
                enum: [String, "permanent"],
                default: "permanent"
            },

            uses: {
                type: Number,
                // enum: [Number, "unlimited"],
                default: "unlimited"
            },

            percentage: {
                type: Boolean,
                default: false
            },

            products_ids: {
                type: [Number],
                required: true
            }

        },
        {
            timestamps: true,
        }
    );

// Log when creation
PromotionCodeSchema.post('save', function (doc: IPromotionsCodes & Document)
{
    // @ts-ignore
    log.info(GetText(Default_Language).database.txt_Model_Created(doc.modelName, doc.id));
    // Logger.db(`Created promotion code ${doc.name}`);
});

const connection = mongoose.createConnection(MongoDB_URI);
increment.initialize(connection);

PromotionCodeSchema.plugin(increment.plugin, {
    model: 'promotions_codes',
    field: 'id',
    startAt: 1,
    incrementBy: 1
});

const PromotionCodeModel = model<IPromotionsCodes & Document>("promotions_codes", PromotionCodeSchema);

export default PromotionCodeModel;