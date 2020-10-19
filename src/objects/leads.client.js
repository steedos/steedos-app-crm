Steedos.CRM = {};

Steedos.CRM.showLeadConvertForm = function(fields, formId, doc, onConfirm, title){

    var schema = Creator.getObjectSchema({fields: fields});
    // // 因为boolean字段类型的autoform用的是steedos-boolean-checkbox，不支持，只能用steedos-boolean-toggle代替，其他的控件都不支持
    // // schema.omit_new_opportunity.autoform.type = "steedos-boolean-toggle";
    // _.forEach(schema, (item)=>{
    //     if(item.type === Boolean){
    //         item.autoform.type = "steedos-boolean-toggle";
    //     }
    // });

    Modal.show("quickFormModal", {formId: formId, title: title || "转换潜在客户", confirmBtnText: `转换`, schema: schema, doc: doc, onConfirm: onConfirm}, {
        backdrop: 'static',
        keyboard: true
    });
}

Steedos.CRM.convertLead = function(record){
    const record_id = record._id;
    const object_name = "leads";
    let doc = {};
    doc.new_account_name = record.company;
    doc.new_contact_name = record.name;
    doc.new_opportunity_name = `${doc.new_account_name}-`;
    doc.omit_new_opportunity = false;
    doc.record_owner_id = Steedos.userId();
    var formId = 'leadConvertForm';
    Steedos.CRM.showLeadConvertForm({
        new_account_name: {
            label: "新建客户",
            type: 'text',
            is_wide: true,
            // group: "客户",
            required: true
        },
        new_contact_name: {
            label: "新建联系人",
            type: 'text',
            is_wide: true,
            // group: "联系人",
            required: true
        },
        new_opportunity_name: {
            label: "新建业务机会",
            type: 'text',
            is_wide: true,
            // group: "业务机会"
        },
        omit_new_opportunity: {
            label: "请勿在转换时创建业务机会",
            type: 'toggle',
            // group: "业务机会"
        },
        record_owner_id: {
            label: "记录所有人",
            type: 'lookup',
            reference_to: 'users',
            required: true
        }
    }, formId, doc, function(formValues, e, t){
        var result = Steedos.authRequest(`/api/v4/${object_name}/${record_id}/convert`, {type: 'post', async: false, data: JSON.stringify(formValues.insertDoc)});
        if(result && result.state === 'SUCCESS'){
            FlowRouter.reload();
            Modal.hide(t);
        }
    })
}