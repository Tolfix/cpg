import { Document, model, Schema } from "mongoose"
import Logger from "@cpg/logger";

const log = new Logger("cpg:api:database:mongo:models:passwordresets");

const PasswordResetSchema = new Schema
    (
        {

            token: {
                type: String,
                required: true,
            },

            email: {
                type: String,
                required: true,
            },

            used: {
                type: Boolean,
                default: false,
            }

        },
        {
            timestamps: true,
        }
    );

// Log when creation
PasswordResetSchema.post('save', function (doc: any)
{
    log.info(`Created password reset for ${doc.email}`);
});

export interface IPasswordReset
{
    token: string;
    email: string;
    used: boolean;
}

const PasswordResetModel = model<IPasswordReset & Document>("password_reset", PasswordResetSchema);

export default PasswordResetModel;