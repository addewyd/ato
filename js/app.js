(function () {
    
    var getClass = function (object) {
       return Object.prototype.toString.call(object).slice(8, -1);
    };
    var isValidCollection = function (obj) {
        try {
            return (
                typeof obj !== "undefined" &&  // Element exists
                getClass(obj) !== "String" &&  // weed out strings for length check
                typeof obj.length !== "undefined" &&  // Is an indexed element
                !obj.tagName &&  // Element is not an HTML node
                !obj.alert &&  // Is not window
                typeof obj[0] !== "undefined"  // Has at least one element
            );
        } catch (e) {
            return false;
        }
    };
    window.array_merge = function (arr1, arr2) {
        // Variable declarations
        var arr1Class, arr2Class, i, il;

        // Save class names for arguments
        arr1Class = getClass(arr1);
        arr2Class = getClass(arr2);

        if (arr1Class === "Array" && isValidCollection(arr2)) {  // Array-like merge
            if (arr2Class === "Array") {
                arr1 = arr1.concat(arr2);
            } else {  // Collections like NodeList lack concat method
                for (i = 0, il = arr2.length; i < il; i++) {
                    arr1.push(arr2[i]);
                }
            }
        } else if (arr1Class === "Object" && arr1Class === arr2Class) {  // Object merge
            for (i in arr2) {
                if (i in arr1) {
                    if (getClass(arr1[i]) === getClass(arr2[i])) {  // If properties are same type
                        if (typeof arr1[i] === "object") {  // And both are objects
                            arr1[i] = array_merge(arr1[i], arr2[i]);  // Merge them
                        } else {
                            arr1[i] = arr2[i];  // Otherwise, replace current
                        }
                    }
                } else {
                    arr1[i] = arr2[i];  // Add new property to arr1
                }
            }
        }
        return arr1;
    };
    
    
    VuejsDialog.default.prototype.warn = function(message = null, options = {}){
        if(getClass(message) !== 'String') {
            var body = '';
            var title = 'Error';
            if(message.title && message.body) {
                body = message.body;
                title = message.title;
            } else {
                body = message;
            }
            if(getClass(body) !== 'String') {
                body = '<div style="font-size:70%;word; white-space: normal;word-wrap:normal;">' 
                    + JSON.stringify(body) + '</div>';
            }
        }
        else {
            body = message;
        }
        options = array_merge(options, {okText:'Закрыть', html:true});
        
        return this.alert({title:title,body:body}, options);
    };
    
    window.v_alert = new Vue({
        methods: {
            show: function(msg) {
                this.$dialog.warn(msg).then(function() {
                    console.log('alert closed');
                });
            }
        }
    });    
    
    
    if (!BX24) {
        $('#main').empty();
        document.write('<h1>NO BX24!</h1>');

        alert('no BX24');
        return;
    } else {
        BX24.init(function () {
            app.starting = true;
            initapp(function () {
                var s = BX24.getScrollSize();
                BX24.resizeWindow(s.scrollWidth, 800, function (s) {
                    //console.log('resize callback', s);
                });
                vueapp();
            });
        });
    }
        
})();

function application() {
    this.debug = false;
    this.starting = false;
    
    //this.strictRole = true;
    //this.folder_id = 1039;  // set it or create at the installation jr in 'options'
    
    this.options = [];
    this.graph = [];
    
    this.dbname = '';
    this.userInfo = [];
    this.userList = [];
    this.userList2 = [];
    this.roles = [];
    this.userRoles = [];
    this.dealCatList = undefined;
    
    this.col_vis = [
        true,
        true,
        true,true,true,true,true,
        true,true,true,true,
        true,true,true,true,
        true,true,true,true,true];
    this.cols = [];
}

application.prototype.loadGraph = function () {
    var params = array_merge({'operation': 'getGraph', 'dbname': app.dbname}, BX24.getAuth());
    console.log(params);
//    var self = this;
    //v_alert.show({title:'ok', body:params});
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'app/maincntr.php',
            type: 'POST',
            dataType: 'json',
            data: params
        }).done(
                function (data) {
                    console.log('resolve graph');
                    console.log('status', data.status);
                    var e = false;
                    //self.graph = data.result;
                    if(data.status === 'success') {
                        data.result.states.forEach(function (el) {
                        // console.log(el);
                            if (el.resp.trim() === '') {
                                e = true;
                                return;
                            }
                        });
                    
                        if (e) {
                            console.log('empty resp');
                            v_alert.show('Errorin BP graph! empty resp');
                            reject('empty resp');
                        } else {
//                        self.graph = data.result;
                            resolve(data.result);
                        }
                    }  else {
                        v_alert.show({title:'Load BP error', body:data.result});
                        reject(data.result);
                    }
                    
                }).fail(function (e) {
                    console.log(e);
                    v_alert.show({title:'Error load BP', body:e});
                    reject(e);
                });                
    });
};

application.prototype.getGridDataSync = async function (npage, rcount, role_id, user_id) {
    var dbname = this.dbname;;
    //var self = this;
    console.log('ROLEID', role_id);
    var params = array_merge(
            {
                operation: 'getGridData', 
                dbname: dbname, 
                npage: npage, 
                rcount: rcount,
                strictroles: app.strictRole,
                role_id: role_id,
                user_id: user_id
            }, BX24.getAuth());
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'app/maincntr.php',
            async: true,
            type: 'POST',
            dataType: 'json',
            data: params}).done(
                function (data) {
                    console.log('resolve grid', data);
                    resolve(data.result);                    
                }).fail(
                function (e) {
                    console.log(e);
                    v_alert.show(e);
                    reject(['error', e]);
                });
    });
};

application.prototype.loadOptions = async function () {
    var dbname = app.dbname;
    console.log('resolve options dbname', dbname);
    var params = array_merge({
        'operation': 'getOptions',
        'dbname': dbname,
        'userId': app.userInfo.result.ID
    }, BX24.getAuth());
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'app/maincntr.php',
            async: true,
            type: 'POST',
            dataType: 'json',
            data: params}).done(
                function (data) {
                    console.log('options', data.result);
                    /*
                    app.options = data.result;
                    app.strictRole = app.options[0].strictroles;
                    app.folder_id = app.options[0].folder_id;
                    */
                    resolve(data.result);
                }).fail(
                function (e) {
                    console.log(e);
                    v_alert.show(e);
                    reject({error:e});
                });
    });
};

