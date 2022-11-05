import mongoose, { Document, model, Schema } from "mongoose"
import increment from "mongoose-auto-increment";
import { Default_Language, MongoDB_URI } from "../../Config";
import { ITransactions } from "interfaces/Transactions.interface";
import GetText from "../../Translation/GetText";
import { A_CC_Payments } from "interfaces/types/PaymentMethod";
import { currencyCodes } from "lib";
import Logger from "@cpg/logger";

const log = new Logger("cpg:api:database:mongo:models:transactions");

const TransactionsSchema = new Schema
    (
        {

            uid: {
                type: String,
                required: false,
                description: GetText(Default_Language).txt_Uid_Description,
            },

            customer_uid: {
                type: Number,
                required: false
            },

            invoice_uid: {
                type: Number,
                required: false
            },

            date: {
                type: String,
                required: true,
            },

            payment_method: {
                type: String,
                enum: [...A_CC_Payments],
                default: 'none',
            },

            amount: {
                type: Number,
                default: 0,
            },

            fees: {
                type: Number,
                default: 0,
            },

            currency: {
                type: String,
                enum: currencyCodes,
                default: 'USD',
            },

            statement: {
                type: String,
                enum: ['income', 'expense'],
                default: 'income',
            },

            expense_information: {
                type: {
                    invoice_id: {
                        type: Number,
                        required: false,
                    },
                    company: {
                        type: String,
                        required: false,
                    },
                    description: {
                        type: String,
                        required: false,
                    },
                    notes: {
                        type: String,
                        required: false,
                    },
                    extra: {
                        type: Schema.Types.Mixed,
                        required: false,
                    },
                },
                required: false,
            }

        },
        {
            timestamps: true,
        }
    );

// Log when a transaction is created
TransactionsSchema.post('save', function (doc: ITransactions & Document)
{
    log.info(GetText(Default_Language).database.txt_Model_Created(doc.modelName, doc.uid));
    // Logger.db(`Created transaction ${doc.uid}`);
});

const connection = mongoose.createConnection(MongoDB_URI);
increment.initialize(connection);

TransactionsSchema.plugin(increment.plugin, {
    model: 'transactions',
    field: 'id',
    startAt: 1,
    incrementBy: 1
});

const TransactionsModel = model<ITransactions & Document>("transactions", TransactionsSchema);

export default TransactionsModel;