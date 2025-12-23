@echo off
REM ============================================
REM ApplyPro Repository Cleanup Script (Windows)
REM ============================================
REM Run this in your ApplyPro project folder
REM ============================================

echo.
echo ========================================
echo   ApplyPro Repository Cleanup (Windows)
echo ========================================
echo.

echo This script will remove unnecessary files from Git tracking.
echo Files will NOT be deleted from your disk.
echo.
pause

echo.
echo Removing instruction files from Git...
git rm --cached instruction*.txt 2>nul
git rm --cached instruction2.txt 2>nul
git rm --cached instruction3.txt 2>nul
git rm --cached instruction20.txt 2>nul
git rm --cached instruction21.txt 2>nul
git rm --cached instruction22.txt 2>nul
git rm --cached instruction23.txt 2>nul
git rm --cached instruction24.txt 2>nul
git rm --cached instruction25.txt 2>nul
git rm --cached instruction26.txt 2>nul
git rm --cached instruction27.txt 2>nul

echo Removing fix files from Git...
git rm --cached fix*.txt 2>nul
git rm --cached fix1.txt 2>nul
git rm --cached fix2.txt 2>nul
git rm --cached fix3.txt 2>nul
git rm --cached fix4.txt 2>nul
git rm --cached fix5.txt 2>nul
git rm --cached fix6.txt 2>nul
git rm --cached fix7.txt 2>nul
git rm --cached fix8.txt 2>nul
git rm --cached fix9.txt 2>nul
git rm --cached fix10.txt 2>nul
git rm --cached fix11.txt 2>nul
git rm --cached fix12.txt 2>nul
git rm --cached fix13.txt 2>nul
git rm --cached fix14.txt 2>nul
git rm --cached fix15.txt 2>nul

echo Removing feature files from Git...
git rm --cached feature1.txt 2>nul
git rm --cached feature2.txt 2>nul

echo Removing error files from Git...
git rm --cached error_vercel1.txt 2>nul

echo Removing project_overview.txt from Git...
git rm --cached project_overview.txt 2>nul

echo Removing debug-files folder from Git...
git rm -r --cached debug-files 2>nul

echo Removing Word temp files from Git...
git rm --cached "~$gh Priority FEATURES.docx" 2>nul
git rm --cached "~$quest1.docx" 2>nul

echo Removing request files from Git...
git rm --cached request1.docx 2>nul

echo Removing backup files from Git...
git rm --cached "lib/documentGenerator.ts.backup" 2>nul

echo Removing index.html from Git...
git rm --cached index.html 2>nul

echo.
echo ========================================
echo   Cleanup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Replace .gitignore with the new version
echo   2. Run: git add .gitignore
echo   3. Run: git commit -m "chore: clean up repo, update gitignore"
echo   4. Run: git push
echo.
echo Optional - Delete files locally:
echo   del instruction*.txt fix*.txt feature*.txt error*.txt
echo   del project_overview.txt
echo   rmdir /s /q debug-files
echo.
pause
