restart:
	 -killall charter
	 sleep 1
	 ./charter >charter.log 2>&1 &
