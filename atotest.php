<!DOCTYPE html>
<html>
    <head>
            <link rel="stylesheet" type="text/css" href="css/bootstrap.min.css" />
            <link rel="stylesheet" type="text/css" href="css/atostyle.css" />
    </head>
<body>
    <div id="main">
        <div id="topbuttons">
        <span id="newcard0">
            <button id="newbutton" class="topb"
                    @click="show = true">
                Новая</button>
            <newmodal
                v-if="show" @close="show= false">
                <div slot="body">
                
                    <newcard-form :ru="ru">
                    </newcard-form>
                
                </div>
            </newmodal>
        </span>            
            <span id="msg-win">
                <button id="messagesbut" class="topb" @click="showMessages = true">
                    Messages</button>
                <msgmodal
                v-if="showMessages" @close="showMessages = false">
                <h3 slot="header">Сообщения</h3>
                    <div slot="body">
                        <msgbody :columns="gridColumns" ></msgbody>
                    </div>
                    <div slot="footer">
                    dfooter
                    </div>
                </msgmodal>
            </span>

            <span id="archive-win">
                <button id="archivebut" class="topb" @click="show = true">
                   Архив</button>
                <archivemodal
                v-if="show" @close="show = false">
                <h3 slot="header">archive</h3>
                    <div slot="body">
                        <archivegrid></archivegrid>
                    </div>
                    <div slot="footer">
                    dfooter
                    </div>
                </archivemodal>
            </span>
            
            <span id="ceditor" v-if="userinfo.admin">
                <button id="editorbut" class="topb" @click="show = true">
                    Edit BP
                </button>
                <editormodal
                    v-if="show" @close="show = false">
                    <h3 slot="header">Editor</h3>
                    <div slot="body">
                        
                        <ceditor/>
                    </div>  
                    <div slot="footer">
                        Ofooter
                    </div>
                </editormodal>
                
            </span>            
            
            <span id="opt-win" v-if="userinfo.admin">
                <button id="optbutton" class="topb" 
                    @click="show = true">
                    Настройки
                </button>
                <optmodal
                    v-if="show" @close="show = false">
                    <h3 slot="header">Options</h3>
                    <div slot="body">
                        <atooptions-form :columns="gridColumns">                
                        </atooptions-form>
                    </div>  
                    <div slot="footer">
                        Ofooter
                    </div>
                </optmodal>
            </span>
        </div>

        
        <div id="maingrid" class="main-grid" v-if="show" v-cloak>
            <form id="search">
                Search <input name="query" v-model="searchQuery">
            </form>
            <main-grid
                :columns="gridColumns"
                :filter-key="searchQuery">
            </main-grid>
        </div>

        <div id="mainform0"  v-cloak>
            <mainmodal
                v-if="show" @close="show= false">
                <h3 slot="header">Card {{itemId}}</h3>
                <div slot="body">        
                    <div id="mainform">
                        <main-form
                            :id="itemId"
                            :state="itemState"
                            :record="gridLine">  
                            Main
                        </main-form>
                    </div>
                </div>
                <div slot="footer">
                    main footer
                </div>
            </mainmodal>                    
        </div>
    </div>


<script type="text/x-template" id="ceditor-template">
    <div>
        editor<br/>
        <button @click="cancel">Cancel</button>
        </div>
</script>        
<script type="text/x-template" id="msgbody-template">
    <div>
        msg list here<br/>
        user list <br/>
        <opt-user-grid :columns="columns">
        </opt-user-grid>
        <div>
            Кому: {{whom.NAME}}
        </div>
        <p class="field">
        <textarea  class="content-input" v-model="msgtext"></textarea>
        </p>
        <div>
              <button class="modal-default-button all-but btn-success"
                @click="click()">
                OK
              </button>
              <button  class="all-but btn-secondary"
                @click="cancel()">
                Cancel
              </button>    
              </div>
    </div>
</script>    

