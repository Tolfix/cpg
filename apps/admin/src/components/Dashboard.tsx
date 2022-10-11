// in src/Dashboard.js
import * as React from "react";
// import { Card, CardContent, CardHeader } from '@material-ui/core';
import { ITransactions } from "interfaces/Transactions.interface";
import { Card, CardContent, CardHeader } from "@mui/material";
import { Link } from "react-router-dom";

export default () =>
{
    // Fetch the data from the server
    const [transactions, setTransactions] = React.useState<ITransactions<"income">[]>([]);
    const setAuth = () =>
    {
        return {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem("auth") ?? "{}").token}`
            }
        }
    }
    React.useEffect(() =>
    {
        // We want to fetch all our transactions income
        fetch(`${process.env.REACT_APP_CPG_DOMAIN}/v2/transactions?statement=income?limit=1000000`, setAuth())
            .then(response => response.json())
            .then(data =>
            {
                setTransactions(data);
            });

    }, []);

    return (
        <Card style={{ marginTop: "1rem" }}>
            <CardHeader title="Dashboard" />
            <CardContent>
                {/* have a box of links to routes */}
                <Link to="emails">Emails</Link>
            </CardContent>
        </Card>
    )
}