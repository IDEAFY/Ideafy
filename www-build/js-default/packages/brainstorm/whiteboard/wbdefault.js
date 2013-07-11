/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","Bind.plugin"],function(e,t,n){return function(i,s){var o=new e,u="",a=t.get("labels"),f="quick";return o.plugins.add("labels",new n(a)),s?f=s:f="quick",i==="scenario"?u=f+"scenariohelp":u=f+"ideahelp",o.template='<div id="whiteboard-default" class="defaultcontent"><div class="doctor-deedee"></div><div class="help" data-labels="bind:innerHTML,'+u+'"></div></div>',o}});