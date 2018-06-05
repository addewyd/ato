(function () {
    if (!BX24) {
        $('#main').empty();
        document.write('<h1>NO BX24!</h1>');
        
        alert('no BX24');
        return;
    } else {
        BX24.init(function () {
            app.starting = true;
            var p3 = initapp();
            p3.then(
                    function (d) {

                        var s = BX24.getScrollSize();
                        console.log('initapp callback', s);
                        BX24.resizeWindow(s.scrollWidth, 800, function (s) {
                            console.log('resize callback', s);
                        });
                        vueapp();
                    }
            );
        });
    }
    
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
}

application.prototype.loadGraph = function () {
    var params = array_merge({'operation': 'getGraph', 'dbname': app.dbname}, BX24.getAuth());
    console.log(params);
    var self = this;
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'app/maincntr.php',
            type: 'POST',
            dataType: 'json',
            data: params
        }).done(
                function (data) {
                    console.log('resolve graph');
                    self.graph = data.result;
                    resolve(data.result);
                }).fail(
                function (e) {
                    console.log(e);
                    reject(e);
                })
    });
};

application.prototype.getGridDataSync = async function (npage, rcount, role_id, user_id) {
    var dbname = this.dbname;;
    var self = this;
    console.log('ROLEID', role_id);
    var params = array_merge(
            {
                'operation': 'getGridData', 
                'dbname': dbname, 
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
                        reject({error: result});
                    } else
                    {
                        var data = result.data();
                        dbname = data[0].PROPERTY_VALUES.dbname;
                        console.log('resolve dbname', dbname);
                        resolve(dbname)
                    }
                })
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
                    self.userList = data.result;
                    var a = self.userList.result;
                    self.userList2 = a.map(i => {
                        return {ID:i.ID, NAME: i.NAME + ' ' + i.LAST_NAME};
                    });
                    console.log('userList2', self.userList2);
                    resolve(data.result.result);
                }).fail(
                function (e) {
                    console.log('loadUserList error', e);
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
                    reject(['error', e]);
                })
    });
};

application.prototype.getRoles = function () {
    var dbname = app.dbname;
    console.log('getRoles', dbname);
    var params = array_merge({'operation': 'getRoles',
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
                    console.log('resolve roles', data.result);
                    self.roles = data.result;
                    resolve(data.result);
                }).fail(
                function (e) {
                    console.log('RE', e);
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
                    self.userRoles = data.result;
                    resolve(data.result);
                }).fail(
                function (e) {
                    console.log('URERE', e);
                    reject(['error', e]);
                });
    });
};

