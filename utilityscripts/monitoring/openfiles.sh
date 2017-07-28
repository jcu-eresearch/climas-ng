
# function to print a number of | equal to the square root of the arg
graphline() { echo "c = sqrt($1); while (c > 0) { \"|\"; c -= 1 }" | bc; }

# define the process name we're interested in
PROCESS=$1

# get the (list of) process IDs that match that process name
PROCPIDS=`pidof "$PROCESS"`

if [ -n "$PROCPIDS" ]; then

	# set $1, $2, $3 etc to the IDs in the process ID list
	set -- $PROCPIDS

	# assume the first one is the one we want
	PROCPID=$1

	# use lsof and wc to count the number of open files
	FHCOUNT=`lsof -p $PROCPID | wc -l`

	# output some info and the open file handle number plus a nifty graph
	printf '%s %10s pid:%6s files:%6s %s\n' "`date +'%y-%0m-%0d %T'`" "$PROCESS" "$PROCPID" "$FHCOUNT" `graphline $FHCOUNT`

else

	# output some info
	printf '%s %s process not found\n' "`date +'%y-%0m-%0d %T'`" "$PROCESS"

fi

