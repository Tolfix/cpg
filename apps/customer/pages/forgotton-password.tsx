import { GetServerSideProps } from "next";
import ForgottonPassword from "../components/ForgottonPassword";
import { mustAuth } from "../lib/Auth";

export default () => <ForgottonPassword />

// skipcq: JS-D1001 
export const getServerSideProps: GetServerSideProps = async (context) =>
{
    mustAuth(false, context);

    return {
        props: {

        }
    };

}