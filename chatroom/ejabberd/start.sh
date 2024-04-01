#!/bin/sh
dockerize -template conf/ejabberd.tmpl:conf/ejabberd.yml

uvicorn main:app --port 8888 --host 0.0.0.0 &
echo "Python Running"

/home/ejabberd/bin/ejabberdctl foreground
echo "Ejabberd Started"