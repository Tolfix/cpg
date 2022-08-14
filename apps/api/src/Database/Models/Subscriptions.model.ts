import mongoose, { Document, model, Schema } from "mongoose";
import increment from "mongoose-auto-increment";
import { MongoDB_URI } from "../../Config";
import { IQuotes } from "interfaces/Quotes.interface";
import { ISubscription } from "interfaces/Subscriptions.interface";
import { Logger } from "lib";
import GetText from "../../Translation/GetText";
import { A_RecurringMethod } from "interfaces/types/PaymentMethod";
import { A_InvoiceStatus } from "./Invoices.model";

const SubscriptionSchema = new Schema
    (
        {

            id: Number,

            uid: {
                type: String,
                required: false,
                description: GetText().txt_Uid_Description,
            },

            customer_uid: {
                type: Number,
                required: true,
            },

            products: {
                type: [
                    {
                        product_id: Number,
                        configurable_options_ids: {
                            type: [
                                {
                                    id: Number,
                                    option_index: Number,
                                },
                            ],
                            required: false
                        },
                        quantity: Number,
                    }
                ],
                required: true,
            },

            promotion_codes: {
                type: [Number],
                default: []
            },

            renewing_method: {
                type: String,
                enum: [...A_RecurringMethod],
                required: true,
            },

            payment_method: {
                type: String,
                enum: ["credit_card", "paypal"],
                default: "credit_card",
            },

            status: {
                type: String,
                enum: [...A_InvoiceStatus],
                default: "active",
            },

            start_date: {
                type: String,
                required: true,
            },

            transactions: {
                type: [Number],
                default: [],
            }

        },
        {
            timestamps: true,
        }
    );

// Log when creation
SubscriptionSchema.post('save', function (doc: IQuotes & Document)
{
    Logger.db(GetText().database.txt_Model_Created(doc.modelName, doc.uid));
    // Logger.db(`Created Quotes ${doc.id}`);
});

const connection = mongoose.createConnection(MongoDB_URI);
increment.initialize(connection);

SubscriptionSchema.plugin(increment.plugin, {
    model: 'subscription',
    field: 'id',
    startAt: 1,
    incrementBy: 1
});

const SubscriptionModel = model<ISubscription & Document>("subscription", SubscriptionSchema);

export default SubscriptionModel;