application.prototype.getDbname = function () {
    var dbname;
    return new Promise((resolve, reject) => {
        BX24.callMethod('entity.item.get', {
            ENTITY: 'Options',
            SORT: {DATE_ACTIVE_FROM: 'ASC'},
            FILTER: {}
        },
                function (result) {
                    if (result.error()) {
                        console.error(result);
                        v_alert.show(result);
                        reject({error: result});
                    } else
                    {
                        var data = result.data();
                        dbname = data[0].PROPERTY_VALUES.dbname;
                        console.log('resolve dbname', dbname);
                        resolve(dbname);
                    }
                });
    });
};

application.prototype.getUserInfo = function() {
    var ga = BX24.getAuth();
    var dbname = this.dbname;
    var params = array_merge({'operation': 'getUserInfo', 'dbname': dbname }, 
            ga);
    return new Promise((resolve, reject) => {        
        $.ajax({
            url: 'app/auxcntr.php',
            async: true,
            type: 'POST',
            dataType: 'json',
            data: params}).done(
                function (data) {
                    //console.log('gUI data', data);
                    //self.userInfo = data.result;
                    console.log('resolve userinfo', data.result);
                    resolve(data.result);
                }).fail(
                function (e) {
                    console.log(e);
                    v_alert.show(e);
                    reject({error: e});
                });
    });
};

application.prototype.loadUserList = function() {
    var ga = BX24.getAuth();
    var dbname = app.dbname;
    console.log('loadUserList', dbname);
    var params = array_merge({'operation': 'loadUserList', 'dbname': dbname}, 
            ga);
    var self = this;
    return new Promise((resolve, reject) => {
        
        $.ajax({
            url: 'app/auxcntr.php',
            async: true,
            type: 'POST',
            dataType: 'json',
            data: params}).done(
                function (data) {
                    console.log('resolve userlist', data.result);
                    //self.userList = data.result;
                    var a = data.result.result;                    
                    //self.userList2
                    var b = a.map(i => {
                        return {ID:i.ID, NAME: i.NAME + ' ' + i.LAST_NAME};
                    });
                    
                    console.log('userList2', b);
                    resolve([data.result, b]);
                    
                }).fail(
                function (e) {
                    console.log('loadUserList error', e);
                    v_alert.show(e);
                    reject(['error', e]);
                });
    });
};

application.prototype.loadVZak = function () {
    var dbname = app.dbname;
    var params = array_merge({'operation': 'getVZak',
        'dbname': dbname}, BX24.getAuth());
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'app/maincntr.php',
            async: true,
            type: 'POST',
            dataType: 'json',
            data: params}).done(
                function (data) {
                    console.log('resolve VZ1', data.result);
                    resolve(data.result);
                }).fail(
                function (e) {
                    console.log('VZE', e);
                    v_alert.show( e);
                    reject(['error', e]);
                });
    });
};

application.prototype.getRoles = function () {
    var dbname = app.dbname;
    console.log('getRoles', dbname);
    var params = array_merge(
            {
                operation: 'getRoles',
                dbname: dbname
            }, BX24.getAuth());
    var self = this;
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'app/maincntr.php',
            async: true,
            type: 'POST',
            dataType: 'json',
            data: params}).done(
                function (data) {
                    console.log('resolve roles', data.result);
                    //self.roles = data.result;
                    resolve(data.result);
                }).fail(
                function (e) {
                    console.log('RE', e);
                    v_alert.show(e);
                    reject(['error', e]);
                });
    });
};

application.prototype.getUserRoles = function () {
    var dbname = app.dbname;
    var params = array_merge({'operation': 'getUserRoles',
        'dbname': dbname}, BX24.getAuth());
    var self = this;
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'app/maincntr.php',
            async: true,
            type: 'POST',
            dataType: 'json',
            data: params}).done(
                function (data) {
                    console.log('resolve user roles', data.result);
//                    self.userRoles = data.result;
                    resolve(data.result);
                }).fail(
                function (e) {
                    console.log('URERE', e);
                    v_alert.show(e);
                    reject(['error', e]);
                });
    });
};

application.prototype.getAuxList = function(k) {
    if(k === 'dcl') {
        return app.dealCatList;
    }
    else if(k === 'rsl') {
        return app.userList2;  //  not the same
    }
    else if(k === 'rrl') {
        return app.roles;
    }
    else {
        return [];
    }
};

application.prototype.loadDealCatList = function () {
    var dbname = app.dbname;
    var params = array_merge({'operation': 'loadDealCatList',
        'dbname': dbname}, BX24.getAuth());
    var self = this;
    return new Promise((resolve, reject) => {
        if (!self.dealCatList) { // ??
            $.ajax({
                url: 'app/auxcntr.php',
                async: true,
                type: 'POST',
                dataType: 'json',
                data: params}).done(
                    function (data) {
                        console.log('LDCL', data.result[0]);
                        //self.dealCatList = data.result[0];  // ??
                        resolve(data.result[0]);
                    }).fail(
                    function (e) {
                        console.log('LDCLE', e);
                        v_alert.show(e);
                        reject(['error', e]);
                    });
        } else {
            resolve(self.dealCatList);
        }
    });
};

application.prototype.getRole = function (user_id) {
    var ur = app.userRoles.find(function (el) {
        return el.user_id == user_id;
    });
    if (ur) {
        var rid = ur.role_id;
        var rr = app.roles.find(function (el) {
            return el.id == rid;
        });
        if (rr) {
            return rr;
        }
    }
    return {id: 0, role: 'None'};
};

application.prototype.getRoleId = function (role) {
    var ur = app.roles.find(function (el) {
        return el.role === role;
    });
    if (ur) {
        return ur.id;
    }
    return false;
};

application.prototype.getNextStates = function(state) {
    var b_count = state.tr.length;
    if(b_count < 2) return false;
    var t2;
    
    var t1 = this.graph.states.find(function (el) {
        return el.tr[0] == state.tr[1];
    });
    
    if(b_count == 3) {
        t2 = this.graph.states.find(function (el) {
            return el.tr[0] == state.tr[2];
        });      
    }
    if(!t1) return false;
    if(!t2) return [t1];
    return [t1, t2];
    
};

application.prototype.getStateRoleId = function(state) {
    var t1 = this.graph.states.find(function (el) {
        return parseInt(el.tr[0]) === state;
    });
    var role = t1.resp;
    return this.getRoleId(role);
}

