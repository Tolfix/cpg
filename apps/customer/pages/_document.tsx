import Document, { Html, Head, Main, NextScript } from "next/document";

// skipcq: JS-D1001 

export default class _Document extends Document
{
    // skipcq: JS-D1001 
    render()
    {
        return (
            <>
                <Html lang="en">
                    <Head>
                        <meta charSet="utf-8" />
                        <link rel="manifest" href="/manifest.json" />
                        <meta name="theme-color" content="#4aa447" />
                    </Head>
                    <body className="">
                        <Main />
                        <NextScript />
                        <div id="modal-root"></div>
                    </body>
                </Html>
            </>
        )
    }
} 