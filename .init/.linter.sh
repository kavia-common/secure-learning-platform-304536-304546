#!/bin/bash
cd /home/kavia/workspace/code-generation/secure-learning-platform-304536-304546/react_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

