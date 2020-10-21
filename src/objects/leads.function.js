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

// 取出docConverts中oldDoc对应key值为空的字段值集合，即docConverts中值不能覆盖更新oldDoc中已经存在的字段值
const getDocEmptyConverts = (docConverts, oldDoc)=>{
  let result = {};
  _.each(docConverts, (item, key)=>{
    if((oldDoc[key] === undefined || oldDoc[key] === null || oldDoc[key] === 0) && item !== undefined && item !== null && item !== 0){
      result[key] = item;
    }
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
      let recordAccount;
      if(body.is_lookup_account && body.lookup_account){
        recordAccount = await objAccounts.findOne(body.lookup_account);
        if(!recordAccount){
          return res.status(500).send({
            "error": "Action Failed -- The account is not found.",
            "success": false
          });
        }
          // 所有字段属性都是为空才同步更新
        const docAccountEmptyConverts = getDocEmptyConverts(docAccountConverts, recordAccount);
        if(!_.isEmpty(docAccountEmptyConverts)){
          await objAccounts.updateOne(recordAccount._id, docAccountEmptyConverts, userSession);
        }
      }
      else{
        recordAccount = await objAccounts.insert(Object.assign({}, doc, docAccountConverts, { name: new_account_name }), userSession);
        if(!recordAccount){
          return res.status(500).send({
            "error": "Action Failed -- Insert account failed.",
            "success": false
          });
        }
      }
      if(recordAccount){
        docLeadUpdate.converted_account = recordAccount._id;
        let recordContact;
        if(body.is_lookup_contact && body.lookup_contact){
          recordContact = await objContacts.findOne(body.lookup_contact);
          if(!recordContact){
            return res.status(500).send({
              "error": "Action Failed -- The contact is not found.",
              "success": false
            });
          }
          // 包括所属客户在内，所有字段属性都是为空才同步更新
          let docContactEmptyConverts = getDocEmptyConverts(Object.assign({}, docContactConverts, { account: recordAccount._id }), recordContact);
          if(body.force_update_contact_lead_source && !docContactEmptyConverts.lead_source && docContactConverts.lead_source){
            // 如果界面上勾选了“更新潜在客户来源”，则应该强行更新联系人的潜在客户来源
            docContactEmptyConverts.lead_source = docContactConverts.lead_source;
          }
          if(!_.isEmpty(docContactEmptyConverts)){
            await objContacts.updateOne(recordContact._id, docContactEmptyConverts, userSession);
          }
        }
        else{
          recordContact = await objContacts.insert(Object.assign({}, doc, docContactConverts, { name: new_contact_name, account: recordAccount._id }), userSession);
          if(!recordContact){
            return res.status(500).send({
              "error": "Action Failed -- Insert contact failed.",
              "success": false
            });
          }
        }
        if (recordContact) {
          docLeadUpdate.converted_contact = recordContact._id;
          if (!body.omit_new_opportunity) {
            const objOpportunity = steedosSchema.getObject('opportunity');
            let recordOpportunity;
            if(body.is_lookup_opportunity && body.lookup_opportunity){
              recordOpportunity = await objOpportunity.findOne(body.lookup_opportunity);
              if(!recordOpportunity){
                return res.status(500).send({
                  "error": "Action Failed -- The opportunity is not found.",
                  "success": false
                });
              }
              // 包括所属客户在内，所有字段属性都是为空才同步更新
              const docOpportunityEmptyConverts = getDocEmptyConverts(Object.assign({}, docOpportunityConverts, { account: recordAccount._id }), recordOpportunity);
              if(!_.isEmpty(docOpportunityEmptyConverts)){
                await objOpportunity.updateOne(recordOpportunity._id, docOpportunityEmptyConverts, userSession);
              }
            }
            else{
              recordOpportunity = await objOpportunity.insert(Object.assign({}, doc, docOpportunityConverts, { name: new_opportunity_name, account: recordAccount._id }), userSession);
              if(!recordOpportunity){
                return res.status(500).send({
                  "error": "Action Failed -- Insert opportunity failed.",
                  "success": false
                });
              }
            }
            if (recordOpportunity) {
              docLeadUpdate.converted_opportunity = recordOpportunity._id;
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