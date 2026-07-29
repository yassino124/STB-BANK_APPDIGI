import os

dir_path = "/Users/mohamedyassineouertani/Downloads/stb_mobile/lib"

replacements = {
    "FontWeight.w750": "FontWeight.w700",
    "FontWeight.w850": "FontWeight.w800",
    ".boxShadow(color: AppTheme.electricBlue.withOpacity(0.3), blurRadius: 20)": ""
}

for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.endswith(".dart"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            modified = False
            for target, repl in replacements.items():
                if target in content:
                    content = content.replace(target, repl)
                    modified = True
            
            if modified:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Fixed file: {path}")
