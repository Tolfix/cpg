import mongoose, { model, Schema } from "mongoose"
import increment from "mongoose-auto-increment";
import { MongoDB_URI } from "../../Config";
import { IDIAdministrator } from "interfaces/Admin/Administrators.interface";
import GetText from "../../Translation/GetText";

const AdminSchema = new Schema
    (
        {

            id: {
                type: Number,
                required: true,
            },

            uid: {
                type: String,
                required: false,
                description: GetText().txt_Uid_Description,
            },

            username: {
                type: String,
                required: true,
            },

            password: {
                type: String,
                required: true,
            },

            createdAt: {
                type: Date,
                default: Date.now,
            },

        }
    );

const connection = mongoose.createConnection(MongoDB_URI);
increment.initialize(connection);

AdminSchema.plugin(increment.plugin, {
    model: 'admin',
    field: 'id',
    startAt: 1,
    incrementBy: 1
});

const AdminModel = model<IDIAdministrator>("admin", AdminSchema);

export default AdminModel;