export const PDFButton = (props: any) =>
{
    const {
        basePath = '',
        icon = "defaultIcon",
        label = 'ra.action.edit',
        record,
        scrollToTop = true,
        ...rest
    } = props;

    function downloadPDF()
    {
        const url = process.env.REACT_APP_CPG_DOMAIN + '/v2/invoices/' + record.id + '/pdf';
        fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + `${JSON.parse(localStorage.getItem("auth") ?? "{}").token}`,
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
            }
        }).then(response => response.blob())
            .then(blob =>
            {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `invoice${record.id}.pdf`;
                document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
                a.click();
                a.remove();  //afterwards we remove the element again         
            });
    }

    return (
        <>

            <a href='#' onClick={downloadPDF}>
                PDF
            </a>

        </>
    );
};