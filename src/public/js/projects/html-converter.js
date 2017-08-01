function convertToPDF() {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://html-converter.openservices.co.za/api/convert/topdf', true);
    xhr.responseType = 'blob';
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.onload = function (e) {

        if (this.status == 200) {
            const blobObject = new Blob([this.response], { type: 'application/pdf' });

            const fileReader = new FileReader();

            fileReader.onload = function (e) {
                window.location.href = e.target.result;
            };
            fileReader.readAsDataURL(blobObject);
        }
    };

    xhr.send(JSON.stringify({
        html: $('#htmlConverter textarea[name=html]').val()
    }));
}

function convertToPNG() {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://html-converter.openservices.co.za/api/convert/topng', true);
    xhr.responseType = 'blob';
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.onload = function (e) {

        if (this.status == 200) {
            const blobObject = new Blob([this.response], { type: 'image/png' });

            const fileReader = new FileReader();

            fileReader.onload = function (e) {
                window.location.href = e.target.result;
            };
            fileReader.readAsDataURL(blobObject);
        }
    };

    xhr.send(JSON.stringify({
        html: $('#htmlConverter textarea[name=html]').val()
    }));
}