application.prototype.getFileData = function (id) {
    return new Promise((resolve, reject) => {
        BX24.callMethod(
                "disk.file.get",
                {
                    id: id
                },
                function (result)
                {
                    if (result.error()) {
                        console.error(result.error());
                        reject([]);
                    }
                    else {
                        console.dir(result.data());
                        resolve(result.data);
                    }
                }
        )
    });

}

application.prototype.getFileUrl = async function(id) {
    var res = await app.getFileData(id);
    console.log('file:', res);
    return res.DOWNLOAD_URL;
}

var app = new application();

application.prototype.dates = {
    convert:function(d) {
        return (
            d.constructor === Date ? d :
            d.constructor === Array ? new Date(d[0],d[1],d[2]) :
            d.constructor === Number ? new Date(d) :
            d.constructor === String ? new Date(d) :
            typeof d === "object" ? new Date(d.year,d.month,d.date) :
            NaN
        );
    },
    compare:function(a,b) {
        return (
            isFinite(a=this.convert(a).valueOf()) &&
            isFinite(b=this.convert(b).valueOf()) ?
            (a>b)-(a<b) :
            NaN
        );
    },
    inRange:function(d,start,end) {
       return (
            isFinite(d=this.convert(d).valueOf()) &&
            isFinite(start=this.convert(start).valueOf()) &&
            isFinite(end=this.convert(end).valueOf()) ?
            start <= d && d <= end :
            NaN
        );
    }
};

async function initapp(cb) {
    try {
    app.dbname = await app.getDbname();
    app.userInfo = await app.getUserInfo();

    app.options = await app.loadOptions();
    
    app.strictRole = app.options[0].strictroles;
    app.folder_id = app.options[0].folder_id;
    
    var u = await app.loadUserList();
    app.userList = u[0];
    app.userList2 = u[1];
    
    if(app.dealCatList === undefined)
        app.dealCatList = await app.loadDealCatList();
    app.userRoles = await app.getUserRoles();
    
    app.roles = await app.getRoles();
    app.graph = await app.loadGraph();
    }
    catch(e) {
        console.log('catch', e);
    }
    cb();
}

var bus = new Vue;
var optbutton;
var newbutton;
var maingrid;
var optusergrid;
var mainform ;
var archivebut;
var editorbut;
var dpicker;
var v_alert;
var ddmenu;

// .......................................................................
    
Vue.component('main-grid', {
    template: '#grid-template',
    props: {
        columns: Array,
        filterKey: String
    },
    data: function () {        
        var sortOrders = {};
        this.columns.forEach(function (key) {
            sortOrders[key.data] = 1;
        });
        return {
            col_vis: app.col_vis,
            sortKey: '',
            sortOrders: sortOrders,
            gridDataUpd: false,  //  required to update grid
            npage: 0,
            rcount: 10,
            trstyle: ''
        };
    },

    mounted: function () {
        var self = this;
        bus.$on('grid-update', function (n) {
            console.log('UPD', self, n);
            self.gupd();
        });
    },
    asyncComputed: {
        filteredData: {
            get: async function () {
                return this.fdata(this.gridDataUpd); // parameter is required to update grid                
            }
        }
    },
    filters: {
        capitalize: function (str) {
            return str; // str.charAt(0).toUpperCase() + str.slice(1);
        }
    },
    methods: {
        
        fdata: async function (gdu) {
            //console.log('APPCOLS',app.cols);  //emty on start
            this.col_vis = app.col_vis;
            var role = app.getRole(app.userInfo.result.ID);
            var user_id = app.userInfo.result.ID;
            var sortKey = this.sortKey;
            var filterKey = this.filterKey && this.filterKey.toLowerCase();
            var order = this.sortOrders[sortKey] || 1;
            var data = await app.getGridDataSync(this.npage, this.rcount, role.id, user_id); // this.data
            //console.log('Data', data);
            if (filterKey) {
                data = data.filter(function (row) {
                    return Object.keys(row).some(function (key) {
                        return String(row[key]).toLowerCase().indexOf(filterKey) > -1;
                    });
                });
            }
            if (sortKey) {
                data = data.slice().sort(function (a, b) {
                    a = a[sortKey];
                    b = b[sortKey];
                    return (a === b ? 0 : a > b ? 1 : -1) * order;
                });
            }
            
            return data;
        },
        sortBy: function (key) {
            this.sortKey = key;
            this.sortOrders[key] = this.sortOrders[key] * -1;
            this.gupd();
        },
        vcalc(key) {
            var r = this.columns.findIndex(function(el) {
                return el.data == key.data;
            });
            if(r > -1) {
                return this.col_vis[r] ? 'display:table-cell':'display:none';
            }
            return 'display:table-cell';
        },
        scalc(entry, key) {
            //console.log('entry', entry)
            var trstyle = '';
            var ret = entry[key.data];

            if(key.data === 'date_end') {
                var d = ret;
                var c;
                if(d) {
                    var dt = app.dates.convert(d);
                    
                    c = isNaN(dt) ? NaN : app.dates.compare(new Date(), dt);
                    //console.log('converted: ', dt);
                    
                    if(c > 0) {
                        trstyle = 'background-color:#ffdddd;color:red;';
                    }
                    else if(c == 0) {
                        trstyle = 'background-color:#dffdad;color:brown;';                        
                    }
                    else if(isNaN(c)) {
                        trstyle = 'background-color:#dfad99;color:blue;';
                    }
                    else {
                        //trstyle = '';
                    }
                    //entry[key.data] = dt;
                }
                else {
                   ret = 'Неверная дата';
                   trstyle = 'background-color:#dfad99;color:blue;';
                }
            }
            if(key.replace !== undefined) {
                //console.log('key2', key);
                if(key.replace === 'state') {
                    var r = app.graph.states.find(function(el) {
                        return el.tr[0] == ret;
                    });     
                    ret = r.name + ' (' + ret + ')';
                }
                else if(key.replace === 'rrl') {
                    var lst = app.getAuxList(key.replace);
                    var f = lst.find(function(e,i,a){
                        //console.log('E', e.ID, entry);
                        var id = e.id;
                        return id == ret ;
                    });
                    if(f) {
                        ret =  f.role;
                    }
                    else {
                        ret =  'UNDEF!';
                        trstyle = 'color:green;'
                    }
                }
                else if(key.replace === 'rsl' || key.replace === 'dcl' ) {
                    var lst = app.getAuxList(key.replace);
                    var f = lst.find(function(e,i,a){
                        //console.log('E', e.ID, entry, key.replace, ret);
                        var id = e.ID;
                        return id == ret ;
                    });
                    if(f) {
                        ret =  f.NAME;
                    }
                    else {
                        ret =  'UNDEF!';
                        trstyle = 'color:green;';
                    }
                }
                else {
                    // 
                }
            }
            if(trstyle) {
                ret = '<div style="' + trstyle + '">' +  ret + '</div>';
            }
            return ret;
        },
        gupd: function () {
            //console.log('m.b.u', this.gridDataUpd)
            this.gridDataUpd = !this.gridDataUpd;
        },
        
        prevpage: function() {
            if(this.npage <= 0) {
                return;
            }
            this.npage --;
            this.gupd();
        },
        nextpage: function() {
            this.npage ++;
            this.gupd();            
        },
        click: function (id, state, entry) {
            mainform.itemId = id;
            mainform.gridLine = entry;
            mainform.itemState = state;
            // mainform.show = false;
            ddmenu.close();
            mainform.show = true;
        },
        menu:function(event) {
            console.log('menu', event);
            var x = event.screenX;
            var y = event.screenY;
            ddmenu.open('#dd-menu',  {x:x, y:y});
        }
    }
});


