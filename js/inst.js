(function () {
     var getClass = function (object) {
       return Object.prototype.toString.call(object).slice(8, -1);
     };
     window.makeid = function (n) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < n; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
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

function instapp() {
    //this.dbname = '';
}

instapp.prototype.prepareEntity = function(new_dbname) {
    var batch = [];
    batch.push(['entity.add', 
        {'ENTITY': 'Options', 'NAME': 'Options', 'ACCESS': {U1:'W',AU:'R'}}]);
    batch.push(['entity.update', {'ENTITY': 'Options', 'ACCESS': {AU: 'W'}}]);
    batch.push(['entity.item.property.add', 
        {ENTITY: 'Options', 
            PROPERTY: 'dbname', NAME: 'dbname', TYPE: 'S'}]); 
    batch.push(['entity.item.add', {
	ENTITY: 'Options',
	DATE_ACTIVE_FROM: new Date(),
	DETAIL_PICTURE: '',
	NAME: 'dbname',
	PROPERTY_VALUES: {
		dbname: new_dbname
	}	
        }]);
    return batch;
}


instapp.prototype.init = function() {
    var curapp = this;
    BX24.init(function(){
        console.log('init');
        
       // curapp.dbname = 'ato';
    });
}

instapp.prototype.createdb = function(dbname, ai, ac) {
var params = array_merge({'operation': 'createdb', 
    'dbname': dbname, 'ai':ai, 'ac':ac}, BX24.getAuth());
    console.log(params);
    $.ajax({url:'app/instcntr.php', type:'POST',data:params, dataType:'json',
        success:function(data){
            console.log(data);
        //var answer = JSON.parse(data);
            console.log(data['result']);
            BX24.installFinish();
    },
        error: function(e){ console.log('ajax createdb',e );}
    })    
    
}

instapp.prototype.install = function(ai, asc) {
    var curapp = this;
    var dbname = 'ato_' + makeid(6);
    console.log('inst', ai, asc, dbname);
    var ar = curapp.prepareEntity(dbname);
    BX24.callBatch(ar,     
        function (result) {        
            // check saving of rating users
            BX24.callMethod('entity.item.get', {
                ENTITY: 'Options',
                SORT: {DATE_ACTIVE_FROM: 'ASC'}
                },                 
                function (result) {
                
                    if (result.error()) {                      
                        console.error(result.error());
                    }
                    else
                    {
                        var res = result;
                        console.log('ent', res);
                        curapp.createdb(dbname,ai,asc);
                       // ok
                    }
                
                }
            );
    }); 
};

Vue.component('inst', {
    template: '#inst-template',
    data: function() {
        return {
            app_id: "",
            app_secret_code: ""
        }
    },
    methods: {
        install: function(event) {
            app.install(this.app_id, this.app_secret_code);
        }
    }
  }
);

var app = new instapp();


var inst = new Vue({
    el: "#inst-i",
    data: {msg: "msg"}
})
