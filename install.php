<?php
require __DIR__ . '/vendor/autoload.php';
require_once("db.php");


use Monolog\Logger;
use Monolog\Handler\StreamHandler;

?>
<!DOCTYPE html>
<html>
    <head>
            <link rel="stylesheet" href="css/atostyle.css" />
</head>
<body>
    <div id="inst-i">
<inst>
    
</inst> 
    </div>
    
<script type="text/x-template" id="inst-template"> 
    <div>
    <p>
    <label for="app-id">app id</label>
    <input id="app-id" v-model="app_id"/>
    </p>
    <p>
    <label for="app-secret-code">app secret code</label>
    <input id="app-secret-code" v-model="app_secret_code"/>
    </p>
    <div id="inst-i-b">        
        <button v-on:click="install">Установить</button>
    </div>
    </div>
</script>

<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script type="text/javascript" src="js/vue.js"></script>  
<script src="//api.bitrix24.com/api/v1/"></script>
<script type="text/javascript" src="js/inst.js"></script>  


<script>
    app.init();
</script>

</body>
</html>

