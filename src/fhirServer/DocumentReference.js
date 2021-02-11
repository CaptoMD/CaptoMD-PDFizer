class DocumentReference {
  constructor(patientId, practitionerId, data) {
    this.resourceType = 'DocumentReference';
    this.status = 'current';
    this.docStatus = 'final';
    this.type = {
      coding: [
        {
          system: 'http://loinc.org',
          code: '34779-9',
          display: 'Hematology+Medical Oncology Consult note'
        }
      ]
    };
    this.subject = {
      reference: 'Patient/' + patientId
    };
    this.date = new Date().toISOString();
    this.author = [
      {
        reference: 'Practitioner/' + practitionerId
      }
    ];
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
