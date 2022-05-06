import { GetServerSideProps } from "next";
import Login from "../components/Login";
import { mustAuth } from "../lib/Auth";

export default () => <Login />

export const getServerSideProps: GetServerSideProps = async (context) =>
{
    const session = await mustAuth(false, context);
    if (!session)
        return {
            props: {}
        };

    return {
        props: {

        }
    };

}