import request from "request";

/**
 * It takes a URL, makes a request to that URL, and returns a promise that resolves to a base64 encoded buffer
 * @param {string} url - The URL of the image you want to convert to base64.
 * @returns A promise that resolves to a buffer
 */
export default function urlToBase64(url: string): Promise<Buffer>
{
    return new Promise((resolve, reject) =>
    {
        request({ url, encoding: null }, (error, response, body) =>
        {
            if (!error && response.statusCode === 200)
                return resolve(Buffer.from(body, 'base64'));
            return reject(`Failed to get`);
        });
    });
}