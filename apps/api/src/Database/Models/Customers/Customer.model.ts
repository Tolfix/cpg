import mongoose, { Document, model, Schema } from "mongoose"
import increment from "mongoose-auto-increment";
import { Default_Language, MongoDB_URI } from "../../../Config";
import { ICustomer, ICustomerMethods } from "interfaces/Customer.interface";
import GetText from "../../../Translation/GetText";
import { currencyCodes } from "lib";
import Logger from "@cpg/logger";

const log = new Logger("cpg:api:database:mongo:models:customers");

const CustomerSchema = new Schema
    (
        {

            uid: {
                type: String,
                required: false,
                description: GetText(Default_Language).txt_Uid_Description,
            },

            personal: {
                type: {
                    first_name: {
                        type: String,
                        required: true
                    },
                    last_name: {
                        type: String,
                        required: true
                    },
                    email: {
                        type: String,
                        required: true
                    },
                    phone: {
                        type: String,
                        required: true
                    },
                },
                required: true,
            },

            billing: {
                type: {
                    company: {
                        type: String,
                        required: false
                    },
                    company_vat: {
                        type: String,
                        required: false
                    },
                    street01: {
                        type: String,
                        required: true
                    },
                    street02: {
                        type: String,
                        required: false
                    },
                    city: {
                        type: String,
                        required: true
                    },
                    state: {
                        type: String,
                        required: true
                    },
                    postcode: {
                        type: String,
                        required: true
                    },
                    country: {
                        type: String,
                        required: true
                    }
                },
                required: true,
            },

            profile_picture: {
                type: Number,
                ref: "images",
                required: false,
                default: null,
            },

            password: {
                type: String,
                required: true,
            },

            extra: {
                type: Object,
                required: false,
                default: {},
            },

            notes: {
                type: String,
                default: "",
            },

            status: {
                type: String,
                enum: ["active", "inactive"],
                default: "active",
            },

            credits: {
                type: [
                    {
                        amount: {
                            type: Number,
                            required: true,
                        },
                        currency: {
                            type: String,
                            enum: currencyCodes,
                            required: true,
                        },
                        notes: {
                            type: String,
                            default: "",
                        },
                        invoice_id: {
                            type: Number,
                            ref: "invoices",
                            required: false,
                        },
                    }
                ],
                required: false,
                default: [],
            },

            currency: {
                type: String,
                enum: currencyCodes,
                required: true,
            },

        },
        {
            timestamps: true,
        }
    );

CustomerSchema.index({
    "personal.email": "text",
    "personal.first_name": "text",
    "personal.last_name": "text",
});

CustomerSchema.methods.fullName = function (sC = false)
{
    return `${this.personal.first_name} ${this.personal.last_name} ${sC ? (this.billing.company ? ` (${this.billing.company})` : "") : ""}`;
}

// Log when creation
CustomerSchema.post('save', function (doc: ICustomer & Document)
{
    // @ts-ignore
    log.info(GetText(Default_Language).database.txt_Model_Created(doc.modelName, doc.id));
    // Logger.db(`Created customer ${doc.id}`);
});

const connection = mongoose.createConnection(MongoDB_URI);
increment.initialize(connection);

CustomerSchema.plugin(increment.plugin, {
    model: 'customer',
    field: 'id',
    startAt: 1,
    incrementBy: 1
});

const CustomerModel = model<ICustomer & Document & ICustomerMethods>("customer", CustomerSchema);

export default CustomerModel;