const objectql = require("@steedos/objectql");
const core = require('@steedos/core');

module.exports = {
  convert: async function (req, res) {
    try {
      const params = req.params;
      const recordId = params._id;
      const userSession = req.user;
      const body = req.body;
      let docLeadUpdate = { converted: true };
      const steedosSchema = objectql.getSteedosSchema();
      const objAccounts = steedosSchema.getObject('accounts');
      const objContacts = steedosSchema.getObject('contacts');
      const doc = { owner: body.record_owner_id, space: userSession.spaceId };
      const newAccount = await objAccounts.insert(Object.assign({}, doc, { name: body.new_account_name }), userSession);
      const newContact = await objContacts.insert(Object.assign({}, doc, { name: body.new_contact_name }), userSession);
      if (newAccount && newContact) {
        docLeadUpdate.converted_account = newAccount._id;
        docLeadUpdate.converted_contact = newContact._id;
        if(!body.omit_new_opportunity){
          const objOpportunity = steedosSchema.getObject('opportunity');
          const newOpportunity = await objOpportunity.insert(Object.assign({}, doc, { name: body.new_opportunity_name }), userSession);
          if(newOpportunity){
            docLeadUpdate.converted_opportunity = newOpportunity._id;
          }
          else{
            return res.status(500).send({
                "error": "Action Failed -- Insert Opportunity Failed.",
                "success": false
            });
          }
        }
      }
      else{
        return res.status(500).send({
            "error": "Action Failed -- Insert Account Or Contact Failed.",
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