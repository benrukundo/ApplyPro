#!/bin/bash

# ============================================
# ApplyPro Repository Cleanup Script
# ============================================
# Run this script to remove unnecessary files
# that should not be tracked in Git
# ============================================

echo "🧹 ApplyPro Repository Cleanup"
echo "=============================="
echo ""

# Files to remove from the repository
FILES_TO_REMOVE=(
    # Instruction/Fix files (development notes)
    "instruction*.txt"
    "fix*.txt"
    "feature*.txt"
    "error*.txt"
    
    # Temporary project files
    "project_overview.txt"
    
    # Word document temp files
    "~\$*.docx"
    "~\$*.doc"
    
    # Debug folder
    "debug-files/"
    
    # Request files
    "request*.docx"
    
    # Corrupted filename
    "hboardpage.tsx*"
    
    # Root index.html (if not needed)
    "index.html"
    
    # Backup files
    "*.backup"
    "*.bak"
    "*.ts.backup"
)

echo "📁 Files that will be removed from Git tracking:"
echo ""

for pattern in "${FILES_TO_REMOVE[@]}"; do
    # Find matching files
    files=$(find . -maxdepth 2 -name "$pattern" 2>/dev/null)
    if [ -n "$files" ]; then
        echo "  - $pattern"
        echo "$files" | sed 's/^/      /'
    fi
done

echo ""
echo "⚠️  This will:"
echo "    1. Remove files from Git tracking (git rm --cached)"
echo "    2. NOT delete files from your local disk"
echo "    3. Require you to commit the changes"
echo ""
read -p "Do you want to proceed? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Removing files from Git..."
    
    # Remove instruction files
    git rm --cached instruction*.txt 2>/dev/null || true
    
    # Remove fix files
    git rm --cached fix*.txt 2>/dev/null || true
    
    # Remove feature files
    git rm --cached feature*.txt 2>/dev/null || true
    
    # Remove error files
    git rm --cached error*.txt 2>/dev/null || true
    
    # Remove project overview txt
    git rm --cached project_overview.txt 2>/dev/null || true
    
    # Remove Word temp files
    git rm --cached "~\$*.docx" 2>/dev/null || true
    
    # Remove debug folder
    git rm -r --cached debug-files/ 2>/dev/null || true
    
    # Remove request files
    git rm --cached request*.docx 2>/dev/null || true
    
    # Remove corrupted filename
    git rm --cached "hboardpage.tsx#Uf022 #Uf022C#Uf03aApplyProdebug-filesdashboard-page-backup.txt#Uf022" 2>/dev/null || true
    
    # Remove root index.html
    git rm --cached index.html 2>/dev/null || true
    
    # Remove backup files
    git rm --cached "*.backup" 2>/dev/null || true
    git rm --cached "lib/documentGenerator.ts.backup" 2>/dev/null || true
    
    echo ""
    echo "✅ Files removed from Git tracking!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Review the updated .gitignore file"
    echo "   2. Replace your current .gitignore with the new one"
    echo "   3. Commit the changes:"
    echo ""
    echo "      git add .gitignore"
    echo "      git commit -m 'chore: clean up repo, update .gitignore'"
    echo "      git push"
    echo ""
    echo "🗑️  To delete the files locally (optional):"
    echo "      rm -rf debug-files/"
    echo "      rm instruction*.txt fix*.txt feature*.txt error*.txt"
    echo "      rm project_overview.txt"
    echo ""
else
    echo "❌ Cleanup cancelled."
fi
