import { Request, Response } from "express";
import MongoFind from "../Lib/MongoFind";

export default class BaseModelAPI<IModel extends { uid: string }>
{
    private idFunction;
    private iModel;

    constructor(
        idFunction: () => string,
        iModel: any
    )
    {
        this.idFunction = idFunction;
        this.iModel = iModel;
    }

    public create(data: (IModel)): Promise<IModel>
    {
        try
        {

            data.uid = this.idFunction();
            const a = new this.iModel(data)
            return a.save();
        }
        catch (error)
        {
            return Promise.reject(error);
        }
    }

    public findByUid(uid: IModel["uid"]): Promise<IModel | []>
    {
        if (!uid || uid === "undefined")
            return Promise.resolve([]);
        return this.iModel.findOne({
            $or: [
                { id: uid },
                { uid: uid }
            ]
        }).then((result: any) =>
        {
            if (!result)
                return;

            const r = result.toJSON();
            //@ts-ignore
            delete r._id;
            delete r.__v;
            return r;
        });
    }

    public findAll(query: Request["query"], res: Response): Promise<Array<IModel>>
    {
        return new Promise((resolve, reject) =>
        {
            MongoFind(this.iModel, query).then((result) =>
            {
                const r = result.data.map((i: any) =>
                {
                    const r = i.toJSON();
                    //@ts-ignore
                    delete r.__v;
                    return r;
                });

                res.setHeader("X-Total-Pages", result.totalPages);
                res.setHeader("X-Total", result.totalInAll);
                res.setHeader("X-Total-Count", result.totalCount);
                if (query["include_x"])
                    return resolve({
                        // @ts-ignore
                        data: r,
                        totalPages: result.totalPages,
                        totalCount: result.totalCount
                    })
                resolve(r);
            }).catch(reject);
        });
    }

    public findAndPatch(
        uid: IModel["uid"],
        data: IModel
    ): Promise<IModel>
    {
        // The data should be filter, thus meaning we will delete the objects _id to ensure
        // it doesn't complain
        // It has to go through deep search and delete
        // So we need to recursively search for the object
        // So we create a method that takes data, and then deep search for _id and if we
        // find it we delete it from object
        // We then return the object
        function removeKeys(obj: any, keys: string[]): any
        {
            if (Array.isArray(obj)) return obj.map(item => removeKeys(item, keys));

            if (typeof obj === 'object' && obj !== null)
            {
                return Object.keys(obj).reduce((previousValue, key) =>
                {
                    return keys.includes(key) ? previousValue : { ...previousValue, [key]: removeKeys(obj[key], keys) };
                }, {});
            }

            return obj;
        }
        try
        {

            if (!uid || uid === "undefined")
                return Promise.reject("No uid provided");


            const newData = removeKeys(data, ["_id"]);

            return this.iModel.findOneAndUpdate({
                $or: [
                    { id: uid },
                    { uid: uid }
                ]
            }, newData);
        }
        catch (error)
        {
            return Promise.reject(error);
        }
    }

    public removeByUid(uid: IModel["uid"])
    {
        try
        {

            if (!uid || uid === "undefined")
                return Promise.resolve([]);
            return new Promise((resolve, reject) =>
            {
                this.iModel.deleteOne({
                    $or: [
                        { id: uid },
                        { uid: uid }
                    ]
                }, (err: any) =>
                {
                    if (err)
                    {
                        reject(err);
                    }
                    else
                    {
                        resolve(err);
                    }
                });
            });
        }
        catch (error)
        {
            return Promise.reject(error);
        }
    }
}