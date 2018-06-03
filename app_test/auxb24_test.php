<?php
require_once 'auxbase_test.php';

class Auxb24 extends AuxBase {

    public function sendMsg($userid, $msg) {
        $this -> log -> debug('MESSAGE', [$userid, $r]);
    }
    

};