import bcrypt from "bcryptjs";
import { CacheAdmin, getAdminByUsername } from "../Cache/Admin.cache";
import AdminModel from "../Database/Models/Administrators.model";
import { idAdmin } from "../Lib/Generator";
import Logger from "@cpg/logger";

const log = new Logger("cpg:api:admin:CreateAdmin");

export default function createAdmin(username: string, password: string)
{
    if (CacheAdmin.get(getAdminByUsername(username) ?? 'ADM_'))
        return log.warn(`Administrator ${username} already exists`);

    bcrypt.genSalt(10, (err, salt) =>
    {
        bcrypt.hash(password, salt, (err, hash) =>
        {
            if (err)
                return log.error(err);

            const info = {
                username,
                password: hash,
                uid: idAdmin(),
                createdAt: new Date()
            };

            new AdminModel(info).save();
            CacheAdmin.set(info.uid, info);
        });
    });
}