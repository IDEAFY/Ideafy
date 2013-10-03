/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","Bind.plugin"],function(e,t,i){return function(s,n){var a=new e,r="",c=t.get("labels"),o="quick";return a.plugins.add("labels",new i(c)),o=n?n:"quick",r="scenario"===s?o+"scenariohelp":o+"ideahelp",a.template='<div id="whiteboard-default" class="defaultcontent"><div class="doctor-deedee"></div><div class="help" data-labels="bind:innerHTML,'+r+'"></div></div>',a}});