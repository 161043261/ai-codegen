# AI Codegen

```bash
git fetch origin
git checkout -b dev origin/dev
```

.git/hooks/pre-commit

```bash
#!/bin/sh
echo "Running code formatter..."

mvn com.spotify.fmt:fmt-maven-plugin:format -q

if [ $? -ne 0 ]; then
    echo "Code formatting failed."
    exit 1
fi

git add -u

echo "Code formatting completed."
exit 0
```