<script type="text/x-template" id="archive-template">
    <div class="arch-all">
    <div class="arch-recs">
    <div class="arch-rec" v-for="rec in records">
        {{rec.id}} {{rec.cdate}} {{rec.nom_zak}} {{rec.link_zak}}
        <hr />            
    </div>
    </div>
              <button  class="all-but btn-secondary"
                @click="cancel()">
                Cancel
              </button>    
              </div>
    </div>
</script>    

<script type="text/x-template" id="modal-template">
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
             
            </slot>
          </div>

          <div class="modal-body">
            <slot name="body">
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">              
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</script>    

<script type="text/x-template" id="opt-user-grid-template">
    <div class="oug">
      <table class="grid">
<thead>
      <tr>
  
        <th v-for="key in columns">
          {{ key[1] }}
        </th>
      </tr>
    </thead>
    <tbody>
            <tr v-for="entry in userlist_r" v-on:click="trclick(entry)">
        <td v-for="key in columns" class="point">
          {{ getEntry(entry, key[0]) }}
        </td>
      </tr>
    </tbody>
  </table>
    </div>
</script>

<script type="text/x-template" id="atooptions-template">
    <div class="options" id="options-div">          
        <div>
            admin {{admin}} <br />
            folder {{folder_id}} <br />
            sr {{strictroles}} {{ d_strictroles }} <br />
        </div>

        <div v-if="debug" class="debug">

            ui {{userinfo}} <br />
            roles {{roles}} <br />
            userroles {{userroles}}
            <div style="font-size:50%;font-face:courier"> 
                {{userlist}}                    
            </div>
        </div>
        <div v-if="isadmin">
            admin options <br />
            
        <label for="folder-id">Folder id</label>
        <span style="color: rgb(255, 0, 0);">*</span>
        <p :class="{ 'control': true }" class="field">        
            <input type="number" id="folder-id" class="content-input" name="folder-id" 
                v-model="folder_id" placeholder="0" 
                v-validate="'required'"/>
            <span v-show="errors.has('folder-id')" 
                class="help is-danger">{{ errors.first('folder-id') }}</span>
        </p>
        
        <p class="field">        

        <input v-on:change="changesr()" type="checkbox" id="checkbox-sr" v-model="d_strictroles">
        <label for="checkbox-sr">strict roles {{ d_strictroles }}</label>
            </p>
            <div id="user-roles">
            <div id="user-grid" style="float: left">
                <opt-user-grid :columns="columns">
                </opt-user-grid>
                
            </div>
            <div id="select-role-div"  style="float: left">
                <div class="role-select"> role for {{selectedUser}}: </div>
                <div class="role-select">
                <select id="select-role" v-model="role_sel_id">
                    <option v-for="option in role_options" v-bind:value="option.id">
                {{ option.role }}
                    </option>                                                
                </select>
                </div>
                <div class="role-select">
                    <button class="all-but btn-primary" v-on:click="set_role()">Установить роль</button>
                </div>
            </div>
            <div class="clear"></div>
            selected user: {{selectedUser}}
            </div> <!--    user-roles -->
        </div>
        <div>
            user {{userinfo.ID}} options
        </div>

        <button class="all-but btn-success" v-on:click="save">Сохранить</button>
        <button class="all-but btn-secondary" v-on:click="cancel">Отмена</button>
    </div>
</script>    
    
<script type="text/x-template" id="grid-template">
      <div class="main-grid">
  <div>
   <button class="prevnext" @click="prevpage()">prev</button> 
    Page: {{npage+1}} 
   <button  class="prevnext" @click="nextpage()">next</button> 
       </div>
      
  <table cellsapcing="0" class="grid">
