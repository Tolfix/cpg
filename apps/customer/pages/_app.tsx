import '../styles/globals.css';
import type { AppProps } from 'next/app'
import { Layout } from '../components/Layout'
import { SessionProvider } from 'next-auth/react'
import { ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import getCompanyData from '../lib/Company.fetch';
import App from 'next/app';

function MyApp({ Component, pageProps }: AppProps)
{
  return (
    <>
      <ChakraProvider>
        <SessionProvider session={pageProps.session}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SessionProvider>
      </ChakraProvider>
    </>
  )
}

MyApp.getInitialProps = async (context) =>
{
  const { req } = context.ctx;
  const ishttps = req.headers['x-forwarded-proto'] === 'https';
  const company = await getCompanyData(`${ishttps ? 'https' : 'http'}://${req.headers.host}/api/info/company`);
  const appProps = await App.getInitialProps(context);
  appProps.pageProps.company = company;
  return {
    ...appProps,
  }
}

export default MyApp;