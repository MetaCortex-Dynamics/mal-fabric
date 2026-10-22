@echo off
set TEMP=D:\Dev\flag-world-first-tick-020\compiler_tmp
set TMP=D:\Dev\flag-world-first-tick-020\compiler_tmp
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
if errorlevel 1 exit /b %errorlevel%
"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.2\bin\nvcc.exe" -std=c++17 -arch=sm_86 -O2 -o block_iterative_small.exe block_iterative_small.cu
if errorlevel 1 exit /b %errorlevel%
"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.2\bin\nvcc.exe" -std=c++17 -arch=sm_86 -O2 -o block_iterative_full.exe block_iterative_full.cu
exit /b %errorlevel%
