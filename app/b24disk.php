<?php

namespace Bitrix24\Disk;

use Bitrix24\Bitrix24Entity;
require_once 'ofile.php';

class Disk extends Bitrix24Entity {

    public function upload($o, $folder_id, $file) {
        $o->log->debug('FILE', $file);
        $res = $this->client->call(
                'disk.folder.uploadFile', ['id' => $folder_id]);
        $res = $res['result'];
        $o->log->debug('disk.folder.uploadFile', $res);
        if (!$res)
            return $res;

        $url = $res['uploadUrl'];
        $filename = $file['tmp_name'];
        $out_name = $file['name'];
        if(!$filename) {
            $o->log->debug('UPLOAD ERROR', ['no TMP NAME!!']);
            return false;
        }
        $res  = $this ->B24upload($url, $filename, $out_name, $o->log);

        return $res;
    }

    public function delete($o, $files) {
        $o->log->debug('FILES to delete', $files);
        foreach($files as $f) {
            $this->client->call(
                'disk.file.markdeleted', ['id' => $f]);
        }
    }
    
    
    public function getChildIdByName($o, $folder_id, $childName) {
        $res = $this->client->call(
                'disk.folder.getchildren', 
                ['id' =>  $folder_id,
                'filter' => [
                    'NAME' => $childName
                ]]
                );
        $o->log->debug('getChildIdByName', [$folder_id]);
        $o->log->debug('getChildIdByName', $res);
        $res = $res['result'];
        if (!$res)
            return false;
        if(isset($res['ID'])) return $res['ID'];

        return false;
    }    
    
    
    public function getChildren($o, $folder_id) {
        $res = $this->client->call(
                'disk.folder.getchildren', ['id' => $folder_id]);
        $res = $res['result'];
        if (!$res)
            return $res;

        return $res;
    }    
    
    protected function B24upload($url, $filename, $out_name, $log) {
        $delimiter = '-------------' . uniqid();

// Формируем объект oFile содержащий файл
        $content = file_get_contents($filename);

        $file = new oFile($out_name, 'application/octet-stream', $content);

// Формируем тело POST запроса
        $post = BodyPost::Get(array('field' => 'text', 'file' => $file), $delimiter);
        $log->debug('here h3 ' . $url);
// Инициализируем  CURL
        $ch = curl_init($url);
        if ($ch === false) {
            $log->error('curl init error');
            return false;
        }
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// Указываем на какой ресурс передаем файл
//curl_setopt($ch, CURLOPT_URL, $url);
// Указываем, что будет осуществляться POST запрос
        curl_setopt($ch, CURLOPT_POST, true);
// Передаем тело POST запроса
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post);

        /* Указываем дополнительные данные для заголовка:
          Content-Type - тип содержимого,
          boundary - разделитель и
          Content-Length - длина тела сообщения */
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: multipart/form-data; boundary=' . $delimiter,
            'Content-Length: ' . strlen($post)));

// Отправляем POST запрос на удаленный Web сервер
        $response = curl_exec($ch);
        $log->debug('here h4 ');
        if ($response === false) {
            $log->debug(curl_error($ch));
            return false;
        } else {

            $response = json_decode($response, true);
            $log->debug('curlresp', $response);
            return isset($response['result']) ? $response['result'] : $response;
        }
    }
}