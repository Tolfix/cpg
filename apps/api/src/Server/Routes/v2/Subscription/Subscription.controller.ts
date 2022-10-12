import { Request, Response } from "express";
import SubscriptionModel from "../../../../Database/Models/Subscriptions.model";
import { ISubscription } from "interfaces/Subscriptions.interface";
import { idSubscription } from "../../../../Lib/Generator";
import { APISuccess } from "../../../../Lib/Response";
import BaseModelAPI from "../../../../Models/BaseModelAPI";

const API = new BaseModelAPI<ISubscription>(idSubscription, SubscriptionModel);

/**
 * > This function creates a new API record using the data in the request body, and returns the new record's ID to the
 * client
 * @param {Request} req - Request - The request object
 * @param {Response} res - Response - The response object that will be sent back to the client.
 */
function insert(req: Request, res: Response)
{
    API.create(req.body)
        .then((result) =>
        {

            APISuccess({
                id: result.id
            })(res);
        });
}

/**
 * > This function is called when a user makes a GET request to the `./subscriptions/:uid` endpoint
 * @param {Request} req - Request - The request object
 * @param {Response} res - Response - The response object that will be sent back to the client.
 */
function getByUid(req: Request, res: Response)
{
    API.findByUid((req.params.uid as ISubscription["uid"])).then((result) =>
    {
        APISuccess(result)(res);
    });
}

/**
 * `list` is a function that takes a `Request` and a `Response` and returns a `Promise` that resolves to a `Response`
 * @param {Request} req - Request - This is the request object that is passed to the function.
 * @param {Response} res - Response - The response object from the express server
 */
function list(req: Request, res: Response)
{
    API.findAll(req.query, res).then((result: any) =>
    {
        APISuccess(result)(res)
    })
}

/**
 * > Finds a subscription by its unique identifier and patches it with the request body
 * @param {Request} req - Request - The request object
 * @param {Response} res - Response - The response object from express
 */
function patch(req: Request, res: Response)
{
    API.findAndPatch((req.params.uid as ISubscription["uid"]), req.body).then((result) =>
    {
        APISuccess(result)(res);
    });
}

/**
 * > It removes a subscription by its unique identifier
 * @param {Request} req - Request - The request object
 * @param {Response} res - Response - The response object that will be sent back to the client.
 */
function removeById(req: Request, res: Response)
{
    API.removeByUid(req.params.uid as ISubscription["uid"])
        .then(() =>
        {
            APISuccess({}, 204)(res)
        });
}


const PromotionCodeController = {
    insert,
    getByUid,
    list,
    patch,
    removeById,
}

export default PromotionCodeController;
