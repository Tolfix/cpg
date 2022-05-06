import CategoryModel from "../../Database/Models/Category.model";
import { IProduct } from "interfaces/Products.interface";

export default async (product: IProduct) =>
{
    return CategoryModel.findOne({ id: product.category_uid });
}