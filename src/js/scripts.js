$(document).ready(function() {

    var restActionMap = {
        'xml-to-pdf-cv-esp' : '/v1/document/to/pdf',
        'xml-to-pdf-esp-only' : '/v1/document/to/pdf-esp',
        'xml-to-pdf-cv-only': '/v1/document/to/pdf-cv',
        'xml-to-doc': '/v1/document/to/word',
        'xml-to-odt': '/v1/document/to/opendoc',
        'xml-to-json': '/v1/document/to/json',
        'xml-upgrade': '/v1/document/upgrade',
        'extract-xml': '/v1/document/extraction',
        'json-to-pdf-cv-esp': '/v1/document/to/pdf',
        'json-to-pdf-esp-only': '/v1/document/to/pdf-esp',
        'json-to-pdf-cv-only': '/v1/document/to/pdf-cv',
        'json-to-doc': '/v1/document/to/word',
        'json-to-odt': '/v1/document/to/opendoc',
        'json-to-xml-cv': '/v1/document/to/xml-cv',
        'json-to-xml-esp': '/v1/document/to/xml-esp',
        'json-to-xml': '/v1/document/to/xml'
    };

    $("#convertButton").click(function () {

        var spinHandle = $.loadingOverlay().activate();
        var baseRestUrl = 'https://europass.cedefop.europa.eu/rest';
        var inputText = $("#inputTextArea").val().toString();
        var filetype = $("#selectedAction").find(":selected").data('filetype');
        var inputFiletype = $("#selectedAction").find(":selected").data('inputFiletype');
        var restUrlType = $("#selectedAction").find(":selected").val();
        var url = baseRestUrl + restActionMap[restUrlType];
        var locale = $("#selectLanguage").val();
        var filename = 'CV-' + restUrlType + '-' + locale + '.' + filetype;

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('POST', url, true);

        xmlhttp.responseType="blob";
        xmlhttp.onreadystatechange = function () {

            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

                var blob = new Blob([this.response], { type: xmlhttp.getResponseHeader('Content-Type') });

                if (filetype === 'json' || filetype === 'xml') {
                    var reader = new FileReader();
                    reader.onload = function(event){
                        $("#outputTextArea").val(reader.result);
                        return;
                    };
                    reader.readAsText(blob);
                }
                else {
                    if (typeof window.navigator.msSaveBlob !== 'undefined') {
                        window.navigator.msSaveBlob(blob, filename);
                    } else {
                        var URL = window.URL || window.webkitURL;
                        var downloadUrl = URL.createObjectURL(blob);
                        //This way it downloads the file in the 3 major browsers with file name:
                        var a = document.createElement("a");
                        // safari doesn't support this yet
                        if (typeof a.download === 'undefined') {
                            window.location = downloadUrl;
                        } else {
                            a.href = downloadUrl;
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                        }
                        setTimeout(function () {
                            URL.revokeObjectURL(downloadUrl);
                        }, 100); // cleanup 100
                    }
                }

                $.loadingOverlay().cancel(spinHandle);
            }
            else {}
        };

        xmlhttp.setRequestHeader('Content-Type', 'application/' + inputFiletype);
        xmlhttp.setRequestHeader('Accept-Language', locale);
        xmlhttp.send(inputText);

    });

    $("#importPDFFile").change(function (event) {

        var spinHandle = $.loadingOverlay().activate();
        var XML_EXTRACTION_URL = 'https://europass.cedefop.europa.eu/rest/v1/document/extraction';

        var files = event.target.files;

        for (var i = 0; i <files.length; i++) {
            var file = files[i];
            if (!file.type.match('pdf')) {
                alert('not valid file to import');
                return;
            }
            var picReader = new FileReader();
            picReader.addEventListener("load", function (event) {

                var pdfArrayResult = event.target.result;
                var xhr = new XMLHttpRequest();

                xhr.open('POST', XML_EXTRACTION_URL, true);
                xhr.setRequestHeader("Content-Type", "application/pdf");

                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        $("#outputTextArea").val(this.responseText);
                        $.loadingOverlay().cancel(spinHandle);
                        return;
                    }
                };

                xhr.send(pdfArrayResult);
            });
            picReader.readAsArrayBuffer(file);
        }
    });


});