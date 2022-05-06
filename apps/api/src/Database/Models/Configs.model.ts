import { model, Schema } from "mongoose"
import { IDConfigs } from "interfaces/Admin/Configs.interface";

const ConfigsSchema = new Schema
    (
        {

            smtp: {
                type: Object,
                default: {},
            },

            smtp_emails: {
                type: Array,
                default: [],
            },

            webhooks_urls: {
                type: Array,
                default: [],
            },

            company: {
                type: Object,
                default: {},
            },

            payment_methods: {
                type: Array,
                default: [],
            },

            extra: {
                type: Object,
                default: {},
            }

        }
    );

const ConfigModel = model<IDConfigs>("configs", ConfigsSchema);

export default ConfigModel;