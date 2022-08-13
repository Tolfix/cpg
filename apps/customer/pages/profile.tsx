import { ICustomer } from "interfaces/Customer.interface";
import { GetServerSideProps } from "next";
import { mustAuth } from "../lib/Auth";
import TokenValid from "../lib/TokenValid";
import { useState } from "react";
import { Modal } from "../components/Modal";
import Head from "next/head";
import Navigation from "../components/Navigation";
import { ICompanyData } from "../interfaces/CompanyData";

export const currencyCodes = ["AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BOV", "BRL", "BSD", "BTN", "BWP", "BYR", "BZD", "CAD", "CDF", "CHE", "CHF", "CHW", "CLF", "CLP", "CNY", "COP", "COU", "CRC", "CUC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LTL", "LVL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRO", "MUR", "MVR", "MWK", "MXN", "MXV", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLL", "SOS", "SRD", "SSP", "STD", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "USN", "USS", "UYI", "UYU", "UZS", "VEF", "VND", "VUV", "WST", "XAF", "XAG", "XAU", "XBA", "XBB", "XBC", "XBD", "XCD", "XDR", "XFU", "XOF", "XPD", "XPF", "XPT", "XTS", "XXX", "YER", "ZAR", "ZMW"];

export default ({
    profile,
    token,
    cpg_domain,
    company
}:
    {
        profile: ICustomer;
        token: string;
        cpg_domain: string;
        company: ICompanyData
    }) =>
{
    const [profilePicture, setProfilePicture] = useState<string>("");
    const [showModal, setShowModal] = useState(false);

    const saveProfile = (target: string) =>
    {
        return async (e: { preventDefault: () => void; target: any; }) =>
        {
            e.preventDefault();
            const form = e.target;
            const data = {
                [target]: form[target].value
            }
            await fetch(`${cpg_domain}/v2/customers/my/profile`,
                {
                    method: 'PUT',
                    headers:
                    {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                })
        }
    }

    if (profile.profile_picture)
        fetch(`${cpg_domain}/v2/images/${profile.profile_picture}`).then(e => e.json()).then(data =>
        {
            setProfilePicture(data.data);
        });

    const changeProfilePicture = (e: { preventDefault: () => void; target: any; }) =>
    {
        e.preventDefault();
        const form = e.target;
        const data = new FormData();
        console.log(form.profile_picture.files);
        data.append("image", form.profile_picture.files[0]);
        fetch(`${cpg_domain}/v2/customers/my/profile_picture`, {
            method: "POST",
            headers:
            {
                "Authorization": `Bearer ${token}`
            },
            body: data
        }).then(e => e.json()).then(e =>
        {
            setProfilePicture(e.data);
        });
    };
    // Check if profile picture, and if true set it to the profile picture
    return (
        <>
            <Head>
                <title>Profile</title>
            </Head>
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                title="Edit Profile Picture"
            >
                <form onSubmit={changeProfilePicture}>
                    <div className="flex justify-center m-14 mx-10">
                        <div className="mb-3">
                            <label
                                htmlFor="profile_picture"
                                className="form-label inline-block mb-2 text-gray-700"
                            >
                                Max file size: 5 GB
                            </label>
                            <input name="profile_picture" className="
                                form-control
                                block w-full px-2 py-1.5 text-xl font-normal
                                text-gray-700 bg-white bg-clip-padding
                                border border-solid border-gray-300 rounded transition
                                ease-in-out m-0
                                focus:text-gray-700 focus:bg-white 
                                focus:border-blue-600 focus:outline-none"
                                id="profile_picture"
                                type="file"
                                accept="image/png, image/jpg, image/jpeg"
                            />
                            <button className="border border-indigo-300 p-3 rounded" type="submit">
                                Upload
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>
            <Navigation profile={profile} company={company}>

                {/* Customer interface, possible to edit each field and save each one */}
                {/* Each as a form input which goes to POST /v2/customers/my/profile */}
                {/* Also using tailwind css to make life easier */}
                <div>
                    <div className="flex flex-wrap justify-center items-center mt-2">
                        <div className="">
                            <div className="text-center">
                                <div className="text-gray-700 text-xl font-bold grid">

                                    {/* Profile picture */}
                                    {/* Portfolio of user */}
                                    <div className="flex flex-col bg-white rounded p-5">
                                        {profile.profile_picture ? <>
                                            <div className="text-center justify-center items-center">
                                                <span className="relative inline-flex">
                                                    <img src={`data:image/png;base64,${profilePicture}`} alt="Profile Picture" className="rounded-full w-52" />
                                                    <span className="flex absolute h-3 w-3 top-0 right-5">
                                                        {/* Edit button */}
                                                        <button onClick={() => setShowModal(true)} className="text-indigo-600 hover:text-indigo-900 px-4">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                                                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </span>
                                                </span>
                                            </div>
                                        </> : <>

                                            <button onClick={() => setShowModal(true)} className="text-indigo-600 hover:text-indigo-900 px-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                        </>}
                                        <hr />
                                        <div className="text-left mt-2 grid grid-cols-2">
                                            {/* Information about customer */}
                                            {/* Eeach infromation should be editable */}
                                            <div className="m-5">
                                                <h2 className="text-indigo-300 font-mono">Personal Information</h2>
                                                <div className="">
                                                    <form onSubmit={saveProfile("personal.first_name")}>
                                                        <label htmlFor="">First name</label>
                                                        <div className="flex flex-wrap">
                                                            <input name="personal.first_name" type="text" defaultValue={`${profile.personal.first_name}`} />
                                                            <button
                                                                type="submit"
                                                                className="bg-indigo-300 hover:bg-indigo-400 cursor-pointer rounded px-1">
                                                                Save
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className="mt-2">
                                                    <form onSubmit={saveProfile("personal.last_name")}>
                                                        <label htmlFor="">Last name</label>
                                                        <div>
                                                            <input name="personal.last_name" type="text" defaultValue={`${profile.personal.last_name}`} />
                                                            <button
                                                                type="submit"
                                                                className="bg-indigo-300 hover:bg-indigo-400 cursor-pointer rounded px-1">
                                                                Save
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className="mt-2">
                                                    <form onSubmit={saveProfile("personal.email")}>
                                                        <label htmlFor="">Email</label>
                                                        <div>
                                                            <input name="personal.email" type="text" defaultValue={`${profile.personal.email}`} />
                                                            <button
                                                                type="submit"
                                                                className="bg-indigo-300 hover:bg-indigo-400 cursor-pointer rounded px-1">
                                                                Save
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className="mt-2">
                                                    <form onSubmit={saveProfile("personal.email")}>
                                                        <label htmlFor="">Phone</label>
                                                        <div>
                                                            <input name="personal.phone" type="text" defaultValue={`${profile.personal.phone}`} />
                                                            <button
                                                                type="submit"
                                                                className="bg-indigo-300 hover:bg-indigo-400 cursor-pointer rounded px-1">
                                                                Save
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                            <div className="m-5">
                                                <h2 className="text-indigo-300 font-mono">Billing Information</h2>
                                                <div className="">
                                                    <form onSubmit={saveProfile("billing.company")}>
                                                        <label htmlFor="">Company</label>
                                                        <div>
                                                            <input name="billing.company" type="text" defaultValue={`${profile.billing.company ?? ""}`} />
                                                            <button
                                                                type="submit"
                                                                className="bg-indigo-300 hover:bg-indigo-400 cursor-pointer rounded px-1">
                                                                Save
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className="mt-2">
                                                    <form onSubmit={saveProfile("billing.company_vat")}>
                                                        <label htmlFor="">VAT</label>
                                                        <div>
                                                            <input name="billing.company" type="text" defaultValue={`${profile.billing.company_vat ?? ""}`} />
                                                            <button
                                                                type="submit"
                                                                className="bg-indigo-300 hover:bg-indigo-400 cursor-pointer rounded px-1">
                                                                Save
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className="mt-2">
                                                    <form onSubmit={saveProfile("billing.counry")}>
                                                        <label htmlFor="">Country</label>
                                                        <div>
                                                            <input name="billing.company" type="text" defaultValue={`${profile.billing.country}`} />
                                                            <button
                                                                type="submit"
                                                                className="bg-indigo-300 hover:bg-indigo-400 cursor-pointer rounded px-1">
                                                                Save
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className="mt-2">
                                                    <form onSubmit={saveProfile("billing.postcode")}>
                                                        <label htmlFor="">Postcode</label>
                                                        <div>
                                                            <input name="billing.postcode" type="text" defaultValue={`${profile.billing.postcode}`} />
                                                            <button
                                                                type="submit"
                                                                className="bg-indigo-300 hover:bg-indigo-400 cursor-pointer rounded px-1">
                                                                Save
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className="mt-2">
                                                    <form onSubmit={saveProfile("billing.state")}>
                                                        <label htmlFor="">State</label>
                                                        <div>
                                                            <input name="billing.state" type="text" defaultValue={`${profile.billing.state}`} />
                                                            <button
                                                                type="submit"
                                                                className="bg-indigo-300 hover:bg-indigo-400 cursor-pointer rounded px-1">
                                                                Save
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className="mt-2">
                                                    <form onSubmit={saveProfile("billing.street01")}>
                                                        <label htmlFor="">Street</label>
                                                        <div>
                                                            <input name="billing.state" type="text" defaultValue={`${profile.billing.street01}`} />
                                                            <button
                                                                type="submit"
                                                                className="bg-indigo-300 hover:bg-indigo-400 cursor-pointer rounded px-1">
                                                                Save
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className="mt-2">
                                                    <form onSubmit={saveProfile("currency")}>
                                                        <label htmlFor="">Currency</label>
                                                        <div>
                                                            <select name="currency" id="">
                                                                {currencyCodes.map(currency =>
                                                                (
                                                                    (currency === profile.currency ?
                                                                        <>
                                                                            <option key={currency} value={currency} selected>
                                                                                {currency}
                                                                            </option>
                                                                        </>
                                                                        :
                                                                        <>
                                                                            <option key={currency} value={currency}>
                                                                                {currency}
                                                                            </option>
                                                                        </>
                                                                    )
                                                                ))}
                                                            </select>
                                                            {/* <input name="Currency" type="text" defaultValue={`${profile.currency ?? ""}`} /> */}
                                                            <button
                                                                type="submit"
                                                                className="bg-indigo-300 hover:bg-indigo-400 cursor-pointer rounded px-1">
                                                                Save
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Navigation>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
{
    const session = await mustAuth(true, context);
    if (!session)
        return {
            props: {}
        };

    // @ts-ignore
    const token = session?.user.email as string
    if (!(await TokenValid(token, context)))
        return {
            props: {}
        };

    const profile = await fetch(`${process.env.CPG_DOMAIN}/v2/customers/my/profile`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }).then(res => res.json());

    return {
        props: {
            profile,
            token: token,
            cpg_domain: process.env.CPG_DOMAIN
        }
    };
}