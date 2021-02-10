class Task {
  constructor(documentReferenceId) {
    this.resourceType = 'Task';
    this.instantiatesUri = 'https://chuq.captomd.io/report-submit-to-DPE';
    this.status = 'ready';
    this.intent = 'plan';
    this.focus = {
      reference: 'DocumentReference/' + documentReferenceId
    };
    this.input = [
      {
        type: {
          text: 'Site Code'
        },
        valueString: 'HDQ'
      }
    ];
  }
}

module.exports = Task;
