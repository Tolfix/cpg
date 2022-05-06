import { GetServerSideProps } from "next";
import ForgottonPassword from "../components/ForgottonPassword";
import { mustAuth } from "../lib/Auth";

export default () => <ForgottonPassword />

export const getServerSideProps: GetServerSideProps = async (context) =>
{
    mustAuth(false, context);

    return {
        props: {

        }
    };

}