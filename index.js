require("babel-core/register");
require("babel-polyfill");
import Vue from 'vue'
//import Datepicker from 'vuejs-datepicker';
//import {en, rd} from 'vuejs-datepicker/dist/locale'
//import ru from 'vee-validate/dist/locale/ru';
//import VeeValidate , { Validator } from 'vee-validate';
//Validator.localize('ru', ru);
import AsyncComputed from 'vue-async-computed';
//import messagesRu from './strings/validator/messages/ru.js';
//import attributesRu from './strings/validator/attributes/ru.js';
//import attributesEn from './strings/validator/attributes/en.js';
var VuejsDialog = require('./js/vuedialog.js')
//Vue.use(VeeValidate);
Vue.use(AsyncComputed);

Vue.use(VuejsDialog.default);
var app = require('./js/apptest.js')