<thead>
      <tr class="grid-head">
  <th class="action"></th>
        <th v-for="key in columns"
          @click="sortBy(key[0])"
          :class="{ active: sortKey == key[0] }">
          {{ key[1] | capitalize }}
          <span class="arrow" :class="sortOrders[key[0]] > 0 ? 'asc' : 'dsc'">
          </span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in filteredData">
        <td>
            <button class="grid-act-but" v-on:click="click(entry['id'],entry['state'], entry)">
               
            </button>
        </td>
        <td v-for="key in columns">
          {{scalc(entry,key)}}
        </td>
      </tr>
    </tbody>
  </table>
  <div>
   <button class="prevnext" @click="prevpage()">prev</button> 
    Page: {{npage+1}} 
   <button class="prevnext" @click="nextpage()">next</button> 
       </div>
  </div>
</script>
  
<script type="text/x-template" id="formnew-template">    
<form id="form-new-form">                                                 
    <div id="formnew-template-div">
    <h2>Новая карточка</h2>
    <div v-if="debug" class="debug-out">Debug output</div>
    <div v-if="debug"  class="debug">
        {{vz_options}}<br/>
            {{dealcats}}
    </div>
        <label for="responsible">Ответственный</label>
        <span style="color: rgb(255, 0, 0);">*</span>
        <p :class="{ 'control': true }" class="field">
            <select id="responsible" v-model="resp_selected"  v-validate="'required'"> 
                <option v-for="option in resp_options" v-bind:value="option.ID">
                {{ option.NAME }}
            </option>
            </select>
        </p>

        <label for="vidzak">Вид закупки</label>
        <span style="color: rgb(255, 0, 0);">*</span>
        <p :class="{ 'control': true }" class="field">
            <select id="vidzak" v-model="vz_selected"  v-validate="'required'"> 
                <option v-for="option in vz_options" v-bind:value="option.id">
                {{ option.vid_zak }}
            </option>
            </select>
        </p>
        
        <label for="dealcat">Направление сделки</label>
        <span style="color: rgb(255, 0, 0);">*</span>
        <p :class="{ 'control': true }">
            <select id="dealcat" name="dealcat" v-model="dc_selected"  v-validate="'required'"> 
                <option v-for="option in dealcats" v-bind:value="option.ID">
                {{ option.NAME }}
            </option>
            </select>
            <span v-show="errors.has('dealcat')" 
                class="help is-danger">{{ errors.first('dealcat') }}</span>
        </p>
        
        <label for="nomzak">Номер закупки</label>
        <span style="color: rgb(255, 0, 0);">*</span>
        <p :class="{ 'control': true }" class="field">        
            <input id="nomzak" class="content-input" name="nomzak" v-model="nomzak" placeholder="" 
                v-validate="'required'"/>
            <span v-show="errors.has('nomzak')" 
                class="help is-danger">{{ errors.first('nomzak') }}</span>
        </p>
        
        <label for="linkzak">Ссылка</label>
        <span style="color: rgb(255, 0, 0);">*</span>
        <p :class="{ 'control': true }" class="field">
            <input id="linkzak"  class="content-input" name="linkzak" v-model="linkzak" placeholder="" 
                v-validate="'required|url'"
                :class="{'input': true, 'is-danger': errors.has('linkzak') }"
            />
            <span v-show="errors.has('linkzak')" 
                class="help is-danger">{{ errors.first('linkzak') }}</span>
        </p>
        <label for="dateend">End date</label>
        <p :class="{ 'control': true }">
            <datepicker  :language="ru" id="dateend" name="dateend" v-model="dateend" 
                v-validate="'required'"
                 :format="customFormatter"></datepicker>
            <span v-show="errors.has('dateend')" 
                class="help is-danger">{{ errors.first('dateend') }}</span>
        </p>
        <label for="somefile1">Some file 1</label>
            <div v-if="somefile1_obj.name" class="file-name">{{somefile1_obj.name}}, {{somefile1_obj.size}}</div>    
        <p :class="{ 'control': true }" class="field file" >
            <span class="file-input">Добавить файл</span>    
            <input class="file-input" type="file" id="somefile1" name="somefile1" 
                @change="filesChange($event.target.name, $event.target.files)"
                />
            <span v-show="errors.has('somefile1')" 
                class="help is-danger">{{ errors.first('somefile1') }}</span>
        </p>
        <label for="somefile2">Some file 2</label>
            <div v-if="somefile2_obj.name" class="file-name">{{somefile2_obj.name}}, 
                {{somefile2_obj.size}}</div>    
        <p :class="{ 'control': true }" class="field file" >
            <span class="file-input">Добавить файл</span>    
            <input class="file-input" type="file" id="somefile2" name="somefile2" 
                @change="filesChange($event.target.name, $event.target.files)"
                />
            <span v-show="errors.has('somefile2')" 
                class="help is-danger">{{ errors.first('somefile2') }}</span>
        </p>