Vue.component('opt-user-grid', {
    template: '#opt-user-grid-template',
    props: {
        columns: Array
    },
    data: function() {
        return {
            userlist: app.userList2,
            whom: '',
            gridDataUpd: false  //  required to update grid
        };
    },
    mounted: function() {
        var self = this;
        bus.$on('user-grid-update', function (n) {
            console.log('User grid UPD', self, n);
            self.gupd();
        });        
    },
    asyncComputed: {
        userlist_r: async function() {
            return this.userlist_raux(this.gridDataUpd);
        }
    },
    methods: {
        getEntry: function(e, k) {
            //console.log(e,k);
            return e[k];
        },
        trclick: function(entry) {            
            this.whom = entry;
            bus.$emit('msg-whom', entry);
        },
        
        gupd: function () {            
            this.gridDataUpd = !this.gridDataUpd;
        },
        userlist_raux: async function(gupd) {
            // reload list?
            await app.getUserRoles();
            var u = this.userlist.map(el => {
                var role = app.getRole(el.ID);
                return {'ID':el.ID,
                    'NAME':el.NAME,
                    'role_id':role.id,
                    'role':role.role};
            });
            return u;
        }        
    }
});

Vue.component('main-form', {
    template: '#mainform-template',
    props: {
        id: String,
        state: String,
        record: Object        
    },
    data: function () {
        return {
            debug: app.debug,
            disablebuttons: false,
            d_inRole: false,
            privatemsg: true,
            whom_selected: '',
            message: '',
            upprc: 0,
            dataUpd: false,
            cmsg: [],
            whom_options: app.userList2,            
            dirty: false,
            rec: this.record,
            admin: app.userInfo.admin,
            userinfo: app.userInfo.result,
            somefile1: '', // TZ
            somefile1_obj: [],
            somefile2: '',
            somefile2_obj: [],
            
            d_tzfiles: [],
            d_dzfiles: []
        };
    },
    computed: {
        sObject: function () {
            console.log('sObject called');
            var res = app.graph.states.find(function (el) {
                return el.tr[0] == this.state;
            }, this);

            return res === undefined ? {err: 'state not found'} : res;
        },
        resp_role: function () {
            var res = app.roles.find(function (el) {
                return el.id == this.rec.resp_role_id;
            }, this);
            return res == undefined ? {err: 'role not found'} : res.role;
        },
        nextStates: function() {
            return app.getNextStates(this.sObject);
        },
        currentRole: function() {
            var uid = this.userinfo.ID;
            return app.getRole(this.userinfo.ID);
            var ur = app.userRoles.find(function(el) {
                return el.user_id == uid;
            });
            if(ur) {
                var rid = ur.role_id;
                var rr = app.roles.find(function(el) {
                    return el.id == rid;
                });
                if(rr) {
                    return rr;
                }
            }
            return {id:0,role:'None'};
        }
    },
    asyncComputed: {
        getComments: async function() {
            return this.comments(this.dataUpd);
        },
        tzfiles: async function() {
            //this.d_tzfiles = await app.getFiles('tzfiles', this.rec.id);
            //return this.d_tzfiles;
            return this.getFiles('tzfiles', this.rec.id, this.dataUpd);
        },
        dzfiles: async function() {
            //this.d_dzfiles = await app.getFiles('dzfiles', this.rec.id);            
            //return this.d_dzfiles;
            return this.getFiles('dzfiles', this.rec.id, this.dataUpd);
        }
    },
    mounted: function() {
        this.dirty = false;
        this._inRole = this.inRole();
        var self = this;
        self.d_tzfiles = self.tz_files;
        self.d_dzfiles = self.dz_files;
        self.cmsg = self.getComments;
            
        bus.$on('message-saved', function (n) {            
            console.log('saved');
            self.message = '';
            self.dataUpd = ! self.dataUpd;
            self.cmsg = self.getComments;  // ??
        });        
        bus.$on('files-changed', function (n) {
            console.log('files-changed');
            self.dataUpd = ! self.dataUpd;
            self.d_tzfiles = self.tzfiles;
            self.d_dzfiles = self.dzfiles;
        });        
    },
    methods: {
        emitter: function (event, data) {
            this.$emit(event, data);
            if(event === 'start') {
                this.upprc = 0;
                this.showupload = true;
            }
            if(event === 'finish') {
                this.showupload = false;
            }
            if(event === 'progress') {
                this.upprc = data;
            }
            //console.log(event, data);
        },

        getFiles: function (table, card_id, gupd) {
            var self = this;
            console.log('getFiles called');
            var dbname = app.dbname;
            var params = array_merge({
                'operation': 'loadFiles',
                table: table,
                card_id: card_id,
                'dbname': dbname
            }, BX24.getAuth());
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: 'app/maincntr.php',
                    async: true,
                    type: 'POST',
                    dataType: 'json',
                    data: params}).done(
                        function (data) {
                            console.log('getfiles', data.result);
                            /*
                            var files = data.result.map(i => {
                                return {
                                    file_id: i.file_id,
                                    file_name: i.file_name,
                                    file_url: app.getFileUrl(i.file_id)
                                };
                            });
                            */
                           var files = data.result;
                            if(table === 'tzfiles') self.d_tzfiles = files;//data.result;
                            if(table === 'dzfiles') self.d_dzfiles = files;//data.result;
                            resolve(files);
                        }).fail(
                        function (e) {
                            console.log('getfiles', e);
                            v_alert.show(e);
                            reject(['error', e]);
                        });
            });
        },
        
        filesChange(name, files) {
            console.log('FileC', name);
            console.log('Files:', files, files.length);
            if (name === 'somefile1') {
                this.somefile1_obj = files;
                this.somefile1 = 'somefile1';
                this.uploadFiles('tzfiles', files);
            } else if (name === 'somefile2') {
                this.somefile2_obj = files;
                this.somefile2 = 'somefile2';
                this.uploadFiles('dzfiles', files);
            } else {
                console.log('FC?');
            }
        },
        
        uploadFiles(table, files) {
            var dbname = app.dbname;
            var params = array_merge({
                'operation': 'addFiles',
                table: table,
                'dbname': dbname,
                id: this.rec.id,
                folder_id: app.folder_id,
            }, BX24.getAuth());
            var fdata = new FormData();
            
            $.each(params, function (k, v) {
                fdata.append(k, v);
            });
            var self = this;
                var len = files.length;
                for (var i = 0; i < len; i++) {
                    fdata.append(table + '_' + i, files.item(i));
                }
            $.ajax(
                    {
                        url: 'app/maincntr.php',
                        type: 'POST',
                        dataType: 'json',
                        processData: false,
                        cache: false,
                        contentType: false,
                        enctype: 'multipart/form-data',
                        data: fdata, // params,

                        xhr: function () {
                            var jqXHR = window.ActiveXObject ?
                                    new window.ActiveXObject("Microsoft.XMLHTTP") :
                                    new window.XMLHttpRequest();

                            jqXHR.onloadstart = function (e) {
                                self.emitter('start', e);
                            };
                            jqXHR.onloadend = function (e) {
                                self.emitter('finish', e);
                            };
                            //Upload progress
                            jqXHR.upload.addEventListener("progress", function (evt) {
                                if (evt.lengthComputable) {
                                    var percentComplete = Math.round((evt.loaded * 100) / evt.total);
                                    self.emitter('progress', percentComplete);
                                }
                            }, false);
                            //Download progress
                            jqXHR.addEventListener("progress", function (evt)
                            {
                                if (evt.lengthComputable) {
                                    var percentComplete = Math.round((evt.loaded * 100) / evt.total);
                                    self.emitter('progress', percentComplete);
                                }
                            }, false);

                            return jqXHR;
                        }
                    }).done(function (resp) {
                var status = resp.status;
                if (status === 'success') {
                    bus.$emit('files-changed', 1);
                } else {
                    console.log('error', resp);
                    self.$dialog.warn(resp);
                }
            }).fail(function (e) {
                console.log('ajax error', e);
                self.$dialog.warn(e);
            });

        },
        
        deleteFile(id) {
            console.log('delete file', id);
            var dbname = app.dbname;
            var params = array_merge({
                'operation': 'deleteFile',
                'dbname': dbname,                
                'id': id
            }, BX24.getAuth());
            return new Promise((resolve, reject) => {
            $.ajax(
                    {
                        url: 'app/maincntr.php',
                        type: 'POST',
                        dataType: 'json',
                        data: params}).
                        done(function (resp) {
                            var status = resp.status;
                            if (status == 'success') {
                                resolve(resp.result);
                                bus.$emit('files-changed', 1);
                            } else {
                                console.log('error', resp);
                                reject(resp);
                            }
                        }).fail(function (e) {
                            console.log(e);
                            reject(e);
                        }                    
                );
            });            
            
        },
        
        comments: function (gupd) {
            var self = this;
            console.log('comments called');
            
            var id = this.rec.id;
            var dbname = app.dbname;
            var params = array_merge({
                'operation': 'getComments',
                'dbname': dbname,                
                'id': id,
                'user_id': this.userinfo.ID,
                'user_name': this.userinfo.NAME
            }, BX24.getAuth());
            return new Promise((resolve, reject) => {
            $.ajax(
                    {
                        url: 'app/maincntr.php',
                        type: 'POST',
                        dataType: 'json',
                        data: params}).
                        done(function (resp) {
                            var status = resp.status;
                            // console.log(status, resp.result);
                            self.cmsg = resp.result;
                            if (status == 'success') {
                                resolve(resp.result);                            
                            } else {
                                console.log('error', resp);
                                reject(resp);
                            }
                        }).fail(function (e) {
                            console.log(e);
                            reject(e);
                        }                    
                );
            });            
        },        
        saveMessage: function (id, state, action = '') {
            console.log('saveMessage', id, this.userinfo);
            var dbname = app.dbname;
            var self = this;
            // send data to server
            var params = array_merge({
                'operation': 'saveMessage',
                'dbname': dbname,
                'id': id,
                'private': this.privatemsg ? 1:0,
                'whom': this.whom_selected,
                'state': state,
                'message': this.message,
                'author': this.userinfo.ID,
                'user_name': (this.userinfo.NAME + ' ' + this.userinfo.LAST_NAME),
                'action': action
            }, BX24.getAuth());
            $.ajax(
                    {
                        url: 'app/maincntr.php',
                        type: 'POST',
                        dataType: 'json',
                        data: params,
                        success: function (resp) {
                            var status = resp.status;
                            // console.log(status, resp.result);
                            if (status == 'success') {
                                bus.$emit('message-saved', 1);
                            } else {
                                console.log('error', resp);
                                self.$dialog.warn(resp);
                            }
                        },
                        error: function (e) {
                            console.log(e);
                            v_alert.show(e);
                        }
                    }
            );
        },
        save: function (id, state, so) {
            this.saveandnext0(id, state, so, false, state.resp);
        },

        saveandnext: function (id, state, so, nextresp) {
            if(!this.disablebuttons) {
                this.disablebuttons = true;
                this.saveandnext0(id, state, so, true, nextresp);
            }
        },
        
        saveandnext0: function (id, state, so, next, nextresp) {
            console.log('saveandnext', id, state);
            console.log('so: ', so); // so - next state
            //console.log('REC', this.rec);
            var nrid;
            if(nextresp) {
                nrid = app.getRoleId(nextresp);
            } else {
                nrid = '';
            }
            var dbname = app.dbname;
            var self = this;
            // send data to server
            var params = array_merge({
                operation: 'saveandnext',
                dbname: dbname,
                next: next ? 'next' : 'cur',
                id: id,
                resp_role_id: nrid,
                rec: this.rec,
                author: this.userinfo.ID,
                state: state,
                so: so,
                so_cur: state.tr[0],
                nextresp: nextresp
            }, BX24.getAuth());
            console.log(params);
            this.$validator.validateAll().then((result) => {
                if (result) {
                    $.ajax(
                            {
                                url: 'app/maincntr.php',
                                type: 'POST',
                                dataType: 'json',
                                data: params,
                                success: function (resp) {
                                    var status = resp.status;
                                    // console.log(status, resp.result);
                                    if(status == 'success') {
                                        bus.$emit('grid-update', 1);
                                        self.dirty = false;
                                        if(next) {
                                            mainform.show = false;
                                        }
                                    }
                                    else {
                                        console.log('error', resp);
                                        self.$dialog.warn(resp);
                                    }
                                },
                                error: function (e) {
                                    console.log(e);
                                    self.$dialog.warn(e);
                                }
                            }
                    );
                    this.disablebuttons = false;
                    return;
                }
                console.log('validate errors!');
            });
            this.disablebuttons = false;
        },
        deleteCard(id) {
            var card_author = this.rec.author;
            var user =  this.userinfo.ID;
            var responsible = this.rec.responsible;
            console.log('del: ', id, card_author, user, responsible); // so - next state
            var dbname = app.dbname;
            var params = array_merge({
                'operation': 'deleteCard',
                'dbname': dbname,
                'id': id,
                'author': user
            }, BX24.getAuth());  
            $.ajax({
                        url: 'app/maincntr.php',
                        type: 'POST',
                        dataType: 'json',
                        data: params
                    }).done(function (resp) {
                            var status = resp.status;
                            // console.log(status, resp.result);
                            if (status === 'success') {
                                bus.$emit('grid-update', 1);
                                this.dirty = false;
                                mainform.show = false;
                            } else {
                                console.log('error', resp);
                                v_alert.show(resp);
                            }
                        }).fail(function (e) {
                            v_alert.show(e);
                            console.log(e);
                        });            
        },
        cancel() {
            if(this.dirty) {
                v_alert.show('some inputs are changed!');
            }
            this.dirty = false;
            mainform.show = false;
        },
        b_count: function () {
            return (this.sObject.tr.length);
        },
        doaction(aid, state) {
            console.log('Action ', aid, state);
            this.message = state.action;
            this.saveMessage(aid, state.tr[0], state.action);
        },
        mDirty(e) {
            console.log('MD', e);
                this.dirty = true;           
        },
        get_name:function(id) {
            var rc = app.userList2.find(function(el) {
                return el.ID == id;
            });
            return rc ? rc.NAME : 'System';
        },
        inRole: function() {
            var ur = this.currentRole.role;
            var ar = this.sObject.resp;
            var rc;
            //console.log('urole', ur,  'arole', ar);
            if(typeof ar === 'string') {
                //console.log('role ok', app.options[0].strictroles==0);
                rc =  ar === '' ? (app.options[0].strictroles==0) : ur === ar;
            }
            else {
                rc = ar.find(function(el) {
                    return el === ur;
                });
            }
            
            rc =  !!rc;
            rc = (rc ||  (app.userInfo.result.ID == this.rec.responsible)); // responsibla always in role
            rc = (rc || (this.currentRole.id == this.rec.resp_role_id));
            //console.log('role rc', rc,app.userInfo.result.ID, this.rec.responsible);
            this.d_inRole = rc;
            return rc;
        },
        deleteCard2: function() {
            var id = this.rec.id;
            console.log('del ok', id);
            this.deleteCard(id);
        },
        doNothing: function() {
            console.log('do nothing');        
        }
    }
});

