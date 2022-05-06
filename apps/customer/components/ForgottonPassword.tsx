import { useState } from "react";

export default () =>
{

    const [message, setMessage] = useState("");

    const forgottenPassword = async (e: { preventDefault: () => void; target: any; }) =>
    {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const res = await fetch(`/api/resetpassword`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
            })
        });

        if (res.status == 200)
            return setMessage("An email has been sent to you with instructions on how to reset your password.");

        return setMessage("That email address is not registered.");
    }

    return (
        <>

            {/* Email input, then butto to send request to new password with tailwind */}
            <div className="flex flex-col justify-center items-center h-screen w-screen">
                <div className="max-w-xs">
                    <div className="text-xl font-bold px-4 pt-6 pb-8 mb-4">
                        <div>
                            <span className="text-sm font-mono">{message}</span>
                        </div>
                        <form onSubmit={forgottenPassword}>
                            <div className="mb-4">
                                <label className="text-sm font-bold mb-2" htmlFor="email">
                                    Email
                                </label>
                                <input name='email' className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="text" placeholder="Email" required />
                            </div>
                            <div className="mb-4">
                                <button className="bg-transparent hover:bg-blue-500 font-semibold py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                                    Send
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>



        </>
    )
} 