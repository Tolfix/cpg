import { Button } from "react-admin";

/**
 * 
 * @stackoverflow https://stackoverflow.com/questions/4068373/center-a-popup-window-on-screen
 */
export const popupCenter = ({ url, title, w, h }: {
    url: string,
    title: string,
    w: number,
    h: number
}) =>
{
    // Fixes dual-screen position                             Most browsers      Firefox
    const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    const systemZoom = width / window.screen.availWidth;
    const left = (width - w) / 2 / systemZoom + dualScreenLeft;
    const top = (height - h) / 2 / systemZoom + dualScreenTop;
    window.open(url, title,
        `
        scrollbars=yes,
        width=${w / systemZoom}, 
        height=${h / systemZoom}, 
        top=${top}, 
        left=${left}
      `
    )
}

export const PDFButton = (props: any) =>
{
    const {
        record,
    } = props;

    function downloadPDF()
    {
        const url = process.env.REACT_APP_CPG_DOMAIN + '/v2/invoices/' + record.id + '/preview' + `?access_token=${JSON.parse(localStorage.getItem("auth") ?? "{}").token}`;
        // window.open(url, '_blank');
        popupCenter({
            url: url,
            title: "Invoice",
            w: 1000,
            h: 1000
        })
    }

    return (
        <>

            <Button onClick={downloadPDF}>
                <>
                    Preview
                </>
            </Button>

        </>
    );
};