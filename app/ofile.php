<?php

namespace Bitrix24\Disk;


class oFile
{
 private $name;
 private $mime;
 private $content;

 public function __construct($name, $mime=null, $content=null)
 {
// Проверяем, если $content=null, значит в переменной $name - путь к файлу
  if(is_null($content))
  {
// Получаем информацию по файлу (путь, имя и расширение файла)
   $info = pathinfo($name);
// проверяем содержится ли в строке имя файла и можно ли прочитать файл
   if(!empty($info['basename']) && is_readable($name))
    {
     $this->name = $info['basename'];
// Определяем MIME тип файла
     $this->mime = mime_content_type($name);
// Загружаем файл
     $content = file_get_contents($name);
// Проверяем успешно ли был загружен файл
     if($content!==false) $this->content = $content;
       else throw new Exception('Don`t get content - "'.$name.'"');
    } else throw new Exception('Error param');
  } else
     {
// сохраняем имя файла
      $this->name = $name;
// Если не был передан тип MIME пытаемся сами его определить
      if(is_null($mime)) $mime = mime_content_type($name);
// Сохраняем тип MIME файла
      $this->mime = $mime;
// Сохраняем в свойстве класса содержимое файла
      $this->content = $content;
     };
 }

// Метод возвращает имя файла
 public function Name() { return $this->name; }

// Метод возвращает тип MIME
 public function Mime() { return $this->mime; }

// Метод возвращает содержимое файла
 public function Content() { return $this->content; }

};

class BodyPost
 {
//Метод формирования части составного запроса
  public static function PartPost($name, $val)
  {
   $body = 'Content-Disposition: form-data; name="' . $name . '"';
// Проверяем передан ли класс oFile
   if($val instanceof oFile)
    {
// Извлекаем имя файла
     $file = $val->Name();
// Извлекаем MIME тип файла
     $mime = $val->Mime();
// Извлекаем содержимое файла
     $cont = $val->Content();

     $body .= '; filename="' . $file . '"' . "\r\n";
     $body .= 'Content-Type: ' . $mime ."\r\n\r\n";
     $body .= $cont."\r\n";
    } else $body .= "\r\n\r\n".urlencode($val)."\r\n";
   return $body;
  }

// Метод формирующий тело POST запроса из переданного массива
  public static function Get(array $post, $delimiter='-------------0123456789')
  {
   if(is_array($post) && !empty($post))
    {
     $bool = false;
// Проверяем есть ли среди элементов массива файл
     foreach($post as $val) if($val instanceof oFile) {$bool = true; break; };
     if($bool)
      {
       $ret = '';
// Формируем из каждого элемента массива, составное тело POST запроса
       foreach($post as $name=>$val)
        $ret .= '--' . $delimiter. "\r\n". self::PartPost($name, $val);
        $ret .= "--" . $delimiter . "--\r\n";
      } else $ret = http_build_query($post);
    } else throw new \Exception('Error input param!');
   return $ret;
  }
};


?>