<div v-if="showupload" style="font-size:160%">
Progress {{upprc}}%
</div>
        <div>
            <button type="button" class="all-but btn-success" v-on:click="save">Сохранить</button>
            <button type="button" class="all-but btn-secondary" v-on:click="cancel">Отмена</button>
        </div>
     </div>     
</form>
</script>

<script type="text/x-template" id="mainform-template">
<div id="mainform-template-div" class="top0">

<slot></slot>
<div class="card-name">
            Текущее состояние {{sObject.name}}
        </div>
        
    <div class="top1">
        Main work panel [ admin: {{admin}} ] {{userinfo.LAST_NAME}} 
                user role: {{currentRole.role}} <br />
        Responsibility: {{inRole()}} <br />
            {{sObject}}
    </div>
    <div v-if="d_inRole">
       You are reponsible: {{currentRole.role}} 
    </div>
    <div v-else>
       You are not reponsible: {{currentRole.role}}
    </div>
    
    <div class="top2">
        main, item id = {{id}} <br />
        <div class="card-name">
            name = {{sObject.name}}
        </div>
        state(db rec) = {{state}} <br />
        responsible = {{sObject.resp}} <br/>
        role = {{currentRole}} <br />
    </div>
    <div class="top3">
      <div v-if="debug" class="debug">
        State {{sObject}} <br />
        Action: {{sObject.action}}
        <div v-if="sObject.action=='archive'">
            <span style="color:#900000">
         Next action: move to archive with state={{state}}
             </span>
        </div>
      </div>
        <div v-if="sObject.action && d_inRole" class="obj-act">
            <button class="all-but btn-primary" 
            @click="doaction(id, sObject)">Do action {{sObject.action}}</button>
        </div>
    </div>

    <div class="main-center">
        <div class="main-left">

        <div id="mainform-form" @input="mDirty($event)">
            <div v-if="debug" class="debug">
                <div style="color:#90a000;font-size:130%">
            input data for current state/action
                </div>
                <div>{{record}}</div>
            </div>    
        <label for="nomzak">Номер закупки</label>
        <p :class="{ 'control': true }" class="field">        
            <input id="nomzak" class="content-input" v-model="record.nom_zak" v-validate="'required'"
                :class="{'input': true, 'is-danger': errors.has('nomzak') }"
                />
                <span v-show="errors.has('nomzak')" 
                class="help is-danger">{{ errors.first('nomzak') }}</span>
        </p>
        
        <label for="linkzak">Ссылка</label>
        <p :class="{ 'control': true }" class="field">
            <input id="linkzak" class="content-input" name="linkzak" v-model="record.link_zak"
                v-validate="'required|url'"
                :class="{'input': true, 'is-danger': errors.has('linkzak') }"
            />
            <span v-show="errors.has('linkzak')" 
                class="help is-danger">{{ errors.first('linkzak') }}</span>
        </p>
        
        <div v-if="rec.f1_url">
        somefile1 <a v-bind:href="rec.f1_url">{{rec.f1_name}}</a>
        </div>
        <div v-if="rec.f2_url">
        somefile2 <a v-bind:href="rec.f2_url">{{rec.f2_name}}</a>
        </div>
    </div>
    
