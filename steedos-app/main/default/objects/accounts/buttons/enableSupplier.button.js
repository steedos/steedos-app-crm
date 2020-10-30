module.exports = { 
enableSupplier:function (object_name, record_id, fields) {
        text = '启用后，可以为供应商关联的联系人创建供应商用户。是否确定？';
        swal({
            title: "作为供应商启用",
            text: "<div>" + text + "</div>",
            html: true,
            showCancelButton: true,
            confirmButtonText: t('YES'),
            cancelButtonText: t('NO')
        }, function (confirm) {
            if(confirm){
                Creator.odata.update('accounts', record_id, { is_supplier: true })
            }
            sweetAlert.close();
        })
    },
enableSupplierVisible:function (object_name, record_id, record_permissions) {
        if(!Creator.isSpaceAdmin()){
            return false
        }
        var record = Creator.getCollection(object_name).findOne(record_id);
        if(record){
            return record.is_supplier != true
        }
    }
 }