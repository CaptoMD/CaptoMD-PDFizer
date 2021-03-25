const dayjs = require('dayjs');

class DocumentReference {
  constructor({ fhirPatientId, fhirPractitionerId, coding }, data) {
    const now = new Date();
    this.resourceType = 'DocumentReference';
    this.status = 'current';
    this.docStatus = 'final';
    this.identifier = [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'FILL'
            }
          ]
        },
        system: 'https://chuq.captomd.io/filler-order-number',
        value: `${dayjs(now).format('YYMMDDHHmmss')}-${fhirPatientId}`
      }
    ];
    if (coding) {
      this.type = { coding: coding };
    } else {
      this.type = {
        coding: [
          {
            system: 'http://loinc.org',
            code: '34779-9',
            display: 'Hematology+Medical Oncology Consult note'
          }
        ]
      };
    }
    this.subject = {
      reference: 'Patient/' + fhirPatientId
    };
    this.date = now.toISOString();
    if (fhirPractitionerId) {
      this.author = [
        {
          reference: 'Practitioner/' + fhirPractitionerId
        }
      ];
    }
    this.content = [
      {
        attachment: {
          contentType: 'application/pdf;charset=utf-8',
          data: data
        }
      }
    ];
  }
}

module.exports = DocumentReference;
