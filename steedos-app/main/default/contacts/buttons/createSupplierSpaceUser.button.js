module.exports = { 
createSupplierSpaceUser:function(){
        var objectName = "space_users"
		var object = Creator.getObject(objectName)
		var collection_name = object.label
		Session.set("action_collection", "Creator.Collections."+objectName)
		Session.set("action_collection_name", collection_name)
		Session.set("action_save_and_insert", false)
        Session.set("cmDoc", Object.assign({is_supplier: true, contact_id: this.record._id, profile: 'supplier'}, this.record));
        console.log("this.record", Object.assign({is_supplier: true}, this.record) );
        Meteor.defer(function(){
            $(".creator-add").click()
        })		
    },
createSupplierSpaceUserVisible:function(object_name, record_id, record_permissions){
        if(!Creator.isSpaceAdmin()){
            return false
        }
        var record = Creator.odata.get("contacts", record_id, "account,user", "account($select=is_supplier)");
        if(record && record.account && record.account.is_supplier && !record.user){
            return true;
        }
    }
 }