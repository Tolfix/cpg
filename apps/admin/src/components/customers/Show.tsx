import { EditButton, Show, Tab, TabbedShowLayout, TextField, TopToolbar } from "react-admin"

const Actions = () =>
{
    return (
        <TopToolbar>
            <EditButton />
        </TopToolbar>
    )
}

export const ShowCustomer = (props: any) =>
{
    return (
        <Show actions={<Actions />} {...props}>
            <TabbedShowLayout>
                <Tab label={"Personal"}>
                    <TextField label="Id" source="id" />
                    <TextField label="First name" source="personal.first_name" />
                    <TextField label="Last name" source="personal.last_name" />
                    <TextField label="Notes" source="notes" />
                    <TextField label="Email" source="personal.email" />
                    <TextField label="Phone" source="personal.phone" />
                </Tab>
                <Tab label="Billing">
                    <TextField label="Company" source="billing.company" />
                    <TextField label="Vat" source="billing.company_vat" />
                    <TextField label="Street" source="billing.street01" />
                    <TextField label="Street 2" source="billing.street02" />
                    <TextField label="Country" source="billing.country" />
                    <TextField label="City" source="billing.city" />
                    <TextField label="State" source="billing.state" />
                    <TextField label="Postcode" source="billing.postcode" />
                    <TextField label="Currency" source="currency" />
                </Tab>
            </TabbedShowLayout>
        </Show>
    )
}