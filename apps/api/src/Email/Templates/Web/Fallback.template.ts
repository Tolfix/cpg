import { Request } from "express";
import Header from "../General/Header";

export default async function FallbackTemplate({
    req
}: {
    req: Request,
})
{
    return `
    <html>
        <head>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-family: sans-serif;
                }

                code {
                    background-color: #fafafa;
                    padding: 5px;
                    border-radius: 5px;
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: #000;
                }
            </style>
        </head>
        <body>
            <div>
                ${await Header()}
                <div style="text-align:center;">
                    Whoops, something went wrong viewing <code>${req.originalUrl}</code>
                </div>
            </div>
        </body>
    </html>
    `
}