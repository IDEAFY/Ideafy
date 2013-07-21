/*
 * Application handlers
 */

var fs = require("fs");

function CDBAdmin(){
        
        this.setAdminCredentials = function(credentials){
                cdbAdminCredentials = credentials;
        }

        this.updateUserIP = function(userid, reason, increment, onEnd){
                this.getDocAsAdmin();
        };
        
        this.updateDocAsAdmin = function(docId, cdbStore){
                
        };
        
        this.getDocAsAdmin = function(docId, cdbStore){
                console.log("coucou c'est moi");
        };
        
        this.createDocAsAdmin = function(docId, cdbStore){
                
        };
        
        this.getViewAsAdmin = function(design, view, query, cdbStore){
        
        };
        
}

exports.CDBAdmin = CDBAdmin;
