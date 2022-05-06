import { ICategory } from "interfaces/Categories.interface";
import mongoose, { model, Schema } from "mongoose"
import increment from "mongoose-auto-increment";
import { Default_Language, MongoDB_URI } from "../../Config";
import Logger from "../../Lib/Logger";
import GetText from "../../Translation/GetText";

const CategorySchema = new Schema
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
                required: true,
            },

            image: {
                type: [Number],
                default: [],
            },

            private: {
                type: Boolean,
                required: true,
            },

        },
        {
            timestamps: true,
        }
    );

// Log when creation
// @ts-ignore
CategorySchema.post('save', function (doc: ICategory & Document)
{
    Logger.db(GetText(Default_Language).database.txt_Model_Created(doc.nodeName, doc.id));
    // Logger.db(`Created category ${doc.id}`);
});

const connection = mongoose.createConnection(MongoDB_URI);
increment.initialize(connection);

CategorySchema.plugin(increment.plugin, {
    model: 'category',
    field: 'id',
    startAt: 1,
    incrementBy: 1
});

const CategoryModel = model<ICategory & Document>("category", CategorySchema);

export default CategoryModel;