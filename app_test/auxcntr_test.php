<?php
mb_internal_encoding("UTF-8");

require __DIR__ . '/../vendor/autoload.php';
require_once '../defines_test.php';
//require_once 'dealcat.php';
require_once 'auxbase_test.php';

/*  WTF with exceptions???
 * 
 br />
<b>Notice</b>:  Undefined index: msg in <b>C:\inetpub\wwwroot\ato\app\auxcntr.php</b> on line <b>72</b><br />
<br />
<b>Fatal error</b>:  Uncaught Error: Class 'Bitrix24\Bitrix24Exception' not found in C:\inetpub\wwwroot\ato\vendor\mesilov\bitrix24-php-sdk\src\classes\im\im.php:32
Stack trace:
#0 C:\inetpub\wwwroot\ato\app\auxcntr.php(72): Bitrix24\Im\Im-&gt;notify('23', NULL)
#1 C:\inetpub\wwwroot\ato\app\auxcntr.php(86): Auxcntr-&gt;manage('sendMsg', Array)
#2 {main}
  thrown in <b>C:\inetpub\wwwroot\ato\vendor\mesilov\bitrix24-php-sdk\src\classes\im\im.php</b> on line <b>32</b><br />
 */
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

// create a log channel
$log = new Logger('aux');
$log->pushHandler(new StreamHandler(LOG_AUX, Logger::DEBUG));
$log->debug('start 2', [HTTP_HOST]); // 94.181.80.240 (cry)

class Auxcntr extends AuxBase {

    public function returnResult($answer) {

        ob_start();
        ob_end_clean();
        Header('Cache-Control: no-cache');
        Header('Pragma: no-cache');
        header('Content-type: application/json; charset=UTF-8');
        echo json_encode($answer);
    }
    
    public function manage($operation, $params) {
        $this->log->debug('operation', [$operation]);
        switch ($operation) {
            
            case 'sendMsg':
                $res = '';
                $status = '';
                $cmt = '';
                $res = array($r); //??
                $status = 'success';
                break;                
        }
        $this->returnResult(array('status' => $status, 'result' => $res, 'cmt' => $cmt));
    }
    
};
$log -> debug('req', $_REQUEST);
$manager = new Auxcntr($log, $_REQUEST);
//echo json_encode(array('status' => 'ok', 'result' => $_REQUEST, 'cmt' => $log));
if (!empty($_REQUEST) && isset($_REQUEST['operation'])) {
    $manager->manage($_REQUEST['operation'], $_REQUEST);
}
?>
