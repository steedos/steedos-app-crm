module.exports = { 
disableCustomer:function (object_name, record_id, fields) {
        text = '将禁用所有与此客户关联的外部用户。 是否确定？';
        swal({
            title: "禁用客户账户",
            text: "<div>" + text + "</div>",
            html: true,
            showCancelButton: true,
            confirmButtonText: t('YES'),
            cancelButtonText: t('NO')
        }, function (confirm) {
            if(confirm){
                Creator.odata.update('accounts', record_id, { is_customer: false })
            }
            sweetAlert.close();
        })
    },
disableCustomerVisible:function(object_name, record_id, record_permissions){
        if(!Creator.isSpaceAdmin()){
            return false
        }
        var record = Creator.getCollection(object_name).findOne(record_id);
        if(record){
            return record.is_customer
        }
    }
 }