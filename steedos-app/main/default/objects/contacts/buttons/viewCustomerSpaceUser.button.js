module.exports = { 
viewCustomerSpaceUser:function(){
        var record = Creator.odata.query("space_users", {
            $filter: "(user eq '".concat(this.record.user, "')")
        }, true);
        FlowRouter.go(Creator.getObjectRouterUrl("space_users", record[0]._id));
    },
viewCustomerSpaceUserVisible:function(object_name, record_id, record_permissions){
        if (!Creator.isSpaceAdmin()) {
            return false;
        }
        var record = Creator.odata.get("contacts", record_id, "account,user", "account($select=is_customer)");
        if (record && record.user) {
            var spaceUser = Creator.odata.query("space_users", {
                $filter: "(user eq '".concat(record.user, "')"),
                $select: "is_customer"
            }, true);
    
            if (spaceUser[0].is_customer) {
                return true;
            }
        }
    }
 }