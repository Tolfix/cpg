// noinspection JSValidateJSDoc

import { Default_Language } from "../Config";
import { IAllLanguages } from "interfaces/Lang/AllLang.interface";
import { IGetText } from "interfaces/Lang/GetText.interface";

export default (lang: keyof IAllLanguages = Default_Language): IGetText =>
{
    // Make a translation, depending on the lang later
    // for now lets set it as default = en

    return require(`./${lang}/Lang_${lang}.js`) as IGetText;
};