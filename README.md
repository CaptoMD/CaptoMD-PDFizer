# CaptoMD-PDFizer

An Express server as a PDF factory for CaptoMD medical records, calling 2 separate services: 

1. [**CaptoMD-electron-pdf**](https://github.com/CaptoMD/CaptoMD-electron-pdf) service for building the content of the PDF
2. [**PDFReactor**](http://www.pdfreactor.com/product/doc/webservice/) REST service for building the page container, paginated with rigorous conformity

## Getting started

*Installation procedures description to come…*

## Generating a PDF

Will download a PDF:

**[POST]** [http://localhost:8400/](http://localhost:8400/) with body payload (`application/json`):

```JSON
{
  "header": "<header id='running-header-big'>…</header><header id='running-header-small'>…</header><footer>…</footer>",
  "content": "<md-emr-print-body>…</md-emr-print-body>",
  "title": "",
  "lang": "fr|en",
  "footer": "Line One<br>DIC : 3-4-4"
}
```

`"header"` and `"content"` fields are mandatory.

Note: `"footer"` can be a string or an array of strings (max: 2)
