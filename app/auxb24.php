<?php
require_once 'auxbase.php';

class Auxb24 extends AuxBase {

    public function sendMsg($userid, $msg) {
        $im = new \Bitrix24\Im\Im($this->obB24App);
        //$message = 'You have got responsibilirty for the ato record ' .
          //  json_encode($data);
        $r = $im ->notify($userid, $msg);
        $this -> log -> debug('MESSAGE', [$userid, $r]);
    }
    

};