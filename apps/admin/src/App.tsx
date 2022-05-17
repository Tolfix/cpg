import { Admin, Resource } from 'react-admin';
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

function App()
{
  return (
    <>
      <Admin dashboard={Dashboard} authProvider={authProvider} dataProvider={dataProvider}>
        <Resource name="categories" list={ListCategory} create={CreateCategory} edit={EditCategory} />
        <Resource name="customers" list={CustomerList} create={CreateCustomer} edit={EditCustomer} show={ShowCustomer} />
        <Resource name="invoices" list={InvoicesList} create={CreateInvoices} edit={EditInvoices} />
        <Resource name="products" list={ListProducts} create={CreateProducts} edit={EditProducts} />
        <Resource name="orders" list={OrderList} create={CreateOrders} edit={EditOrders} />
        <Resource name="images" list={ListImage} create={CreateImage} />
        <Resource name="quotes" list={ListQuotes} create={CreateQuote} edit={EditQuote} />
        <Resource name="promotion_codes" list={ListPromotionCodes} create={CreatePromotionCode} edit={EditPromotionCode} />
        <Resource name="transactions" list={ListTransactions} create={CreateTransactions} edit={EditTrans} />
        <Resource name="configurable_options" list={configurable_options_List} create={Create_configurable_options} edit={Edit_configurable_options} />
      </Admin>
    </>
  );
}

export default App;
