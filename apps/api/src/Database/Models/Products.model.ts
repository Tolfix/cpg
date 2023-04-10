import mongoose, { Document, model, Schema } from "mongoose"
import increment from "mongoose-auto-increment";
import { Default_Language, MongoDB_URI } from "../../Config";
import { IProduct } from "interfaces/Products.interface";
import GetText from "../../Translation/GetText";
import { A_RecurringMethod } from "interfaces/types/PaymentMethod";
import { A_PaymentTypes } from "interfaces/types/PaymentTypes";
import { currencyCodes } from "lib";
import Logger from "@cpg/logger";

const log = new Logger("cpg:api:database:mongo:models:products");

const ProductSchema = new Schema
    (
        {

            uid: {
                type: String,
                required: false,
                description: GetText(Default_Language).txt_Uid_Description,
            },

            name: {
                type: String,
                required: true,
            },

            description: {
                type: String,
                default: '',
            },

            hidden: {
                type: Boolean,
                required: true,
            },

            category_uid: {
                type: Number,
                required: true,
            },

            stock: {
                type: Number,
                required: true,
            },

            BStock: {
                type: Boolean,
                required: true,
            },

            special: {
                type: Boolean,
                required: true,
            },

            payment_type: {
                type: String,
                enum: [...A_PaymentTypes],
                default: "one_time",
            },

            price: {
                type: Number,
                required: true,
            },

            currency: {
                type: String,
                enum: currencyCodes,
                required: true,
            },

            setup_fee: {
                type: Number,
                required: true,
            },

            tax_rate: {
                type: Number,
                required: true,
            },

            recurring_method: {
                type: String,
                enum: [...A_RecurringMethod],
                default: undefined,
                required: false,
            },

            image: {
                type: [Number],
                default: [],
            },

            module_name: {
                type: String,
                default: 'none',
            },

            modules: {
                type: [{
                    name: String,
                    value: String,
                }],
                default: [],
            },

        },
        {
            timestamps: true,
        }
    );

// Log when creation
ProductSchema.post('save', function (doc: IProduct & Document)
{
    // @ts-ignore
    log.info(GetText(Default_Language).database.txt_Model_Created(doc.modelName, doc.id));
    // Logger.db(`Created product ${doc.name} (${doc.id})`);
});

const connection = mongoose.createConnection(MongoDB_URI);
increment.initialize(connection);

ProductSchema.plugin(increment.plugin, {
    model: 'products',
    field: 'id',
    startAt: 1,
    incrementBy: 1
});

const ProductModel = model<IProduct & Document>("products", ProductSchema);

export default ProductModel;