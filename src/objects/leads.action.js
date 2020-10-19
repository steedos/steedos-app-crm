module.exports = {
  convert: function () {
    Steedos.CRM.convertLead(this.record);
  },

  convertVisible: function (object_name, record_id, permissions, record) {
    if(record && !record.converted){
      return true
    }
  },

  alertConvertedRecords: function () {
    Steedos.CRM.alertLeadConvertedRecords(this.record);
  },

  alertConvertedRecordsVisible: function (object_name, record_id, permissions, record) {
    if(record && record.converted){
      return true
    }
  }
}