<div id="main-buttons2" class="top4" v-if="b_count()==2">
<div v-if="nextStates">
Next: {{nextStates[0].name}} <br />
</div>
<div v-else>
No next, it is the END
</div>
    <span v-if="d_inRole">
        <button class="all-but btn-success" @click="save(id, sObject, sObject.tr[0])">Save</button>
        <button class="all-but btn-primary" v-if="nextStates"
            @click="saveandnext(id, sObject, sObject.tr[1],nextStates[0].resp)">
            Save &amp; Next to {{sObject.tr[1]}}</button>
    </span>        
    <button class="all-but btn-secondary" v-on:click="cancel">Отмена</button>
</div>
<div id="main-buttons3" class="top4" v-if="b_count()==3">
<div v-if="nextStates">
Yes: {{nextStates[0].name}} <br />
No: {{nextStates[1].name}} <br />
</div>
<div v-else>
No next, it is the END
</div>
    <span v-if="d_inRole">
        <button class="all-but btn-success" @click="save(id, sObject, sObject.tr[0])">Save</button>
        <button class="all-but btn-primary" v-if="nextStates"
            @click="saveandnext(id, sObject, sObject.tr[1],nextStates[0].resp)">
            YES &amp; Next to {{sObject.tr[1]}}</button>
        <button class="all-but btn-warning" v-if="nextStates"
            @click="saveandnext(id, sObject, sObject.tr[2],nextStates[0].resp)">
            NO &amp; Next to {{sObject.tr[2]}}</button>
    </span>
    <button class="all-but btn-secondary" v-on:click="cancel">Отмена</button>        
</div>
<hr />
<div class="del-but">
    <button class="all-but btn-danger" 
    v-confirm="{ok: deleteCard2, 
        cancel: doNothing, 
        okText:'Продолжить',
        cancelText: 'Отмена',
        message: 'Удалить?'}"
        >Удалить</button>        
</div>
        
        </div> <!-- main-left -->
        <div class="main-right">
        <div class="main-right-inner">
        comments for card id {{rec.id}} <br />
        <div class="comments-list">
        
            <div class="whole-msg" v-for="entry in cmsg">
                {{entry.cdate}} <br />
                {{entry.private=='1' ? 'Личное':''}} <br />
                {{entry.private=='1' ? 'Кому: ' + get_name(entry.whom):''}} <br />
                From {{get_name(entry.user_id)}} <br />
                Message <div class="single-msg">{{entry.msg}}</div>
                <hr />
            </div>
        </div>    
            <div class="comments-enter">
                Message
                
        <input type="checkbox" id="checkbox" v-model="privatemsg">
        <label for="checkbox">private {{ privatemsg }}</label>
    
        <div v-if="privatemsg">   
        <label for="main-whom">Private to</label>
        <p :class="{ 'control': true }" class="field">
            <select id="main-whom" name="main-whom" v-model="whom_selected" 
                > 
                <option v-for="option in whom_options" v-bind:value="option.ID">
                {{ option.NAME }}
            </option>
            </select>
            <span v-show="errors.has('main-whom')" 
                class="help is-danger">{{ errors.first('main-whom') }}</span>
        </p>            
        </div>    
            <p  class="field">
                <textarea class="content-input" v-model="message"></textarea>
            </p>
            </div>
            <button class="all-but btn-success" @click="saveMessage(id,sObject.tr[0])">Add message</button>
        </div>    
        </div> <!-- main-right -->
        
        
        </div> <!-- main-center -->
       <div class="clear"></div> 
       
    </div>
</script>


<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<!-- <script type="text/javascript" src="js/vue.js"></script> -->
<script type="text/javascript" src="dist/bundle.js"></script>

 <script> 
    //VeeValidate.Validator.localize('ru', ruLocale);
//    Validator.localize('ru', ru);
//    Vue.use(VeeValidate);
//    Vue.use(AsyncComputed);
</script>
<script>
//    Vue.use(VuejsDialog.default);
 
</script>
<style>

</style>
<link rel="stylesheet" type="text/css" href="css/dgstyle.css" />

    </body>
</html>