application.prototype.getAuxList = function(k) {
    if(k == 'dcl') {
        return app.dealCatList;
    }
    else if(k == 'rsl') {
        return app.userList2;  //  not the same
    }
    else if(k == 'rrl') {
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
                        self.dealCatList = data.result[0];  // ??
                        resolve(data.result[0]);
                    }).fail(
                    function (e) {
                        console.log('LDCLE', e);
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

var app = new application();

application.prototype.dates = {
    convert:function(d) {
        // Converts the date in d to a date-object. The input can be:
        //   a date object: returned without modification
        //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
        //   a number     : Interpreted as number of milliseconds
        //                  since 1 Jan 1970 (a timestamp) 
        //   a string     : Any format supported by the javascript engine, like
        //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
        //  an object     : Interpreted as an object with year, month and date
        //                  attributes.  **NOTE** month is 0-11.
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
        // Compare two dates (could be of any type supported by the convert
        // function above) and returns:
        //  -1 : if a < b
        //   0 : if a = b
        //   1 : if a > b
        // NaN : if a or b is an illegal date
        // NOTE: The code inside isFinite does an assignment (=).
        return (
            isFinite(a=this.convert(a).valueOf()) &&
            isFinite(b=this.convert(b).valueOf()) ?
            (a>b)-(a<b) :
            NaN
        );
    },
    inRange:function(d,start,end) {
        // Checks if date in d is between dates in start and end.
        // Returns a boolean or NaN:
        //    true  : if d is between start and end (inclusive)
        //    false : if d is before start or after end
        //    NaN   : if one or more of the dates is illegal.
        // NOTE: The code inside isFinite does an assignment (=).
       return (
            isFinite(d=this.convert(d).valueOf()) &&
            isFinite(start=this.convert(start).valueOf()) &&
            isFinite(end=this.convert(end).valueOf()) ?
            start <= d && d <= end :
            NaN
        );
    }
}


async function initapp() {
    app.dbname = await app.getDbname();
    app.userInfo = await app.getUserInfo();

    app.options = await app.loadOptions();
    console.log('OPTS', app.options);
    app.strictRole = app.options[0].strictroles;
    app.folder_id = app.options[0].folder_id;
    await app.loadUserList();
    
    await app.loadDealCatList();
    await app.getUserRoles();
    await app.getRoles();
    
    var p0 = 
            app.loadGraph();
    return p0;
}

var bus = new Vue;
var optbutton;
var newbutton;
//var atooptions;
//var newcard;
var maingrid;
var optusergrid;
var mainform ;
var messagesbut;
var archivebut;
var editorbut;
var dpicker;

// .......................................................................
    
Vue.component('main-grid', {
    template: '#grid-template',
    props: {
        //data: Array,
        columns: Array,
        filterKey: String
    },
    data: function () {
        var sortOrders = {};
        this.columns.forEach(function (key) {
            sortOrders[key.data] = 1;
        });
        return {
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
        scalc(entry, key) {
            //console.log('entry', entry)
            var trstyle = '';
            var ret = entry[key.data];

            if(key.data === 'date_end') {
                var d = ret;
                var c;
                if(d) {
                    var dt = app.dates.convert(d);
                    if(dt == NaN) {
                        c = NaN;
                    }
                    else {
                        c = app.dates.compare(new Date(), dt);
                    }
                    //console.log('converted: ', dt);
                    
                    if(c > 0) {
                        trstyle = 'background-color:#ffdddd;color:red;';
                    }
                    else if(c == 0) {
                        trstyle = 'background-color:#dffdad;color:brown;';
                        
                    }
                    else if(c == NaN) {
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
            if(key.replace != undefined) {
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
                else if(key.replace === 'rsl') {
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
                        trstyle = 'color:green;'
                    }
                }
                else {
                    
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
            //if() {
               // return;
           // }
            this.npage ++;
            this.gupd();            
        },
        click: function (id, state, entry) {
            console.log('clicked ' + id);
            //console.log('entry ', entry);
            mainform.itemId = id;
            mainform.gridLine = entry;
            mainform.itemState = state;
            mainform.show = false;
            mainform.show = true;
            //bus.$emit('new-entry', entry);
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
            d_inRole: false,
            privatemsg: true,
            whom_selected: '',
            message: '',
            dataUpd: false,
            cmsg: [],
            whom_options: app.userList2,            
            dirty: false,
            rec: this.record,
            admin: app.userInfo.admin,
            userinfo: app.userInfo.result,            
        };
    },
    computed: {
        sObject: function () {
            console.log('sObject called');
            var res = app.graph.states.find(function (el) {
                return el.tr[0] == this.state;
            }, this);

            return res == undefined ? {err: 'state not found'} : res;

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
        }
    },
    mounted: function() {
        this.dirty = false;
        this._inRole = this.inRole();
        var self = this;
        self.cmsg = self.getComments;
        bus.$on('message-saved', function (n) {
            console.log('saved');
            self.message = '';
            self.dataUpd = ! self.dataUpd;
            self.cmsg = self.getComments;  // ??
        });        
    },
    methods: {
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
                        data: params,
                        success: function (resp) {
                            var status = resp.status;
                            // console.log(status, resp.result);
                            self.cmsg = resp.result;
                            resolve(resp.result);
                            if (status == 'success') {
                            } else {
                                console.log('error', resp);
                                reject(resp);
                            }
                        },
                        error: function (e) {
                            console.log(e);
                                reject(e);
                        }
                    }
                );
            });            
        },        
        isResponsible: function() {
            return this.inRole();
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
                                
                                //self.$dialog.alert(resp.status);
                            } else {
                                console.log('error', resp);
                                self.$dialog.alert(resp);
                            }
                        },
                        error: function (e) {
                            console.log(e);
                        }
                    }
            );
        },
        save: function (id, state, so) {
            this.saveandnext0(id, state, so, false, state.resp);
        },

        saveandnext: function (id, state, so, nextresp) {
            this.saveandnext0(id, state, so, true, nextresp);            
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
                'operation': 'saveandnext',
                'dbname': dbname,
                'next': next ? 'next' : 'cur',
                'id': id,
                resp_role_id: nrid,
                'rec': this.rec,
                'author': this.userinfo.ID,
                'state': state,
                'so': so,
                'so_cur': state.tr[0],
                'nextresp': nextresp
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
                                        this.dirty = false;
                                        if(next) {
                                            mainform.show = false;
                                        }
                                    }
                                    else {
                                        console.log('error', resp);
                                        self.$dialog.alert(resp);
                                    }
                                },
                                error: function (e) {
                                    console.log(e);
                                    self.$dialog.alert(e);
                                }
                            }
                    );
                    return;
                }
                console.log('validate errors!');
            });
            // this.$parent.show = false; ?
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
                                bus.$emit('grid-update', 1);
                                this.dirty = false;
                                mainform.show = false;
                            } else {
                                console.log('error', resp);
                                alert(resp);
                            }
                        },
                        error: function (e) {
                            console.log(e);
                        }
                    }
            );            
        },
        cancel() {
            if(this.dirty) {
                alert('some inputs are changed!');
            }
            this.dirty = false;
            mainform.show = false;
        },
        b_count: function () {
            return (this.sObject.tr.length);
        },
        doaction(id, state) {
            console.log('Action ', id, state);
            this.message = state.action;
            this.saveMessage(id, state.tr[0], state.action);
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
            console.log('do nothing')
        
        }
    }

});

