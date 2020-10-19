module.exports = {
    convert: function(){
      Steedos.CRM.convertLead(this.record);
    },
  
    convertVisible: function(){
      return true
    }
  }