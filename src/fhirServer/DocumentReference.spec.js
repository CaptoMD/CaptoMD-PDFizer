const DocumentReference = require('./DocumentReference');

jest.useFakeTimers('modern');
jest.setSystemTime(1614231015283);

describe('DocumentReference', () => {
  test('should match snapshot', () => {
    const documentInfo = {
      fhirPatientId: 'PATIENT_ID',
      fhirPractitionerId: 'PRACTITIONER_CODE'
    };

    expect(new DocumentReference(documentInfo, 'SOME PDF')).toMatchInlineSnapshot(`
      DocumentReference {
        "author": Array [
          Object {
            "reference": "Practitioner/PRACTITIONER_CODE",
          },
        ],
        "content": Array [
          Object {
            "attachment": Object {
              "contentType": "application/pdf;charset=utf-8",
              "data": "SOME PDF",
            },
          },
        ],
        "date": "2021-02-25T05:30:15.283Z",
        "docStatus": "final",
        "identifier": Array [
          Object {
            "system": "https://chuq.captomd.io/filler-order-number",
            "type": Object {
              "coding": Array [
                Object {
                  "code": "FILL",
                  "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                },
              ],
            },
            "use": "official",
            "value": "210225003015-PATIENT_ID",
          },
        ],
        "resourceType": "DocumentReference",
        "status": "current",
        "subject": Object {
          "reference": "Patient/PATIENT_ID",
        },
      }
    `);
  });

  test('should match snapshot with coding', () => {
    const documentInfo = {
      fhirPatientId: 'PATIENT_ID',
      coding: [
        {
          system: 'http://loinc.org',
          code: '34779-9',
          display: 'Hematology+Medical Oncology Consult note'
        }
      ]
    };

    expect(new DocumentReference(documentInfo, 'SOME PDF')).toMatchInlineSnapshot(`
      DocumentReference {
        "content": Array [
          Object {
            "attachment": Object {
              "contentType": "application/pdf;charset=utf-8",
              "data": "SOME PDF",
            },
          },
        ],
        "date": "2021-02-25T05:30:15.283Z",
        "docStatus": "final",
        "identifier": Array [
          Object {
            "system": "https://chuq.captomd.io/filler-order-number",
            "type": Object {
              "coding": Array [
                Object {
                  "code": "FILL",
                  "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                },
              ],
            },
            "use": "official",
            "value": "210225003015-PATIENT_ID",
          },
        ],
        "resourceType": "DocumentReference",
        "status": "current",
        "subject": Object {
          "reference": "Patient/PATIENT_ID",
        },
        "type": Object {
          "coding": Array [
            Object {
              "code": "34779-9",
              "display": "Hematology+Medical Oncology Consult note",
              "system": "http://loinc.org",
            },
          ],
        },
      }
    `);
  });
});
