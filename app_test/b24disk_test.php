<?php

namespace Bitrix24\Disk;

//use Bitrix24\Bitrix24Entity;
require_once 'ofile.php';

class Disk {

    public function upload($o, $folder_id, $file) {
        $o->log->debug('FILE', $file);
        $res = [];
        return $res;
    }

}