Vue.component('newcard-form', {
    template: '#formnew-template',
    data: function () {
        return {
            debug: app.debug,
            disablebuttons: false,
            showupload: false,
            upprc: 0,
            vidzak: '',
            nomzak: 'N',
            linkzak: 'https://',
            namezak: '',
            zakazchik: '',
            vz_selected: '',
            dc_selected: '',
            resp_selected: '',
            resp_role_selected: '',
            vz_options: [],
            dateend: '',
            somefile1: '', // TZ
            somefile1_obj: [],
            somefile2: '',
            somefile2_obj: []
        };
    },
    computed: {
        dealcats: function () {
            return app.dealCatList;
        },
        resp_options: function () {
            var res = app.userList2;
            // create user {id,name} array
            return res;
        },
        resp_role_options: function () {
            var res = app.roles;
            // create user {id,name} array
            return res;
        }
    },
    asyncComputed: {

        vz_options: async function () {
            var d = await app.loadVZak();
            this.vz_options1 = d;
            return d;
        }
    },
    methods: {
        emitter: function (event, data) {
            this.$emit(event, data);
            if(event === 'start') {
                this.upprc = 0;
                this.showupload = true;
            }
            if(event === 'finish') {
                this.showupload = false;
            }
            if(event === 'progress') {
                this.upprc = data;
            }
            //console.log(event, data);
        },
        save: function () {
            if(this.disablebuttons) {
                return;
            }
            this.disablebuttons = true;
            var self = this;
            var init_state = 1;
            //var role_id = this.resp_role_selected;
            var role_id = app.getStateRoleId(init_state); // state = 1. start
            var data = {
                folder_id: app.folder_id,
                state: init_state, // state:1 !!!!
                //author: app.userInfo.ID,
                vidzak: this.vz_selected,
                nomzak: this.nomzak,
                linkzak: this.linkzak,
                namezak: this.namezak,
                zakazchik: this.zakazchik,
                dealcat: this.dc_selected,
                resp: this.resp_selected,
                author: app.userInfo.result.ID,
                dateend: this.customFormatter(this.dateend),
                resp_role_id: role_id
            };

            var auth = BX24.getAuth();
            console.log('auth', auth);

            var fdata = new FormData();

            this.$validator.validateAll().then((result) => {
                if (result) {
                    var dbname = app.dbname;
                    var params = array_merge({
                        'operation': 'savenew',
                        'dbname': dbname
                    }, BX24.getAuth());
                    $.each(params, function (k, v) {
                        fdata.append(k, v);
                    });
                    $.each(data, function (k, v) {
                        fdata.append(k, v);
                    });
                    var self = this;
                    if (this.somefile1) {
                        var len = this.somefile1_obj.length;
                        for(var i = 0; i < len; i ++) {
                            fdata.append(this.somefile1 + '_' + i, this.somefile1_obj.item(i));
                        }
                    }
                    if (this.somefile2) {
                        var len = this.somefile2_obj.length;
                        for(var i = 0; i < len; i ++) {
                            fdata.append(this.somefile2 + '_' + i, this.somefile2_obj.item(i));
                        }
                    }
                    $.ajax(
                            {
                                url: 'app/maincntr.php',
                                type: 'POST',
                                dataType: 'json',
                                processData: false,
                                cache: false,
                                contentType: false,
                                enctype: 'multipart/form-data',
                                data: fdata, // params,

                                xhr: function () {
                                    var jqXHR =  window.ActiveXObject ?
                                        new window.ActiveXObject("Microsoft.XMLHTTP") :
                                        new window.XMLHttpRequest();
                                    
                                    jqXHR.onloadstart = function (e) {
                                        self.emitter('start', e);
                                    };
                                    jqXHR.onloadend = function (e) {
                                        self.emitter('finish', e);
                                    };
                                    //Upload progress
                                    jqXHR.upload.addEventListener("progress", function (evt) {
                                        if (evt.lengthComputable) {
                                            var percentComplete = Math.round((evt.loaded * 100) / evt.total);
                                            self.emitter('progress', percentComplete);
                                        }
                                    }, false);
                                    //Download progress
                                    jqXHR.addEventListener("progress", function (evt)
                                    {
                                        if (evt.lengthComputable) {
                                            var percentComplete = Math.round((evt.loaded * 100) / evt.total);
                                            self.emitter('progress', percentComplete);
                                        }
                                    }, false);

                                    return jqXHR;
                                }
                            }).done(function (resp) {
                                var status = resp.status;
                                if (status === 'success') {
                                    bus.$emit('grid-update', 1);
                                    newbutton.show = false;
                                } else {
                                    console.log('error', resp);
                                    self.$dialog.warn(resp);
                                }
                            }).fail(function (e) {
                                console.log('ajax error', e);
                                self.$dialog.warn(e);
                            });

                    this.disablebuttons = false;
                    return;
                }
                console.log('validate errors!', this.$validator);
                self.$dialog.warn('validate errors!');
            });
            this.disablebuttons = false;
        },
        filesChange(name, files) {
            console.log('FileC', name);
            console.log('Files:', files, files.length);
            if (name === 'somefile1') {
                this.somefile1_obj = files;
                this.somefile1 = 'somefile1';
            } else if (name === 'somefile2') {
                this.somefile2_obj = files;
                this.somefile2 = 'somefile2';
            } else {
                console.log('FC?');
            }
        },
        cancel() {
            newbutton.show = false;
            //maingrid.show = !maingrid.show;
        },
        customFormatter(date) {
            if (!date)
                return '';
            var dd = date.getDate();
            if (dd < 10)
                dd = '0' + dd;

            var mm = date.getMonth() + 1;
            if (mm < 10)
                mm = '0' + mm;

            var yy = date.getFullYear() % 100;
            //if (yy < 10) yy = '0' + yy;

            return dd + '.' + mm + '.' + yy;
        }
    }
});

