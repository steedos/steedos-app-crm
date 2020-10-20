Steedos.CRM = {};

Steedos.CRM.showLeadConvertForm = function (fields, formId, doc, onConfirm, title) {
    var schema = Creator.getObjectSchema({ fields: fields });
    Modal.show("quickFormModal", { formId: formId, title: title || "转换潜在客户", confirmBtnText: `转换`, schema: schema, doc: doc, onConfirm: onConfirm }, {
        backdrop: 'static',
        keyboard: true
    });
}

Steedos.CRM.convertLead = function (record) {
    if(record.converted){
        toastr.error(t("该潜在客户已经转换过了，不能重复转换！"));
        return;
    }
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
    }, formId, doc, function (formValues, e, t) {
        let insertDoc = formValues.insertDoc;
        var result = Steedos.authRequest(`/api/v4/${object_name}/${record_id}/convert`, { type: 'post', async: false, data: JSON.stringify(insertDoc) });
        if (result && result.state === 'SUCCESS') {
            FlowRouter.reload();
            Modal.hide(t);
            Steedos.CRM.alertLeadConvertedRecords(record);
        }
    })
}

Steedos.CRM.alertLeadConvertedRecords = function (record) {
    const record_id = record._id;
    const object_name = "leads";
    const fields = "converted_account,converted_contact,converted_opportunity";
    const converteds = Creator.odata.get(object_name, record_id, fields, fields);
    let doc = {};
    if(converteds.converted_account){
        doc.account_name = converteds.converted_account._NAME_FIELD_VALUE;
        doc.account_url = Steedos.absoluteUrl(Creator.getObjectUrl("accounts", converteds.converted_account._id),true);
    }
    if(converteds.converted_contact){
        doc.contact_name = converteds.converted_contact._NAME_FIELD_VALUE;
        doc.contact_url = Steedos.absoluteUrl(Creator.getObjectUrl("contacts", converteds.converted_contact._id),true);
    }
    if(converteds.converted_opportunity){
        doc.opportunity_name = converteds.converted_opportunity._NAME_FIELD_VALUE;
        doc.opportunity_url = Steedos.absoluteUrl(Creator.getObjectUrl("opportunity", converteds.converted_opportunity._id),true);
    }
    let html = `
        <div class="grid grid-cols-1 lg:gap-2">
            <div class="flex items-start">
                <div class="ml-4">
                    <p class="text-gray-900"><span>客户：<span><a href="${doc.account_url}" target="_blank">${doc.account_name?doc.account_name:""}</a></p>
                </div>
            </div>
            <div class="flex items-start">
                <div class="ml-4">
                    <p class="text-gray-900"><span>联系人：<span><a href="${doc.contact_url}" target="_blank">${doc.contact_name?doc.contact_name:""}</a></p>
                </div>
            </div>
            <div class="flex items-start">
                <div class="ml-4">
                    <p class="text-gray-900"><span>业务机会：<span><a href="${doc.opportunity_url}" target="_blank">${doc.opportunity_name?doc.opportunity_name:""}</a></p>
                </div>
            </div>
        </div>
    `;
    swal({
            title: "潜在客户已转换",
            text: html,
            html: true,
            type:"success",
            confirmButtonText:t('OK')
        },
        ()=>{
            sweetAlert.close();
        }
    );
}