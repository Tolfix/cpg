import type { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) =>
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