Vue.component('newcard-form', {
    template: '#formnew-template',
    data: function () {
        return {
            debug: app.debug,
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
            somefile1_obj: {name: '', size: 0},
            somefile2: '',
            somefile2_obj: {name: '', size: 0}

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
            var self = this;
            var init_state = 1;
            //var role_id = this.resp_role_selected;
            var role_id = app.getStateRoleId(init_state); // state = 1. start
            var data = {
                folder_id: app.folder_id,
                state: init_state, // state:1 !!!!
                author: app.userInfo.ID,
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
                    if (this.somefile1)
                        fdata.append(this.somefile1, $('#' + this.somefile1)[0].files[0]);
                    if (this.somefile2)
                        fdata.append(this.somefile2, $('#' + this.somefile2)[0].files[0]);
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
/// ............................
                                xhr: function ()
                                {
                                    var jqXHR = null;
                                    if (window.ActiveXObject)
                                    {
                                        jqXHR = new window.ActiveXObject("Microsoft.XMLHTTP");
                                    } else
                                    {
                                        jqXHR = new window.XMLHttpRequest();
                                    }
                                    jqXHR.onloadstart = function (e) {
                                        self.emitter('start', e);
                                    };
                                    jqXHR.onloadend = function (e) {
                                        self.emitter('finish', e);
                                    };
                                    //Upload progress
                                    jqXHR.upload.addEventListener("progress", function (evt)
                                    {
                                        if (evt.lengthComputable)
                                        {
                                            var percentComplete = Math.round((evt.loaded * 100) / evt.total);
                                            self.emitter('progress', percentComplete);
                                        }
                                    }, false);
                                    //Download progress
                                    jqXHR.addEventListener("progress", function (evt)
                                    {
                                        if (evt.lengthComputable)
                                        {
                                            var percentComplete = Math.round((evt.loaded * 100) / evt.total);
                                            self.emitter('progress', percentComplete);
                                        }
                                    }, false);

                                    return jqXHR;
                                },
/// ............................
                                success: function (resp) {
                                    var status = resp.status;
                                    if (status == 'success') {
                                        bus.$emit('grid-update', 1);
                                        newbutton.show = false;
                                        //maingrid.show = !maingrid.show;
                                    } else {
                                        console.log('error', resp);
                                        self.$dialog.alert(resp);
                                    }
                                },
                                error: function (e) {
                                    console.log('ajax error', e);
                                    self.$dialog.alert(e);
                                }
                            }
                    );
                    return;
                }
                console.log('validate errors!', this.$validator);
                self.$dialog.alert('validate errors!');
            });
        },
        filesChange(name, files) {
            console.log('FC', name);
            console.log(files[0]);
            if (name === 'somefile1') {
                this.somefile1_obj = files[0];
                this.somefile1 = 'somefile1';
            } else if (name === 'somefile2') {
                this.somefile2_obj = files[0];
                this.somefile2 = 'somefile2';
            } else {

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
        }
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
        changesr: function() {
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
            $.ajax(
                    {
                        url: 'app/maincntr.php',
                        type: 'POST',
                        dataType: 'json',
                        data: params,
                        success: function (resp) {
                            var status = resp.status;
                            if (status == 'success') {
                                optbutton.show = false;
                                
                                app.options[0].strictroles = self.strictroles;
                                app.options[0].folder_id = self.folder_id;

                            } else {
                                console.log('error', resp);
                                self.$dialog.alert(resp);
                            }
                        },
                        error: function (e) {
                            console.log(e);
                        }
                    }
            );
        },
        set_role() {            
            console.log('set_role', this.selectedUser, this.role_sel_id); //?
            var dbname = app.dbname;
            // send data to server
            var params = array_merge({
                'operation': 'setRole',
                'dbname': dbname,
                'user': this.selectedUser.ID,
                'role': this.role_sel_id
            }, BX24.getAuth());
    //console.log(params);
            $.ajax({
                url: 'app/maincntr.php',
                async: true,
                type: 'POST',
                dataType: 'json',
                data: params}).done(
                    function (data) {
                        console.log('set role ok', data);
                        bus.$emit('user-grid-update', 1); 
                        bus.$emit('grid-update', 1);
                }).fail(
                function (e) {
                    
                    console.log(e);
                });                
        },
        cancel() {
            optbutton.show = false;
        }
    }
});

