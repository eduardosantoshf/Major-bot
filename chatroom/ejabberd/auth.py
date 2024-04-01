#!/usr/bin/python

import sys, logging, struct


sys.stderr = open('/var/log/ejabberd/extauth_err.log', 'a')
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(levelname)s %(message)s',
                    filename='/var/log/ejabberd/extauth.log',
                    filemode='a')

logging.info('extauth script started, waiting for ejabberd requests')

class EjabberdInputError(Exception):
    def __init__(self, value):
        self.value = value
    def __str__(self):
        return repr(self.value)

def ejabberd_in():
	logging.info("trying to read 2 bytes from ejabberd:")

	input_length = sys.stdin.buffer.read(2)

	if len(input_length) != 2:
		logging.info("ejabberd sent us wrong things!")
		raise EjabberdInputError('Wrong input from ejabberd!')

	logging.info('got 2 bytes via stdin: %s'%input_length)

	(size,) = struct.unpack('>h', input_length)
	logging.info('size of data: %i'%size)

	income=sys.stdin.read(size).split(':', 3)
	logging.info("incoming data: %s"%income)

	return income


def ejabberd_out(bool):
	logging.info("Ejabberd gets: %s" % bool)

	token = genanswer(bool)
    
	sys.stdout.buffer.write(token)
	sys.stdout.buffer.flush()


def genanswer(bool):
	answer = 0
	if bool:
		answer = 1
	token = struct.pack('>hh', 2, answer)
	return token

def isuser(user, host):
	#Code for verification of the user existence
	return True

def auth(user, host, password):
	#Code for user authentication
	return True

def setpass(user, host, password):
	return False

def tryregister(user, host, password):
	return False

def removeuser(user, host):
    return False

def removeuser3(user, host, password):
	return False

exitcode=0

while True:
	logging.info("start of infinite loop")

	try:
		ejab_request = ejabberd_in()
	except EOFError:
		break
	except Exception as e:
		logging.exception("Exception occured while reading stdin")
		raise

	logging.info('operation: %s' % (":".join(ejab_request)))

	op_result = False
	try:
		if ejab_request[0] == "auth":
			op_result = auth(ejab_request[1], ejab_request[2], ejab_request[3])
		elif ejab_request[0] == "isuser":
			op_result = isuser(ejab_request[1], ejab_request[2])
		elif ejab_request[0] == "setpass":
			op_result = setpass(ejab_request[1], ejab_request[2], ejab_request[3])
		elif ejab_request[0] == "tryregister":
			op_result = tryregister(ejab_request[1], ejab_request[2], ejab_request[3])
		elif ejab_request[0] == "removeuser":
			op_result = removeuser(ejab_request[1], ejab_request[2])
		elif ejab_request[0] == "removeuser3":
			op_result = removeuser3(ejab_request[1], ejab_request[2], ejab_request[3])
	except Exception:
		logging.exception("Exception occured")

	ejabberd_out(op_result)
	logging.info("successful" if op_result else "unsuccessful")

logging.info("end of infinite loop")
logging.info('extauth script terminating')
sys.exit(exitcode)