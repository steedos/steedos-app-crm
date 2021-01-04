module.exports = { 
disableSupplierSpaceUser:function(object_name, record_id, fields){
        text = '将禁用与此供应商关联的外部用户。 是否确定？';
        swal({
            title: "禁用供应商账户",
            text: "<div>" + text + "</div>",
            html: true,
            showCancelButton: true,
            confirmButtonText: t('YES'),
            cancelButtonText: t('NO')
        }, function (confirm) {
            if(confirm){
                $("body").addClass("loading");
                var userSession = Creator.USER_CONTEXT;
                var spaceId = userSession.spaceId;
                var authToken = userSession.authToken ? userSession.authToken : userSession.user.authToken;
                var url = "/api/v4/contacts/" + record_id + "/disable_supplier_spaceuser";
                url = Steedos.absoluteUrl(url);
                try {
                    var authorization = "Bearer " + spaceId + "," + authToken;
                    var headers = [{
                        name: 'Content-Type',
                        value: 'application/json'
                    }, {
                        name: 'Authorization',
                        value: authorization
                    }];
                    $.ajax({
                        type: "get",
                        url: url,
                        dataType: "json",
                        contentType: 'application/json',
                        beforeSend: function (XHR) {
                            if (headers && headers.length) {
                                return headers.forEach(function (header) {
                                    return XHR.setRequestHeader(header.name, header.value);
                                });
                            }
                        },
                        success: function (data) {
                            $("body").removeClass("loading");
                            toastr.success(t('已禁用客户账户'));
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            console.error(XMLHttpRequest.responseJSON);
                            $("body").removeClass("loading");
                            if (XMLHttpRequest.responseJSON && XMLHttpRequest.responseJSON.error) {
                                toastr.error(t(XMLHttpRequest.responseJSON.error.replace(/:/g, '：')))
                            }
                            else {
                                toastr.error(XMLHttpRequest.responseJSON)
                            }
                        }
                    });
                } catch (err) {
                    console.error(err);
                    toastr.error(err);
                    $("body").removeClass("loading");
                }
            }
            sweetAlert.close();
        })
    },
disableSupplierSpaceUserVisible:function(object_name, record_id, record_permissions){
        if(!Creator.isSpaceAdmin()){
            return false
        }
        var record = Creator.odata.get("contacts", record_id, "account,user", "account($select=is_supplier)");
        if(record && record.user){
            var spaceUser = Creator.odata.query("space_users", {
                $filter: "(user eq '".concat(record.user, "')"),
                $select: "is_supplier"
              }, true);
            if(spaceUser[0].is_supplier){
                return true;
            }
        }
    }
 }