Vue.component('date-picker', vuejsDatepicker);

Vue.component('msgmodal', {
    template: '#modal-template'
});

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
            content:''
        }
    },
    mounted: function() {
        this.load();
    },
    methods: {
        cancel: function() {
            editorbut.show = false;
        },
        load: function() {
            var self = this;
            var dbname = app.dbname;
            // send data to server
            var params = array_merge({
                'operation': 'getGraph',
                'dbname': dbname
            }, BX24.getAuth());
            $.ajax(
                    {
                        url: 'app/maincntr.php',
                        type: 'POST',
                        dataType: 'json',
                        data: params,
                        success: function (resp) {
                            var status = resp.status;
                            if (status == 'success') {
                                self.content = JSON.stringify(resp.result, "", 4);
                            }
                            else {
                                self.$dialog.alert(resp);
                                console.log(resp); 
                            }
                        },
                        error: function (e) {
                            console.log(e);
                                self.$dialog.alert(e);
                        }
                    }
            );
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
        cancel: function() {
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
            $.ajax(
                    {
                        url: 'app/maincntr.php',
                        type: 'POST',
                        dataType: 'json',
                        data: params,
                        success: function (resp) {
                            var status = resp.status;
                            if (status == 'success') {
                                console.log('getRecords ok'); 
                                self.records = resp.result;
                            }
                            else {
                                console.log(resp); 
                            }
                        },
                        error: function (e) {
                            console.log(e);
                        }
                    }
            );
        }
    }
});

