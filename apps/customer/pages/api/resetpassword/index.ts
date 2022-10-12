import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * It sends a password reset email to the user
 * @param {NextApiRequest} req - NextApiRequest - This is the request object that Next.js provides. It contains information
 * about the request, such as the body, query parameters, cookies, headers, and more.
 * @param {NextApiResponse} res - NextApiResponse - This is the response object that we will use to send back a response to
 * the client.
 * @returns A json object
 */
export default async function ResetPassword(req: NextApiRequest, res: NextApiResponse)
{
    if (req.method === 'POST')
    {
        const { email } = req.body;

        if (!email)
        {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }

        const response = await fetch(`${process.env.CPG_DOMAIN}/v2/customers/my/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
            })
        });

        if (response.status == 200)
            return res.json({ message: 'Password reset email sent' });

        return res.status(500).json({ message: 'Error sending password reset email' });

    }

}