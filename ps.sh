#!/bin/bash

while true
do
  ps -lx | grep "QuickTime Player.app" | grep -v grep
done