Vue.component('msgbody', {
    template: '#msgbody-template',
    props: {
        columns: Array
    },
    data: function () {
        return {
            whom: '',
            msgtext: ''
        };
    },
    mounted: function () {
        var self = this;
        bus.$on('msg-whom', function (n) {
            self.whom = n;
        });
    },
    methods: {
        cancel: function() {
            messagesbut.showMessages = false;
        },
        click: function(e) {
            
            console.log(this.whom, this.msgtext);
            if (this.whom) {
                var dbname = app.dbname;
                // send data to server
                var params = array_merge({
                    'operation': 'sendMsg',
                    'dbname': dbname,
                    'whom': this.whom.ID,
                    'msg': this.msgtext
                }, BX24.getAuth());
                $.ajax(
                        {
                            url: 'app/auxcntr.php',
                            type: 'POST',
                            dataType: 'json',
                            data: params,
                            success: function (resp) {
                                var status = resp.status;
                                if (status == 'success') {
                                    messagesbut.showMessages = false; 
                                }
                            },
                            error: function (e) {
                                console.log(e);
                            }
                        }
                );

                messagesbut.showMessages = false;  // криво
            }
        }
    }

});

function vueapp () {   

    mainform = new Vue({
        el: '#mainform0',
        data : {
            show: false,
            itemId: '',
            itemState: '',
            gridLine: {}
    },
    mounted: function() {
        console.log('mf mount', app.userInfo.admin);  
            //var s = BX24.getScrollSize();
            //BX24.resizeWindow(s.scrollWidth, 800, function(s) {
              //  console.log('resize callback 2', s);
            //});

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
                    style:'word-wrap: break-word;font-size:70%;max-width:220px'}, 
                {data:'vid_zak', head:'вид'}, 
                {data:'deal_cat', head:'направление', replace:'dcl',
                    style:'word-wrap: break-word;font-size:70%;max-width:220px'},
                {data:'author', head:'автор', replace:'rsl',hstyle:''},
                {data:'responsible', head:'исполнитель', replace:'rsl',hstyle:''},
                {data:'resp_role_id', head:'роль', replace:'rrl',hstyle:''},
                {data:'nom_zak', head:'номер'},
                {data:'name_zak', head:'заказ'},
                {data:'zakazchik', head:'заказчик'},
                {data:'nmc', head:'нмц'},
                {data:'link_zak', head:'ссылка'},
                {data:'date_end', head:'Дата'},
                {data:'somefile1', head:'ID файла ТЗ', 
                    style:'text-align:right;width:100px',hstyle:'width:120px'},
                {data:'f1_name', head:'Техзадание', style:'font-size:60%'},
                {data:'somefile2', head:'some file 2 id '},
                {data:'f2_name', head:'some file 2 name'}
            ]
        },
        mounted: function () {

        }
    });

    newbutton = new Vue({
        el: '#newcard0',
        data: {
            show: false
        },
        methods: {
            click: function () {  
                console.log('new click');
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
            click: function (ev) {
            }

        }
    });
    
    messagesbut = new Vue({
        el: '#msg-win',
        data: {
            showMessages: false,
            gridColumns: [
                ['ID','id'],
                ['NAME','user']
            ]
        },
        methods: {
            click: function (ev) {
            }

        }
    });
    
    archivebut = new Vue({
        el: '#archive-win',
        data: {
            show: false
        },
        methods: {
            click: function (ev) {
                console.log('archive click');                
            }
        }
    }); 
    
    editorbut = new Vue({
        el: '#ceditor',
        data: {
            show: false,
            userinfo: app.userInfo,
            content: 'aaa',            
            height: 300
            
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