import { Request, Response } from "express";
import { APISuccess } from "../../../../Lib/Response";
import BaseModelAPI from "../../../../Models/BaseModelAPI";
import { IEmailTemplate } from "interfaces/Email.interface";
import EmailTemplateModel from "../../../../Database/Models/Email.model";

// @ts-ignore
const API = new BaseModelAPI<IEmailTemplate>(() => "", EmailTemplateModel);

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

function getByUid(req: Request, res: Response)
{
    API.findByUid((req.params.uid)).then((result) =>
    {
        APISuccess(result)(res);
    });
}

function list(req: Request, res: Response)
{
    API.findAll(req.query, res).then((result: any) =>
    {
        APISuccess(result)(res)
    });
}

function patch(req: Request, res: Response)
{
    API.findAndPatch((req.params.uid), req.body).then((result) =>
    {
        APISuccess(result)(res);
    });
}

function removeById(req: Request, res: Response)
{
    API.removeByUid(req.params.uid)
        .then(() =>
        {
            APISuccess({}, 204)(res)
        });
}


const EmailTemplatesController = {
    insert,
    getByUid,
    list,
    patch,
    removeById,
}

export default EmailTemplatesController;
