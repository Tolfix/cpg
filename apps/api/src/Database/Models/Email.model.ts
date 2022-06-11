import { IEmailTemplate } from "interfaces/Email.interface";
import mongoose, { model, Schema } from "mongoose"
import increment from "mongoose-auto-increment";
import { Default_Language, MongoDB_URI } from "../../Config";
import GetText from "../../Translation/GetText";

const EmailTemplateSchema = new Schema
    (
        {

            id: Number,

            name: {
                type: String,
                required: true,
            },

            body: {
                type: String,
                required: true,
            },

        },
        {
            timestamps: true,
        }
    );


const connection = mongoose.createConnection(MongoDB_URI);
increment.initialize(connection);

EmailTemplateSchema.plugin(increment.plugin, {
    model: 'email_template',
    field: 'id',
    startAt: 1,
    incrementBy: 1
});

const EmailTemplateModel = model<IEmailTemplate & Document>("email_template", EmailTemplateSchema);

export default EmailTemplateModel;