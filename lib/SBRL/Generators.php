<?php

namespace SBRL;

class Generators {
	
	public static function crypto_secure_id(int $length = 64) { // 64 = 32
        $length = ($length < 4) ? 4 : $length;
        return bin2hex(random_bytes(($length-($length%2))/2));
    }
	
	
}
