const objectql = require("@steedos/objectql");
const core = require('@steedos/core');

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
      let docLeadUpdate = { converted: true };
      const steedosSchema = objectql.getSteedosSchema();
      const objAccounts = steedosSchema.getObject('accounts');
      const objContacts = steedosSchema.getObject('contacts');
      const doc = { owner: body.record_owner_id, space: userSession.spaceId };
      const newAccount = await objAccounts.insert(Object.assign({}, doc, { name: new_account_name }), userSession);
      if(newAccount){
        docLeadUpdate.converted_account = newAccount._id;
        const newContact = await objContacts.insert(Object.assign({}, doc, { name: new_contact_name, account: newAccount._id }), userSession);
        if (newContact) {
          docLeadUpdate.converted_contact = newContact._id;
          if (!body.omit_new_opportunity) {
            const objOpportunity = steedosSchema.getObject('opportunity');
            const newOpportunity = await objOpportunity.insert(Object.assign({}, doc, { name: new_opportunity_name, account: newAccount._id }), userSession);
            if (newOpportunity) {
              docLeadUpdate.converted_opportunity = newOpportunity._id;
            }
            else {
              return res.status(500).send({
                "error": "Action Failed -- Insert Opportunity Failed.",
                "success": false
              });
            }
          }
        }
        else {
          return res.status(500).send({
            "error": "Action Failed -- Insert Contact Failed.",
            "success": false
          });
        }
      }
      else {
        return res.status(500).send({
          "error": "Action Failed -- Insert Account Failed.",
          "success": false
        });
      }
      const objLeads = steedosSchema.getObject('leads');
      await objLeads.updateOne(recordId, docLeadUpdate, userSession);
      return res.status(200).send({ state: 'SUCCESS' });
    } catch (error) {
      console.error(error);
      return core.sendError(res, error, 400);
    }
  }
}