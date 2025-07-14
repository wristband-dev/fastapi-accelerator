#!/bin/bash

# Script to run Terraform commands with the config file

if [ "$1" == "init" ]; then
  terraform init
else
  terraform "$@" -var-file="config.tfvars"
fi 