/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","service/config","Olives/Model-plugin"],function(e,t,n){return function(i){var s=new e,o="",u=t.get("labels");return s.plugins.add("labels",new n(u)),i==="scenario"?o="quickscenariohelp":o="quickideahelp",s.template='<div id="whiteboard-default" class="defaultcontent"><div class="doctor-deedee"></div><div class="help" data-labels="bind:innerHTML,'+o+'"></div></div>',s}});