Vue.component('atooptions-form', {
    template: '#atooptions-template',
    props: {
        columns: Array
    },
    data: function () {
        return {
            debug: app.debug,
            
            folder_id: app.options[0].folder_id,
            strictroles: app.options[0].strictroles,
            d_strictroles: app.options[0].strictroles != 0,
            admin: app.userInfo.admin ? 'Y' : 'N',
            isadmin: app.userInfo.admin,
            userinfo: app.userInfo.result,
            userlist: app.userList2,
            selectedUser: '',
            role_options: array_merge([{'id':0,'role':'None'}],app.roles),
            role_sel: '',
            role_sel_id: ''
        };
    },

    mounted: function () {
        console.log('options mounted');
        var self = this;
        bus.$on('msg-whom', function (n) {
            self.selectedUser = n;
            r = self.role_options.find(function(el) {
                return el.id == n.role_id;
            });            
            self.role_sel = r ? r.id : '';
            
        });
    },
    asyncComputed: {
        atoOptions: { get:async function () {
            var d = await app.loadOptions();
            this.folder_id = d[0].folder_id;
            this.strictroles = d[0].strictroles;
            
            return d;
            }
        },
        roles: async function () {
            var d = await app.getRoles();
            return d;
        },
        userroles: async function () {
            var d = await app.getUserRoles();
            return d;
        }
    },
    methods: {
        changesr: function () {
            console.log('change sr', this.d_strictroles);
            this.strictroles = this.d_strictroles ? 1 : 0;
        },
        save: function () {
            var self = this;
            var dbname = app.dbname;
            // send data to server
            var params = array_merge({
                'operation': 'saveOptions',
                'dbname': dbname,
                'folder_id': this.folder_id,
                'strictroles': this.strictroles,
                'admin': this.isadmin,
                'userId': this.userinfo.ID // app.userInfo.result.ID
            }, BX24.getAuth());
            console.log(params);
            $.ajax({
                url: 'app/maincntr.php',
                type: 'POST',
                dataType: 'json',
                data: params
            }).done(
                    function (resp) {
                        var status = resp.status;
                        if (status === 'success') {
                            optbutton.show = false;
                            app.options[0].strictroles = self.strictroles;
                            app.options[0].folder_id = self.folder_id;
                        } else {
                            console.log('error', resp);
                            self.$dialog.warn(resp);
                        }
                    }).fail(
                    function (e) {
                        self.$dialog.warn(e);
                        console.log(e);
                    });
        },
        set_role() {
            console.log('set_role', this.selectedUser, this.role_sel_id); //?
            var dbname = app.dbname;
            var self = this;
            // send data to server
            var params = array_merge({
                'operation': 'setRole',
                'dbname': dbname,
                'user': this.selectedUser.ID,
                'role': this.role_sel_id
            }, BX24.getAuth());
            $.ajax({
                url: 'app/maincntr.php',
                async: true,
                type: 'POST',
                dataType: 'json',
                data: params}).done(function (data) {
                    console.log('set role ok', data);
                    bus.$emit('user-grid-update', 1);
                    bus.$emit('grid-update', 1);
                }).fail(function (e) {
                    self.$dialog.warn(e);
                    console.log(e);
                });
        },
        cancel() {
            optbutton.show = false;
        }
    }
});

