<?php

namespace SBRL;

class Generators {
	
	/**
	 * Generates a cryptographically secure random id, as a hex value.
	 * FUTURE: Improve this to return a safe base64 to reduce length.
	 * @param	int	$length	The desired length of id.
	 * @return	string	The generated id.
	 */
	public static function crypto_secure_id(int $length = 64) { // 64 = 32
        $length = ($length < 4) ? 4 : $length;
        return bin2hex(random_bytes(($length-($length%2))/2));
    }
	
	
}
