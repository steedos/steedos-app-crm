const objectql = require("@steedos/objectql");
const core = require('@steedos/core');

const convertSettings = require('./leads_convert.json');

const getDocConverts = (object_name, record)=>{
  let result = {};
  const converts = Object.assign({}, convertSettings[object_name]);
  _.each(converts, (item, key)=>{
    result[key] = record[item];
  });
  return result;
}

module.exports = {
  convert: async function (req, res) {
    try {
      const params = req.params;
      const recordId = params._id;
      const userSession = req.user;
      const body = req.body;
      let new_account_name = body.new_account_name.trim();
      let new_contact_name = body.new_contact_name.trim();
      let new_opportunity_name = body.new_opportunity_name && body.new_opportunity_name.trim();
      if (!body.omit_new_opportunity && (!new_opportunity_name || new_opportunity_name.length === 0)) {
        return res.status(500).send({
          "error": "请输入业务机会名称或勾选“请勿在转换时创建业务机会”项!",
          "success": false
        });
      }
      const steedosSchema = objectql.getSteedosSchema();
      const objLeads = steedosSchema.getObject('leads');
      const record = await objLeads.findOne(recordId);
      const docAccountConverts = getDocConverts("accounts", record);
      const docContactConverts = getDocConverts("contacts", record);
      const docOpportunityConverts = getDocConverts("opportunity", record);
      let docLeadUpdate = { converted: true, status: "Qualified" };
      const objAccounts = steedosSchema.getObject('accounts');
      const objContacts = steedosSchema.getObject('contacts');
      const doc = { owner: body.record_owner_id, space: userSession.spaceId };
      let newAccount;
      if(body.is_lookup_account && body.lookup_account){
        newAccount = await objAccounts.findOne(body.lookup_account);
        if(!newAccount){
          return res.status(500).send({
            "error": "Action Failed -- The account is not found.",
            "success": false
          });
        }
      }
      else{
        newAccount = await objAccounts.insert(Object.assign({}, doc, docAccountConverts, { name: new_account_name }), userSession);
        if(!newAccount){
          return res.status(500).send({
            "error": "Action Failed -- Insert account failed.",
            "success": false
          });
        }
      }
      if(newAccount){
        docLeadUpdate.converted_account = newAccount._id;
        let newContact;
        if(body.is_lookup_contact && body.lookup_contact){
          newContact = await objContacts.findOne(body.lookup_contact);
          if(!newContact){
            return res.status(500).send({
              "error": "Action Failed -- The contact is not found.",
              "success": false
            });
          }
        }
        else{
          newContact = await objContacts.insert(Object.assign({}, doc, docContactConverts, { name: new_contact_name, account: newAccount._id }), userSession);
          if(!newContact){
            return res.status(500).send({
              "error": "Action Failed -- Insert contact failed.",
              "success": false
            });
          }
        }
        if (newContact) {
          docLeadUpdate.converted_contact = newContact._id;
          if (!body.omit_new_opportunity) {
            const objOpportunity = steedosSchema.getObject('opportunity');
            let newOpportunity;
            if(body.is_lookup_opportunity && body.lookup_opportunity){
              newOpportunity = await objOpportunity.findOne(body.lookup_opportunity);
              if(!newOpportunity){
                return res.status(500).send({
                  "error": "Action Failed -- The opportunity is not found.",
                  "success": false
                });
              }
            }
            else{
              newOpportunity = await objOpportunity.insert(Object.assign({}, doc, docOpportunityConverts, { name: new_opportunity_name, account: newAccount._id }), userSession);
              if(!newOpportunity){
                return res.status(500).send({
                  "error": "Action Failed -- Insert opportunity failed.",
                  "success": false
                });
              }
            }
            if (newOpportunity) {
              docLeadUpdate.converted_opportunity = newOpportunity._id;
            }
          }
        }
      }
      await objLeads.updateOne(recordId, docLeadUpdate, userSession);
      return res.status(200).send({ state: 'SUCCESS' });
    } catch (error) {
      console.error(error);
      return core.sendError(res, error, 400);
    }
  }
}