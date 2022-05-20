import { Model } from "mongoose";
import { Request } from "express"
import { MongooseQueryParser } from "mongoose-query-parser";
const p = new MongooseQueryParser();

// @ts-ignore
export default async function MongoFind<T>(model: Model<T>, query: Request["query"], eQuery?: any)
{
    // Find _end and _sort and replace _end and _sort with end and sort
    Object.keys(query).forEach(key =>
    {
        if (key === "_end")
        {
            query.limit = query[key];
            delete query[key];
        }
        else if (key === "_start")
        {
            query.skip = query[key];
            delete query[key];
        }
        else if (key === "_order")
        {
            query.sort = query[key];
            delete query[key];
        }
    });

    const data = p.parse(query);

    const b = model.find({
        ...data.filter,
        ...eQuery ?? {}
    }).sort(data.sort ?? "1").skip(data.skip ?? 0).limit(data.limit ?? 100000);

    if (data.select)
        b.select(data.select);

    if (data.populate)
        b.populate(data.populate);

    const c = await b.exec();

    // Total count
    // @ts-ignore
    const count = await model.countDocuments({
        ...data.filter,
        ...eQuery ?? {},
    });

    const all = await model.countDocuments();

    return {
        data: c,
        totalPages: Math.ceil(count / (data.limit ?? 10)),
        totalCount: count,
        totalInAll: all,
    }
}