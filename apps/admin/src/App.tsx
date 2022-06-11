import { Admin, CustomRoutes, Resource } from 'react-admin';
import Dashboard from "./components/Dashboard";
import authProvider from "./components/authProvider";
import dataProvider from './components/dataProvider';
import { CustomerList } from "./components/customers/Field";
import { CreateCustomer } from "./components/customers/Create";
import { EditCustomer } from "./components/customers/Edit";
import { CreateInvoices } from "./components/invoices/Create";
import { InvoicesList } from "./components/invoices/List";
import { EditInvoices } from "./components/invoices/Edit";
import { CreateTransactions } from "./components/transactions/Create";
import { ListTransactions } from "./components/transactions/List";
import { CreateProducts } from './components/products/Create';
import { CreateCategory } from './components/categories/Create';
import { ListProducts } from './components/products/List';
import { EditProducts } from './components/products/Edit';
import { CreateOrders } from './components/orders/Create';
import { OrderList } from './components/orders/List';
import { EditOrders } from './components/orders/Edit';
import { EditTrans } from './components/transactions/Edit';
import { ListCategory } from './components/categories/List';
import { EditCategory } from './components/categories/Edit';
import { configurable_options_List } from './components/configurable_options/List';
import { Create_configurable_options } from './components/configurable_options/Create';
import { Edit_configurable_options } from './components/configurable_options/Edit';
import { CreateImage } from './components/images/Create';
import { ListImage } from './components/images/List';
import ListPromotionCodes from './components/promotion_codes/List';
import CreatePromotionCode from './components/promotion_codes/Create';
import EditPromotionCode from './components/promotion_codes/Edit';
import ListQuotes from './components/quotes/List';
import CreateQuote from './components/quotes/Create';
import EditQuote from './components/quotes/Edit';
import { ShowCustomer } from './components/customers/Show';
import { Route } from 'react-router-dom';
import SendEmailRoute from './components/routes/SendEmail';
// import EmailTemplateRoute from './components/routes/EmailTemplates';
import { ListEmailTemplates } from './components/email_templates/List';
import { CreateEmailTemplate } from './components/email_templates/Create';

function App()
{
  return (
    <>
      <Admin dashboard={Dashboard} authProvider={authProvider} dataProvider={dataProvider}>
        <Resource options={{
          label: 'Categories',
        }} name="v2/categories" list={ListCategory} create={CreateCategory} edit={EditCategory} />
        <Resource options={{
          label: 'Customers'
        }} name="v2/customers" list={CustomerList} create={CreateCustomer} edit={EditCustomer} show={ShowCustomer} />
        <Resource options={{
          label: "Invoices",
        }} name="v2/invoices" list={InvoicesList} create={CreateInvoices} edit={EditInvoices} />
        <Resource options={{
          label: "Products",
        }} name="v2/products" list={ListProducts} create={CreateProducts} edit={EditProducts} />
        <Resource options={{
          label: 'Orders',
        }} name="v2/orders" list={OrderList} create={CreateOrders} edit={EditOrders} />
        <Resource options={{
          label: 'Images',
        }} name="v2/images" list={ListImage} create={CreateImage} />
        <Resource options={{
          label: 'Quotes',
        }} name="v2/quotes" list={ListQuotes} create={CreateQuote} edit={EditQuote} />
        <Resource options={{
          label: 'Promotion codes',
        }} name="v2/promotion_codes" list={ListPromotionCodes} create={CreatePromotionCode} edit={EditPromotionCode} />
        <Resource options={{
          label: 'Transactions',
        }} name="v2/transactions" list={ListTransactions} create={CreateTransactions} edit={EditTrans} />
        <Resource options={{
          label: 'Configurable Options',
        }} name="v2/configurable_options" list={configurable_options_List} create={Create_configurable_options} edit={Edit_configurable_options} />

        <Resource options={{
          label: 'Email templates',
        }} name="v3/emails/templates" list={ListEmailTemplates} create={CreateEmailTemplate} />

        <CustomRoutes>
          <Route path='/emails' element={<SendEmailRoute />} />
        </CustomRoutes>

      </Admin>
    </>
  );
}

export default App;
