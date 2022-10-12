import { Request, Response } from "express";
import PromotionCodeModel from "../../../../Database/Models/PromotionsCode.model";
// import mainEvent from "../../../../Events/Main.event";
import { IPromotionsCodes } from "interfaces/PromotionsCodes.interface";
import { idCategory } from "../../../../Lib/Generator";
import { APISuccess } from "../../../../Lib/Response";
import BaseModelAPI from "../../../../Models/BaseModelAPI";

// @ts-ignore
const API = new BaseModelAPI<IPromotionsCodes>(idCategory, PromotionCodeModel);

/**
 * It creates a new API record using the data in the request body, and then returns the new record's ID to the client
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
 * > This function is called when a user makes a GET request to the `./:uid` endpoint. It calls the `findByUid`
 * function in the `API` class, passing in the `uid` parameter from the request. If the `findByUid` function returns a
 * result, it calls the `APISuccess` function, passing in the result and the response object
 * @param {Request} req - Request - The request object
 * @param {Response} res - Response - The response object that will be sent back to the client.
 */
function getByUid(req: Request, res: Response)
{
    API.findByUid((req.params.uid)).then((result) =>
    {
        APISuccess(result)(res);
    });
}

/**
 * A function that is called when a GET request is made to the "/" endpoint. It calls the findAll function in
 * the API class and returns the result to the client.
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
 * "Find the category with the given ID and update it with the given data."
 * 
 * @param {Request} req - Request - The request object
 * @param {Response} res - Response - The response object that will be sent back to the client
 */
function patch(req: Request, res: Response)
{
    API.findAndPatch((req.params.uid), req.body).then((result) =>
    {
        // @ts-ignore
        // mainEvent.emit("categories_updated", result);
        APISuccess(result)(res);
    });
}

function removeById(req: Request, res: Response)
{
    API.removeByUid(req.params.uid)
        .then(() =>
        {
            // @ts-ignore
            // mainEvent.emit("", result);
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