Vue.component('date-picker', vuejsDatepicker);

Vue.component('editormodal', {
    template: '#modal-template'
}); 

Vue.component('mainmodal', {
    template: '#modal-template'
});

Vue.component('archivemodal', {
    template: '#modal-template'
});

Vue.component('newmodal', {
    template: '#modal-template'
});

Vue.component('optmodal', {
    template: '#modal-template'
});

Vue.component('ceditor', {
    template: '#ceditor-template',
    data: function() {
        return {
            content:'',
            iwidth: '32px',
            ifull: false,
            zcurs: 'zoom-in'
        }
    },
    mounted: function() {
        this.load();
    },
    methods: {
        cancel: function () {
            editorbut.show = false;
        },
        load: function () {
            var self = this;
            var dbname = app.dbname;
            // send data to server
            var params = array_merge({
                'operation': 'getGraph',
                'dbname': dbname
            }, BX24.getAuth());
            $.ajax({
                url: 'app/maincntr.php',
                type: 'POST',
                dataType: 'json',
                data: params
            }).done(function (resp) {
                var status = resp.status;
                if (status == 'success') {
                    self.content = JSON.stringify(resp.result, "", 4);
                } else {
                    self.$dialog.warn(resp);
                    console.log(resp);
                }
            }).fail(function (e) {
                console.log(e);
                self.$dialog.warn(e);
            });
        },
        togglew: function() {
                console.log('togglew');
                this.ifull = !this.ifull;
                this.iwidth = this.ifull?'720px':'32px';
                this.zcurs =  this.ifull?'zoom-out':'zoom=in';
        }
    }
});

Vue.component('archivegrid', {
    template: '#archive-template',
    props :{    
    },
    data: function() {
        return {
            show: false,
            records: []
        };
    },
    mounted: function() {
        this.getRecords();
    },
    methods: {
        cancel: function () {
            this.show = false;
            archivebut.show = false;
        },
        getRecords: function () {
            var self = this;
            var dbname = app.dbname;
            // send data to server
            var params = array_merge({
                'operation': 'getArchive',
                'dbname': dbname
            }, BX24.getAuth());
            $.ajax({
                url: 'app/maincntr.php',
                type: 'POST',
                dataType: 'json',
                data: params
            }).done(function (resp) {
                var status = resp.status;
                if (status === 'success') {
                    console.log('getRecords ok', resp.result);
                    self.records = resp.result;
                } else {
                    self.$dialog.warn(resp);
                    console.log(resp);
                }
            }).fail(function (e) {
                self.$dialog.warn(e);
                console.log(e);
            });
        }
    }
});

function vueapp () {   
    
    ddmenu = new Vue({
        data: {
            items: app.cols,
            options: [],
            id: 'dd-menu',
            d_vc: app.col_vis,
            visible: false
        },
        template: '#ddmenu-template',
        mounted:              
            function () {
                var cnt = 0;
                this.items = app.cols.map(i => {
                    return {data:i.data,head:i.head,n:cnt++}
                });
                console.log(this.items)
        },
        
        methods: {
            open: function(e, opts) {
                if(this.visible) {
                    this.close();
                }
                else {
                    console.log('menu open');
                    this.options = opts;
                    this.$mount(e);
                    $('#'+this.id).show();
                    this.visible = true;
                }
            }, 
            close: function() {
                $('#'+this.id).hide();
                //this.$destroy();
                this.visible = false;                
            },
            fl: function(i) {
                //console.log('fl1', i, app.cols);
            },
            click(e, item) {
                var self = this;
                $('#' + self.id).hide();
                self.fl(item.i);
                self.visible = false;
                bus.$emit('grid-update', 1);
                //self.$destroy();
            },
            is_visible: function(d) {
                
            },
            changev(d) {
                
            }            
        }
    });
    
    mainform = new Vue({
        el: '#mainform0',
        data : {
            show: false,
            itemId: '',
            itemState: '',
            gridLine: {}
    },
    methods: {
        test: function() {}
        }
    });

    maingrid = new Vue({
        el: '#maingrid',
        data: {
            show: true,
            searchQuery: '',
            gridColumns: [
                {data:'id', head:'ИД'}, 
                {data:'state', head:'стат', replace:'state',
                    style:'word-wrap: break-word;font-size:70%;max-width:220px;font-weight:bold'}, 
                {data:'vid_zak', head:'вид'}, 
                {data:'deal_cat', head:'направление', replace:'dcl',
                    style:'word-wrap: break-word;font-size:70%;max-width:220px'},
                {data:'author', 
                    head:'автор', replace:'rsl', style:'font-weight:bold',hstyle:''},
                {data:'responsible', head:'исполнитель', replace:'rsl',hstyle:''},
                {data:'resp_role_id', head:'роль', replace:'rrl',hstyle:''},
                {data:'nom_zak', head:'номер'},
                {data:'name_zak', head:'заказ'},
                {data:'zakazchik', head:'заказчик'},
                {data:'nmc', head:'нмц'},
                {data:'link_zak', head:'ссылка'},
                {data:'date_end', head:'Дата'}
            ]
        },
        mounted: function () {
                app.cols = this.gridColumns.map(i => {
                    return {
                        data:i.data,
                        head:i.head
                    }
                }
            );
        }
    });

    newbutton = new Vue({
        el: '#newcard0',
        data: {
            show: false
        },
        methods: {
            click: function (c) {  
                console.log('new click');
                ddmenu.close();
                this.show = c;
            }
        }
    });

    optbutton = new Vue({
        el: '#opt-win',
        data: {
            show: false,
            userinfo: app.userInfo,
            gridColumns: [
                ['ID','id'],
                ['NAME','user'],
                ['role','Role']]
        },
        mounted: function() {
            console.log('opts mounted', app.userInfo);
        },
        computed: {
            disable: function () {
            }            
        },
        methods: {
            click: function (c) {
                ddmenu.close();
                this.show = c;
            }
        }
    });
    
    archivebut = new Vue({
        el: '#archive-win',
        data: {
            show: false
        },
        methods: {
            click: function (c) {
                ddmenu.close();
                this.show = c;
            }
        }
    }); 
    
    editorbut = new Vue({
        el: '#ceditor',
        data: {
            show: false,
            userinfo: app.userInfo
        },
        methods: {
            click: function (c) {
                ddmenu.close();
                this.show = c;
            }
        }        
    });
        
}
/*
BX24.init(function() {
    app.starting = true;
    var p3 = initapp();
    p3.then(
        function(d) {
            
            var s = BX24.getScrollSize();
            console.log('initapp callback', s);
            BX24.resizeWindow(s.scrollWidth, 800, function(s) {
                console.log('resize callback', s);
            });
            vueapp();
        }           
    );
});
*/